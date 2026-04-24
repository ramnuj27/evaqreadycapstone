import { useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    createOperatorScanRecord,
    loadOperatorScanRecords,
    loadOperatorSyncSettings,
    OPERATOR_LOCAL_STORAGE_EVENT,
    OPERATOR_RECORDS_STORAGE_KEY,
    OPERATOR_SETTINGS_STORAGE_KEY,
    persistOperatorModuleState,
    summarizeOperatorRecords,
    syncOperatorRecords,
    updateOperatorScanAttendance as updateLocalOperatorScanAttendance,
} from '@/lib/operator-module';
import type { OperatorScanResult } from '@/lib/operator-module';
import {
    store as storeOperatorScan,
    sync as syncOperatorScans,
    update as updateOperatorScan,
} from '@/routes/operator-scans';
import type {
    OperatorHouseholdMember,
    OperatorModuleData,
    OperatorRosterEntry,
    OperatorScanRecord,
    OperatorScanType,
    OperatorSyncSettings,
} from '@/types/operator';

type OperatorClientState = {
    isOnline: boolean;
    records: OperatorScanRecord[];
    settings: OperatorSyncSettings;
};

type StoreScanForm = {
    attendee_refs: string[] | null;
    evacuation_center_name: string;
    payload: string;
    scanned_at: string;
    type: OperatorScanType;
};

type StoreScanResponse = {
    id: number;
    record: {
        address: string | null;
        attendee_refs: string[];
        barangay: string;
        evacuation_center_name: string | null;
        household_code: string;
        household_members: OperatorHouseholdMember[];
        household_name: string;
        name: string;
        payload: string;
        scanned_at: string | null;
        type: OperatorScanType;
    };
    synced_at: string;
};

type SyncScanForm = {
    records: Array<{
        attendee_refs: string[] | null;
        evacuation_center_name: string;
        payload: string;
        scanned_at: string;
        type: OperatorScanType;
    }>;
};

type SyncScanResponse = {
    count: number;
    records?: StoreScanResponse['record'][];
    synced_at: string;
};

type UpdateAttendanceForm = {
    attendee_refs: string[];
};

type UpdateAttendanceResponse = {
    id: number;
    record: StoreScanResponse['record'];
    synced_at: string;
};

type SyncResult = {
    count: number;
    message: string;
    ok: boolean;
};

type AttendanceSaveResult =
    | {
          message: string;
          ok: true;
          record: OperatorScanRecord;
      }
    | {
          message: string;
          ok: false;
      };

type ServerSyncResult =
    | {
          id: number;
          ok: true;
          record: StoreScanResponse['record'];
          syncedAt: string;
      }
    | {
          message: string;
          ok: false;
          shouldQueue: boolean;
      };

type PendingServerSyncResult =
    | {
          count: number;
          ok: true;
          records: StoreScanResponse['record'][];
          syncedAt: string;
      }
    | {
          message: string;
          ok: false;
          shouldQueue: boolean;
      };

type AttendanceServerUpdateResult =
    | {
          id: number;
          ok: true;
          record: StoreScanResponse['record'];
          syncedAt: string;
      }
    | {
          message: string;
          ok: false;
      };

function initializeClientState(): OperatorClientState {
    return {
        isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
        records: loadOperatorScanRecords(),
        settings: loadOperatorSyncSettings(),
    };
}

function firstError(errors: Record<string, unknown>): string | null {
    for (const value of Object.values(errors)) {
        if (Array.isArray(value) && typeof value[0] === 'string') {
            return value[0];
        }

        if (typeof value === 'string') {
            return value;
        }
    }

    return null;
}

function pendingRecords(records: OperatorScanRecord[]): OperatorScanRecord[] {
    return records.filter((record) => record.syncStatus === 'Pending Sync');
}

