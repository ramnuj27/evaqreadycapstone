import type {
    OperatorHouseholdMember,
    OperatorModuleData,
    OperatorRosterEntry,
    OperatorScanRecord,
    OperatorScanType,
    OperatorSyncSettings,
} from '@/types/operator';

export const OPERATOR_LOCAL_STORAGE_EVENT = 'evaqready:operator-module-updated';
export const OPERATOR_RECORDS_STORAGE_KEY = 'evaqready.operator.scan-records';
export const OPERATOR_SETTINGS_STORAGE_KEY = 'evaqready.operator.sync-settings';

export type OperatorScanResult =
    | {
          entry: OperatorRosterEntry;
          message?: string;
          ok: true;
          record: OperatorScanRecord;
      }
    | {
          code: 'duplicate' | 'invalid' | 'missing-time-in';
          message: string;
          ok: false;
      };

export type OperatorRecordSummary = {
    pendingSync: number;
    scannedToday: number;
    timeInCount: number;
    timeOutCount: number;
};

type StoredOperatorScanRecord = Omit<
    OperatorScanRecord,
    'attendeeRefs' | 'householdMembers' | 'serverId'
> &
    Partial<
        Pick<
            OperatorScanRecord,
            'attendeeRefs' | 'householdMembers' | 'serverId'
        >
    >;

