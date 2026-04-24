export type OperatorScanType = 'IN' | 'OUT';

export type OperatorSyncStatus = 'Pending Sync' | 'Synced';

export type OperatorCenterStatus = 'Available' | 'Near Full' | 'Full';

export type OperatorHouseholdMember = {
    age: number | null;
    gender: string | null;
    id: string;
    name: string;
    qrReference: string;
    role: string;
};

export type OperatorRosterEntry = {
    address: string | null;
    barangay: string;
    evacuationCenter: string | null;
    household: string;
    householdCode: string;
    id: string;
    members: OperatorHouseholdMember[];
    name: string;
    note: string;
    qrReference: string;
    role: string;
    status: string;
};

export type OperatorCenter = {
    barangay: string;
    id: string;
    imageLabel: string;
    name: string;
    status: OperatorCenterStatus;
};

export type OperatorScanRecord = {
    address: string | null;
    attendeeRefs: string[] | null;
    barangay: string;
    center: string;
    householdCode: string;
    householdMembers: OperatorHouseholdMember[];
    id: string;
    name: string;
    qrReference: string;
    scannedAt: string;
    serverId: number | null;
    sourcePayload: string;
    syncStatus: OperatorSyncStatus;
    type: OperatorScanType;
};

export type OperatorSyncSettings = {
    autoSync: boolean;
    lastSyncAt: string | null;
};

export type OperatorModuleData = {
    centers: OperatorCenter[];
    command: {
        assignmentLabel: string;
        dateLabel: string;
        operatorName: string;
        status: string;
    };
    meta: {
        defaultEvacuationCenter: string | null;
        note: string;
        offlineMode: boolean;
        qrPayloadPrefix: string;
        scannerConnected: boolean;
        supportsTimeOut: boolean;
    };
    roster: OperatorRosterEntry[];
    scanCenters: string[];
    summary: {
        activeCenters: number;
        rosterTotal: number;
        trackedHouseholds: number;
    };
};

export type OperatorPageProps = {
    operatorModule: OperatorModuleData;
};