function createLocalRecordId(): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `operator-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function centerNameForBarangay(
    operatorModule: OperatorModuleData,
    barangay: string,
): string {
    const trimmedBarangay = barangay.trim();

    if (trimmedBarangay === '') {
        return 'Unassigned Center';
    }

    return (
        operatorModule.centers.find(
            (center) => center.barangay === trimmedBarangay,
        )?.name ?? `${trimmedBarangay} Evacuation Center`
    );
}

function normalizedAttendeeRefs(attendeeRefs: string[]): string[] {
    return attendeeRefs
        .map((reference) => reference.trim())
        .filter(
            (reference, index, references) =>
                reference !== '' &&
                references.findIndex(
                    (candidate) =>
                        candidate.toUpperCase() === reference.toUpperCase(),
                ) === index,
        );
}

function serverRecordToEntry(
    operatorModule: OperatorModuleData,
    record: StoreScanResponse['record'],
): OperatorRosterEntry {
    return {
        address: record.address,
        barangay: record.barangay,
        evacuationCenter:
            record.evacuation_center_name ??
            centerNameForBarangay(operatorModule, record.barangay),
        household: record.household_name,
        householdCode: record.household_code,
        id: `household-${record.household_code}`,
        members: record.household_members,
        name: record.name,
        note: 'Registered household QR is ready for operator scanning.',
        qrReference: record.household_code,
        role: 'Household QR',
        status: 'Registered',
    };
}

function syncedRecordFromServer(
    operatorModule: OperatorModuleData,
    record: StoreScanResponse['record'],
    recordId: string,
    serverId: number | null,
): OperatorScanRecord {
    return {
        address: record.address,
        attendeeRefs: record.attendee_refs,
        barangay: record.barangay,
        center:
            record.evacuation_center_name ??
            centerNameForBarangay(operatorModule, record.barangay),
        householdCode: record.household_code,
        householdMembers: record.household_members,
        id: recordId,
        name: record.name,
        qrReference: record.household_code,
        scannedAt: record.scanned_at ?? new Date().toISOString(),
        serverId,
        sourcePayload: record.payload,
        syncStatus: 'Synced',
        type: record.type,
    };
}

export function useOperatorModule(operatorModule: OperatorModuleData) {
    const [clientState, setClientState] = useState<OperatorClientState>(() =>
        initializeClientState(),
    );
    const clientStateRef = useRef(clientState);
    const storeValidationMessageRef = useRef<string | null>(null);
    const syncValidationMessageRef = useRef<string | null>(null);
    const attendanceValidationMessageRef = useRef<string | null>(null);
    const { post: postScan, setData: setStoreScanData } = useHttp<
        StoreScanForm,
        StoreScanResponse
    >({
        attendee_refs: null,
        evacuation_center_name: '',
        payload: '',
        scanned_at: '',
        type: 'IN',
    });
    const { post: postSyncScans, setData: setSyncScanData } = useHttp<
        SyncScanForm,
        SyncScanResponse
    >({
        records: [],
    });
    const { patch: patchScanAttendance, setData: setAttendanceData } = useHttp<
        UpdateAttendanceForm,
        UpdateAttendanceResponse
    >({
        attendee_refs: [],
    });

    useEffect(() => {
        clientStateRef.current = clientState;
    }, [clientState]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const syncFromStorage = () => {
            setClientState(initializeClientState());
        };

        const handleStorage = (event: StorageEvent) => {
            if (
                event.key === null ||
                event.key === OPERATOR_RECORDS_STORAGE_KEY ||
                event.key === OPERATOR_SETTINGS_STORAGE_KEY
            ) {
                syncFromStorage();
            }
        };

        const handleOnline = () => {
            setClientState((currentState) => ({
                ...currentState,
                isOnline: true,
            }));
        };

        const handleOffline = () => {
            setClientState((currentState) => ({
                ...currentState,
                isOnline: false,
            }));
        };

        window.addEventListener(OPERATOR_LOCAL_STORAGE_EVENT, syncFromStorage);
        window.addEventListener('storage', handleStorage);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener(
                OPERATOR_LOCAL_STORAGE_EVENT,
                syncFromStorage,
            );
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const summary = useMemo(
        () => summarizeOperatorRecords(clientState.records),
        [clientState.records],
    );

    const pushRecordToServer = useCallback(
        async (record: {
            attendeeRefs: string[] | null;
            evacuationCenterName: string;
            payload: string;
            scannedAt: string;
            type: OperatorScanType;
        }): Promise<ServerSyncResult> => {
            storeValidationMessageRef.current = null;
            setStoreScanData({
                attendee_refs: record.attendeeRefs,
                evacuation_center_name: record.evacuationCenterName,
                payload: record.payload,
                scanned_at: record.scannedAt,
                type: record.type,
            });

            try {
                const response = await postScan(storeOperatorScan.url(), {
                    onError: (errors) => {
                        storeValidationMessageRef.current = firstError(errors);
                    },
                });

                return {
                    id: response.id,
                    ok: true,
                    record: response.record,
                    syncedAt: response.synced_at,
                };
            } catch {
                if (storeValidationMessageRef.current !== null) {
                    return {
                        message: storeValidationMessageRef.current,
                        ok: false,
                        shouldQueue: false,
                    };
                }

                return {
                    message:
                        'Scan saved locally. Sync it once the connection is stable.',
                    ok: false,
                    shouldQueue: true,
                };
            }
        },
        [postScan, setStoreScanData],
    );

    const syncPendingWithServer = useCallback(
        async (
            records: OperatorScanRecord[],
        ): Promise<PendingServerSyncResult> => {
            syncValidationMessageRef.current = null;
            const sortedRecords = [...records].sort(
                (left, right) =>
                    new Date(left.scannedAt).getTime() -
                    new Date(right.scannedAt).getTime(),
            );

            setSyncScanData({
                records: sortedRecords.map((record) => ({
                    attendee_refs: record.attendeeRefs,
                    evacuation_center_name: record.center,
                    payload: record.sourcePayload,
                    scanned_at: record.scannedAt,
                    type: record.type,
                })),
            });

            try {
                const response = await postSyncScans(syncOperatorScans.url(), {
                    onError: (errors) => {
                        syncValidationMessageRef.current = firstError(errors);
                    },
                });

                return {
                    count: response.count,
                    ok: true,
                    records: response.records ?? [],
                    syncedAt: response.synced_at,
                };
            } catch {
                if (syncValidationMessageRef.current !== null) {
                    return {
                        message: syncValidationMessageRef.current,
                        ok: false,
                        shouldQueue: false,
                    };
                }

                return {
                    message:
                        'Unable to reach the server right now. Pending records stayed on this device.',
                    ok: false,
                    shouldQueue: true,
                };
            }
        },
        [postSyncScans, setSyncScanData],
    );

    const saveAttendanceToServer = useCallback(
        async (
            record: OperatorScanRecord,
            attendeeRefs: string[],
        ): Promise<AttendanceServerUpdateResult> => {
            if (record.serverId === null) {
                return {
                    message:
                        'This synced scan can no longer be updated from this device.',
                    ok: false,
                };
            }

            attendanceValidationMessageRef.current = null;
            setAttendanceData({
                attendee_refs: attendeeRefs,
            });

            try {
                const response = await patchScanAttendance(
                    updateOperatorScan.url(record.serverId),
                    {
                        onError: (errors) => {
                            attendanceValidationMessageRef.current =
                                firstError(errors);
                        },
                    },
                );

                return {
                    id: response.id,
                    ok: true,
                    record: response.record,
                    syncedAt: response.synced_at,
                };
            } catch {
                return {
                    message:
                        attendanceValidationMessageRef.current ??
                        'Unable to save member tagging right now.',
                    ok: false,
                };
            }
        },
        [patchScanAttendance, setAttendanceData],
    );

    const syncNow = useCallback(async (): Promise<SyncResult> => {
        const currentState = clientStateRef.current;

        if (!currentState.isOnline) {
            return {
                count: 0,
                message:
                    'Device is offline. Reconnect before syncing pending records.',
                ok: false,
            };
        }

        const queuedRecords = pendingRecords(currentState.records);

        if (queuedRecords.length === 0) {
            return {
                count: 0,
                message: 'Everything is already synced.',
                ok: true,
            };
        }

        const syncResult = await syncPendingWithServer(queuedRecords);

        if (!syncResult.ok) {
            return {
                count: 0,
                message: syncResult.message,
                ok: false,
            };
        }

        const sortedQueuedRecords = [...queuedRecords].sort(
            (left, right) =>
                new Date(left.scannedAt).getTime() -
                new Date(right.scannedAt).getTime(),
        );
        const syncedRecords = sortedQueuedRecords.map((record, index) => {
            const syncedRecord = syncResult.records[index];

            return {
                localId: record.id,
                record:
                    syncedRecord === undefined
                        ? ({
                              ...record,
                              syncStatus: 'Synced',
                          } satisfies OperatorScanRecord)
                        : syncedRecordFromServer(
                              operatorModule,
                              syncedRecord,
                              record.id,
                              null,
                          ),
            };
        });
        const nextSyncState = syncOperatorRecords(
            currentState.records,
            syncedRecords,
            syncResult.syncedAt,
        );
        const nextState = {
            ...currentState,
            records: nextSyncState.records,
            settings: {
                ...currentState.settings,
                lastSyncAt: nextSyncState.settings.lastSyncAt,
            },
        };

        persistOperatorModuleState(nextState.records, nextState.settings);
        setClientState(nextState);

        return {
            count: queuedRecords.length,
            message:
                queuedRecords.length === 1
                    ? '1 record synced successfully.'
                    : `${queuedRecords.length} records synced successfully.`,
            ok: true,
        };
    }, [operatorModule, syncPendingWithServer]);

    useEffect(() => {
        if (
            !clientState.isOnline ||
            !clientState.settings.autoSync ||
            pendingRecords(clientState.records).length === 0
        ) {
            return;
        }

        void syncNow();
    }, [
        clientState.isOnline,
        clientState.records,
        clientState.settings.autoSync,
        syncNow,
    ]);

    const recordScan = useCallback(
        async (
            payload: string,
            type: OperatorScanType,
            evacuationCenterName: string,
        ): Promise<OperatorScanResult> => {
            const currentState = clientStateRef.current;
            const localResult = createOperatorScanRecord(
                operatorModule,
                currentState.records,
                payload,
                type,
                evacuationCenterName,
            );

            if (!localResult.ok) {
                if (localResult.code !== 'invalid' || !currentState.isOnline) {
                    return localResult;
                }

                const liveScanResult = await pushRecordToServer({
                    attendeeRefs: null,
                    evacuationCenterName,
                    payload: payload.trim(),
                    scannedAt: new Date().toISOString(),
                    type,
                });

                if (!liveScanResult.ok) {
                    return {
                        code: 'invalid',
                        message: liveScanResult.shouldQueue
                            ? 'This resident is not yet loaded on this device. Reconnect and try the scan again so the latest roster can be verified.'
                            : liveScanResult.message,
                        ok: false,
                    };
                }

                const persistedRecord = syncedRecordFromServer(
                    operatorModule,
                    liveScanResult.record,
                    createLocalRecordId(),
                    liveScanResult.id,
                );
                const nextState = {
                    ...currentState,
                    records: [persistedRecord, ...currentState.records],
                    settings: {
                        ...currentState.settings,
                        lastSyncAt: liveScanResult.syncedAt,
                    },
                };

                persistOperatorModuleState(
                    nextState.records,
                    nextState.settings,
                );
                setClientState(nextState);

                return {
                    entry: serverRecordToEntry(
                        operatorModule,
                        liveScanResult.record,
                    ),
                    ok: true,
                    record: persistedRecord,
                };
            }

            if (!currentState.isOnline || !currentState.settings.autoSync) {
                const queuedState = {
                    ...currentState,
                    records: [localResult.record, ...currentState.records],
                };

                persistOperatorModuleState(
                    queuedState.records,
                    queuedState.settings,
                );
                setClientState(queuedState);

                return localResult;
            }

            const syncResult = await pushRecordToServer({
                attendeeRefs: localResult.record.attendeeRefs,
                evacuationCenterName: localResult.record.center,
                payload: localResult.record.sourcePayload,
                scannedAt: localResult.record.scannedAt,
                type: localResult.record.type,
            });

            if (!syncResult.ok && !syncResult.shouldQueue) {
                return {
                    code: 'invalid',
                    message: syncResult.message,
                    ok: false,
                };
            }

            const persistedRecord = syncResult.ok
                ? syncedRecordFromServer(
                      operatorModule,
                      syncResult.record,
                      localResult.record.id,
                      syncResult.id,
                  )
                : ({
                      ...localResult.record,
                      syncStatus: 'Pending Sync',
                  } satisfies OperatorScanRecord);
            const nextState = {
                ...currentState,
                records: [persistedRecord, ...currentState.records],
                settings: {
                    ...currentState.settings,
                    lastSyncAt: syncResult.ok
                        ? syncResult.syncedAt
                        : currentState.settings.lastSyncAt,
                },
            };

            persistOperatorModuleState(nextState.records, nextState.settings);
            setClientState(nextState);

            return {
                ...localResult,
                message: syncResult.ok ? undefined : syncResult.message,
                record: persistedRecord,
            };
        },
        [operatorModule, pushRecordToServer],
    );

    const saveScanAttendance = useCallback(
        async (
            recordId: string,
            attendeeRefs: string[],
        ): Promise<AttendanceSaveResult> => {
            const normalizedRefs = normalizedAttendeeRefs(attendeeRefs);

            const currentState = clientStateRef.current;
            const record = currentState.records.find(
                (currentRecord) => currentRecord.id === recordId,
            );

            if (record === undefined) {
                return {
                    message:
                        'The selected scan record is no longer available on this device.',
                    ok: false,
                };
            }

            if (record.syncStatus === 'Pending Sync') {
                const nextRecords = updateLocalOperatorScanAttendance(
                    currentState.records,
                    recordId,
                    normalizedRefs,
                );
                const updatedRecord =
                    nextRecords.find(
                        (currentRecord) => currentRecord.id === recordId,
                    ) ?? {
                        ...record,
                        attendeeRefs: normalizedRefs,
                    };
                const nextState = {
                    ...currentState,
                    records: nextRecords,
                };

                persistOperatorModuleState(
                    nextState.records,
                    nextState.settings,
                );
                setClientState(nextState);

                return {
                    message:
                        normalizedRefs.length === 0
                            ? 'No members were checked. This scan will mark the household members as missing after sync.'
                            : 'Family tagging saved on this device and will sync with the scan record.',
                    ok: true,
                    record: updatedRecord,
                };
            }

            if (!currentState.isOnline) {
                return {
                    message:
                        'Reconnect first before updating member tagging for a synced scan.',
                    ok: false,
                };
            }

            const serverUpdateResult = await saveAttendanceToServer(
                record,
                normalizedRefs,
            );

            if (!serverUpdateResult.ok) {
                return serverUpdateResult;
            }

            const updatedRecord = syncedRecordFromServer(
                operatorModule,
                serverUpdateResult.record,
                record.id,
                serverUpdateResult.id,
            );
            const nextState = {
                ...currentState,
                records: currentState.records.map((currentRecord) =>
                    currentRecord.id === record.id
                        ? updatedRecord
                        : currentRecord,
                ),
                settings: {
                    ...currentState.settings,
                    lastSyncAt: serverUpdateResult.syncedAt,
                },
            };

            persistOperatorModuleState(nextState.records, nextState.settings);
            setClientState(nextState);

            return {
                message:
                    normalizedRefs.length === 0
                        ? 'No members were checked. The household members are now marked as missing.'
                        : 'Family tagging saved successfully.',
                ok: true,
                record: updatedRecord,
            };
        },
        [operatorModule, saveAttendanceToServer],
    );

    const setAutoSync = useCallback((enabled: boolean): void => {
        const currentState = clientStateRef.current;
        const nextState = {
            ...currentState,
            settings: {
                ...currentState.settings,
                autoSync: enabled,
            },
        };

        persistOperatorModuleState(nextState.records, nextState.settings);
        setClientState(nextState);
    }, []);

    return {
        autoSync: clientState.settings.autoSync,
        isOnline: clientState.isOnline,
        lastSyncAt: clientState.settings.lastSyncAt,
        operatorModule,
        pendingCount: summary.pendingSync,
        recordScan,
        records: clientState.records,
        roster: operatorModule.roster,
        saveScanAttendance,
        setAutoSync,
        summary,
        syncNow,
    };
}