const defaultSyncSettings: OperatorSyncSettings = {
    autoSync: true,
    lastSyncAt: null,
};

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function safeParse<T>(value: string | null, fallback: T): T {
    if (value === null) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function uniqueId(): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `operator-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fallbackHouseholdMembers(record: {
    id: string;
    name: string;
    qrReference: string;
}): OperatorHouseholdMember[] {
    return [
        {
            age: null,
            gender: null,
            id: `legacy-${record.id}-head`,
            name: record.name,
            qrReference: record.qrReference,
            role: 'Head of Family',
        },
    ];
}

function normalizeHouseholdMembers(
    value: unknown,
    record: {
        id: string;
        name: string;
        qrReference: string;
    },
): OperatorHouseholdMember[] {
    if (!Array.isArray(value)) {
        return fallbackHouseholdMembers(record);
    }

    const members = value
        .map((member) => {
            if (
                typeof member !== 'object' ||
                member === null ||
                !('id' in member) ||
                !('name' in member) ||
                !('qrReference' in member) ||
                !('role' in member)
            ) {
                return null;
            }

            if (
                typeof member.id !== 'string' ||
                typeof member.name !== 'string' ||
                typeof member.qrReference !== 'string' ||
                typeof member.role !== 'string'
            ) {
                return null;
            }

            const name = member.name.trim();
            const qrReference = member.qrReference.trim();
            const gender =
                typeof member.gender === 'string' &&
                member.gender.trim() !== ''
                    ? member.gender.trim().toLowerCase()
                    : null;
            const age =
                typeof member.age === 'number' && Number.isFinite(member.age)
                    ? member.age
                    : null;

            if (name === '' || qrReference === '') {
                return null;
            }

            return {
                age,
                gender,
                id: member.id,
                name,
                qrReference,
                role: member.role,
            } satisfies OperatorHouseholdMember;
        })
        .filter(
            (member): member is OperatorHouseholdMember => member !== null,
        );

    return members.length > 0 ? members : fallbackHouseholdMembers(record);
}

function normalizeAttendeeRefs(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    return value
        .filter((reference): reference is string => typeof reference === 'string')
        .map((reference) => reference.trim())
        .filter((reference, index, references) => {
            return (
                reference !== '' &&
                references.findIndex(
                    (candidate) =>
                        candidate.toUpperCase() === reference.toUpperCase(),
                ) === index
            );
        });
}

function normalizeStoredOperatorScanRecord(
    record: StoredOperatorScanRecord,
): OperatorScanRecord {
    const householdMembers = normalizeHouseholdMembers(record.householdMembers, {
        id: record.id,
        name: record.name,
        qrReference: record.qrReference,
    });

    return {
        ...record,
        address:
            typeof record.address === 'string' && record.address.trim() !== ''
                ? record.address
                : null,
        attendeeRefs: normalizeAttendeeRefs(record.attendeeRefs),
        householdMembers,
        serverId: typeof record.serverId === 'number' ? record.serverId : null,
    };
}

function membersForEntry(entry: OperatorRosterEntry): OperatorHouseholdMember[] {
    return entry.members.length > 0
        ? entry.members
        : [
              {
                  age: null,
                  gender: null,
                  id: `${entry.id}-head`,
                  name: entry.name,
                  qrReference: entry.qrReference,
                  role: 'Head of Family',
              },
          ];
}

function resolvedAttendeeReferences(record: OperatorScanRecord): string[] {
    if (record.attendeeRefs !== null) {
        return record.attendeeRefs;
    }

    if (record.householdMembers.length > 0) {
        return record.householdMembers.map((member) => member.qrReference);
    }

    return [record.qrReference];
}

function activeAttendeeReferencesForHousehold(
    records: OperatorScanRecord[],
    householdCode: string,
): string[] {
    const activeReferences = new Map<string, string>();

    [...records]
        .filter((record) => record.householdCode === householdCode)
        .sort(
            (left, right) =>
                new Date(left.scannedAt).getTime() -
                new Date(right.scannedAt).getTime(),
        )
        .forEach((record) => {
            resolvedAttendeeReferences(record).forEach((reference) => {
                if (record.type === 'IN') {
                    activeReferences.set(reference, reference);

                    return;
                }

                activeReferences.delete(reference);
            });
        });

    return [...activeReferences.values()];
}

export function loadOperatorScanRecords(): OperatorScanRecord[] {
    if (!isBrowser()) {
        return [];
    }

    return safeParse<StoredOperatorScanRecord[]>(
        window.localStorage.getItem(OPERATOR_RECORDS_STORAGE_KEY),
        [],
    ).map((record) => normalizeStoredOperatorScanRecord(record));
}

export function loadOperatorSyncSettings(): OperatorSyncSettings {
    if (!isBrowser()) {
        return defaultSyncSettings;
    }

    return {
        ...defaultSyncSettings,
        ...safeParse<Partial<OperatorSyncSettings>>(
            window.localStorage.getItem(OPERATOR_SETTINGS_STORAGE_KEY),
            {},
        ),
    };
}

export function persistOperatorModuleState(
    records: OperatorScanRecord[],
    settings: OperatorSyncSettings,
): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(
        OPERATOR_RECORDS_STORAGE_KEY,
        JSON.stringify(records),
    );
    window.localStorage.setItem(
        OPERATOR_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings),
    );
    window.dispatchEvent(new Event(OPERATOR_LOCAL_STORAGE_EVENT));
}

export function syncOperatorRecords(
    records: OperatorScanRecord[],
    syncedRecords: Array<{ localId: string; record: OperatorScanRecord }>,
    syncedAt: string,
): {
    changed: boolean;
    records: OperatorScanRecord[];
    settings: OperatorSyncSettings;
} {
    const syncedRecordMap = new Map(
        syncedRecords.map(({ localId, record }) => [localId, record]),
    );

    if (syncedRecordMap.size === 0) {
        return {
            changed: false,
            records,
            settings: {
                autoSync: true,
                lastSyncAt: syncedAt,
            },
        };
    }

    return {
        changed: true,
        records: records.map((record) => syncedRecordMap.get(record.id) ?? record),
        settings: {
            autoSync: true,
            lastSyncAt: syncedAt,
        },
    };
}

export function updateOperatorScanAttendance(
    records: OperatorScanRecord[],
    recordId: string,
    attendeeRefs: string[],
): OperatorScanRecord[] {
    return records.map((record) =>
        record.id === recordId
            ? {
                  ...record,
                  attendeeRefs,
              }
            : record,
    );
}

export function summarizeOperatorRecords(
    records: OperatorScanRecord[],
    now: Date = new Date(),
): OperatorRecordSummary {
    const todayRecords = records.filter((record) => {
        const recordedAt = new Date(record.scannedAt);

        return (
            recordedAt.getFullYear() === now.getFullYear() &&
            recordedAt.getMonth() === now.getMonth() &&
            recordedAt.getDate() === now.getDate()
        );
    });

    return {
        pendingSync: records.filter(
            (record) => record.syncStatus === 'Pending Sync',
        ).length,
        scannedToday: todayRecords.length,
        timeInCount: todayRecords.filter((record) => record.type === 'IN')
            .length,
        timeOutCount: todayRecords.filter((record) => record.type === 'OUT')
            .length,
    };
}

function normalizePayload(payload: string): string {
    return payload.trim().toUpperCase();
}

function householdCodeFromPayload(
    payload: string,
    qrPayloadPrefix: string,
): string {
    const normalizedPayload = normalizePayload(payload);
    const payloadWithoutPrefix = normalizedPayload.startsWith(qrPayloadPrefix)
        ? normalizedPayload.slice(qrPayloadPrefix.length)
        : normalizedPayload;
    const householdMatch = /^(.*?)-(HEAD|M\d{2})$/.exec(payloadWithoutPrefix);

    return householdMatch?.[1] ?? payloadWithoutPrefix;
}

function rosterEntryFromRecord(record: OperatorScanRecord): OperatorRosterEntry {
    return {
        address: record.address,
        barangay: record.barangay,
        evacuationCenter:
            record.center === 'Unassigned Center' ? null : record.center,
        household: record.name,
        householdCode: record.householdCode,
        id: `record-${record.id}`,
        members:
            record.householdMembers.length > 0
                ? record.householdMembers
                : fallbackHouseholdMembers(record),
        name: record.name,
        note: 'Registered household QR is ready for operator scanning.',
        qrReference: record.qrReference,
        role: 'Household QR',
        status: 'Registered',
    };
}

function resolveRosterEntry(
    operatorModule: OperatorModuleData,
    records: OperatorScanRecord[],
    payload: string,
): OperatorRosterEntry | null {
    const normalizedPayload = normalizePayload(payload);
    const qrPayloadPrefix = operatorModule.meta.qrPayloadPrefix.toUpperCase();
    const householdCode = householdCodeFromPayload(payload, qrPayloadPrefix);
    const cachedRecord =
        records.find(
            (record) =>
                normalizePayload(record.sourcePayload) === normalizedPayload ||
                normalizePayload(record.qrReference) === normalizedPayload,
        ) ??
        records.find(
            (record) =>
                normalizePayload(record.householdCode) === householdCode ||
                normalizePayload(record.qrReference) === householdCode,
        );

    return (
        operatorModule.roster.find(
            (entry) =>
                entry.qrReference.toUpperCase() === normalizedPayload ||
                entry.qrReference.toUpperCase() === householdCode,
        ) ??
        operatorModule.roster.find(
            (entry) => entry.householdCode.toUpperCase() === householdCode,
        ) ??
        (cachedRecord ? rosterEntryFromRecord(cachedRecord) : null) ??
        null
    );
}

export function createOperatorScanRecord(
    operatorModule: OperatorModuleData,
    records: OperatorScanRecord[],
    payload: string,
    type: OperatorScanType,
    evacuationCenterName: string,
): OperatorScanResult {
    const normalizedCenterName = evacuationCenterName.trim();

    if (normalizedCenterName === '') {
        return {
            code: 'invalid',
            message: 'Select the evacuation center before scanning the QR code.',
            ok: false,
        };
    }

    const entry = resolveRosterEntry(operatorModule, records, payload);

    if (entry === null) {
        return {
            code: 'invalid',
            message:
                'Invalid QR. The scanned code does not match the current roster.',
            ok: false,
        };
    }

    const householdMembers = membersForEntry(entry);
    const activeAttendeeReferences = activeAttendeeReferencesForHousehold(
        records,
        entry.householdCode,
    );
    const defaultAttendeeReferences =
        type === 'IN'
            ? householdMembers
                  .map((member) => member.qrReference)
                  .filter(
                      (reference) =>
                          !activeAttendeeReferences.includes(reference),
                  )
            : householdMembers
                  .map((member) => member.qrReference)
                  .filter((reference) =>
                      activeAttendeeReferences.includes(reference),
                  );

    if (type === 'IN' && defaultAttendeeReferences.length === 0) {
        return {
            code: 'duplicate',
            message:
                'Duplicate scan. Everyone tagged in this household is already timed in.',
            ok: false,
        };
    }

    if (type === 'OUT' && defaultAttendeeReferences.length === 0) {
        return {
            code: 'missing-time-in',
            message:
                'Time-Out cannot be recorded yet because no tagged household member has an active Time-In.',
            ok: false,
        };
    }

    return {
        entry,
        ok: true,
        record: {
            address: entry.address,
            attendeeRefs: defaultAttendeeReferences,
            barangay: entry.barangay,
            center: normalizedCenterName,
            householdCode: entry.householdCode,
            householdMembers,
            id: uniqueId(),
            name: entry.name,
            qrReference: entry.qrReference,
            scannedAt: new Date().toISOString(),
            serverId: null,
            sourcePayload: payload.trim(),
            syncStatus: 'Pending Sync',
            type,
        },
    };
}
