import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Eye,
    QrCode,
    RefreshCcw,
    Search,
    TriangleAlert,
    WifiOff,
} from 'lucide-react';
import { startTransition, useDeferredValue, useState } from 'react';
import type {
    DashboardPageProps,
    EvacuationMonitoringStatus,
} from '@/components/console-panels';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { evacuationMonitoring as evacuationMonitoringRoute } from '@/routes';
import type { Auth } from '@/types';

type MonitoringRow =
    DashboardPageProps['dashboard']['evacuationMonitoring']['rows'][number];

const statusClassNames: Record<EvacuationMonitoringStatus, string> = {
    Evacuated:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Missing:
        'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    'Not Yet Evacuated':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const syncClassNames: Record<MonitoringRow['syncStatus'], string> = {
    'Pending Sync':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Synced:
        'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300',
};

function formatCount(value: number): string {
    return value.toLocaleString();
}

function formatScanTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatScanMoment(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

function SummaryCard({
    description,
    label,
    toneClassName,
    total,
}: {
    description: string;
    label: string;
    toneClassName: string;
    total: number;
}) {
    return (
        <div className="rounded-[26px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                </p>
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase',
                        toneClassName,
                    )}
                >
                    {label}
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {formatCount(total)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export default function EvacuationMonitoring({ dashboard }: DashboardPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const monitoring = dashboard.evacuationMonitoring;
    const isBarangayCommittee = auth.user?.role === 'Barangay Committee';
    const barangayName = auth.user?.barangay ?? null;
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [barangayFilter, setBarangayFilter] = useState('all');
    const [centerFilter, setCenterFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
        null,
    );
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const filteredRows = monitoring.rows.filter((row) => {
        const matchesSearch =
            normalizedSearch === '' ||
            row.name.toLowerCase().includes(normalizedSearch) ||
            row.household.toLowerCase().includes(normalizedSearch) ||
            row.householdCode.toLowerCase().includes(normalizedSearch) ||
            row.qrReference.toLowerCase().includes(normalizedSearch);
        const matchesBarangay =
            isBarangayCommittee ||
            barangayFilter === 'all' ||
            row.barangay === barangayFilter;
        const matchesCenter =
            centerFilter === 'all' ||
            (row.evacuationCenter ?? 'unassigned') === centerFilter;
        const matchesStatus =
            statusFilter === 'all' || row.status === statusFilter;

        return (
            matchesSearch && matchesBarangay && matchesCenter && matchesStatus
        );
    });

    const filteredSummary = {
        centers: new Set(
            filteredRows
                .map((row) => row.evacuationCenter)
                .filter((center): center is string => center !== null),
        ).size,
        evacuated: filteredRows.filter((row) => row.status === 'Evacuated')
            .length,
        missing: filteredRows.filter((row) => row.status === 'Missing').length,
        notYetEvacuated: filteredRows.filter(
            (row) => row.status === 'Not Yet Evacuated',
        ).length,
    };
    const pendingSyncCount = filteredRows.filter(
        (row) => row.syncStatus === 'Pending Sync',
    ).length;
    const syncedCount = filteredRows.filter(
        (row) => row.syncStatus === 'Synced',
    ).length;
    const selectedRecord =
        monitoring.rows.find((row) => row.id === selectedRecordId) ?? null;

    function resetFilters(): void {
        startTransition(() => {
            setSearch('');
            setBarangayFilter('all');
            setCenterFilter('all');
            setStatusFilter('all');
        });
    }

    function refreshStatus(): void {
        router.reload({
            only: ['dashboard'],
        });
    }

    return (
        <>
            <Head title="Evacuation Monitoring" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_22%),linear-gradient(140deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_48%,rgba(239,246,255,0.98)_100%)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_22%),linear-gradient(140deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.96)_48%,rgba(12,74,110,0.46)_100%)] md:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Evacuation Monitoring
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Track evacuation status and scan activity
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                {isBarangayCommittee && barangayName
                                    ? `Assigned barangay: ${barangayName}. Search evacuees, inspect scan history, and keep accountability records focused on your own area.`
                                    : 'Search evacuees, inspect scan history, and monitor accountability records across the response console.'}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <QrCode className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Operator Scan Feed
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {monitoring.meta.scannerConnected
                                        ? 'Live operator scans are updating this table.'
                                        : 'No operator scan has been received yet.'}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <WifiOff className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Sync Status
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {pendingSyncCount} pending sync, {syncedCount}{' '}
                                    synced
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div
                        className={cn(
                            'grid gap-3',
                            isBarangayCommittee
                                ? 'xl:grid-cols-[minmax(0,1.25fr)_repeat(2,minmax(0,0.75fr))_auto]'
                                : 'xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.72fr))_auto]',
                        )}
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.currentTarget.value)
                                }
                                placeholder="Search evacuee, household, or QR ID"
                            />
                        </div>

                        {!isBarangayCommittee ? (
                            <Select
                                value={barangayFilter}
                                onValueChange={setBarangayFilter}
                            >
                                <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                    <SelectValue placeholder="Barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All barangays
                                    </SelectItem>
                                    {monitoring.filters.barangays.map((barangay) => (
                                        <SelectItem
                                            key={barangay}
                                            value={barangay}
                                        >
                                            {barangay}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : null}

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {monitoring.filters.statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={centerFilter} onValueChange={setCenterFilter}>
                            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Evacuation Center" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All centers</SelectItem>
                                <SelectItem value="unassigned">
                                    Unassigned
                                </SelectItem>
                                {monitoring.filters.centers.map((center) => (
                                    <SelectItem key={center} value={center}>
                                        {center}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-2xl"
                                onClick={refreshStatus}
                            >
                                <RefreshCcw className="size-4" />
                                Refresh Status
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-12 rounded-2xl"
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <p>
                            {formatCount(filteredRows.length)} monitoring
                            records in the current result set.
                        </p>
                        <p>
                            {isBarangayCommittee && barangayName
                                ? `Only ${barangayName} records are shown here.`
                                : 'Use the filters to narrow the table by barangay, status, or evacuation center.'}
                        </p>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        description="Residents already scanned and accounted for inside a center."
                        label="Evacuated"
                        toneClassName={statusClassNames.Evacuated}
                        total={filteredSummary.evacuated}
                    />
                    <SummaryCard
                        description="Registered residents still waiting for a safe-arrival scan."
                        label="Not Yet"
                        toneClassName={statusClassNames['Not Yet Evacuated']}
                        total={filteredSummary.notYetEvacuated}
                    />
                    <SummaryCard
                        description="High-risk residents with no recorded scan yet."
                        label="Missing"
                        toneClassName={statusClassNames.Missing}
                        total={filteredSummary.missing}
                    />
                    <SummaryCard
                        description="Evacuation centers currently appearing in the filtered records."
                        label="Centers"
                        toneClassName="bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 dark:text-orange-300"
                        total={filteredSummary.centers}
                    />
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                Main Monitoring Table
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Color-coded status logic keeps accountability
                                clear: evacuated means already scanned, not yet
                                means no safe-arrival scan yet, and missing
                                means high-risk and still unaccounted for.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                                <CheckCircle2 className="size-3.5" />
                                Evacuated
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300">
                                <Clock3 className="size-3.5" />
                                Not Yet
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300">
                                <TriangleAlert className="size-3.5" />
                                Missing
                            </span>
                        </div>
                    </div>

                    {filteredRows.length === 0 ? (
                        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            No monitoring rows match the current filters.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto rounded-[26px] border border-slate-200/80 dark:border-slate-800">
                            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-900">
                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">
                                            Household ID / Household
                                        </th>
                                        <th className="px-4 py-3">Center</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Time In</th>
                                        <th className="px-4 py-3">Time Out</th>
                                        <th className="px-4 py-3">Last Scan</th>
                                        <th className="px-4 py-3">Sync</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {filteredRows.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-foreground">
                                                    {row.name}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {row.role}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-foreground">
                                                    {row.householdCode}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {row.household}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-foreground">
                                                {row.evacuationCenter ?? '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                                                        statusClassNames[
                                                            row.status
                                                        ],
                                                    )}
                                                >
                                                    {row.status ===
                                                    'Not Yet Evacuated'
                                                        ? 'NOT YET'
                                                        : row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-foreground">
                                                {formatScanTime(row.timeIn)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-foreground">
                                                {formatScanTime(row.timeOut)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-foreground">
                                                {formatScanTime(row.lastScan)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                                                        syncClassNames[
                                                            row.syncStatus
                                                        ],
                                                    )}
                                                >
                                                    {row.syncStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setSelectedRecordId(
                                                            row.id,
                                                        )
                                                    }
                                                >
                                                    <Eye className="size-3.5" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <Dialog
                open={selectedRecord !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRecordId(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Evacuee Details</DialogTitle>
                        <DialogDescription>
                            Review scan status, evacuation center assignment, and
                            accountability details for the selected resident.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecord ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Name
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedRecord.name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedRecord.role}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Household ID
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedRecord.householdCode}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedRecord.household}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Barangay
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedRecord.barangay}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Evacuation Center
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedRecord.evacuationCenter ?? '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Status
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                                            statusClassNames[
                                                selectedRecord.status
                                            ],
                                        )}
                                    >
                                        {selectedRecord.status ===
                                        'Not Yet Evacuated'
                                            ? 'NOT YET'
                                            : selectedRecord.status}
                                    </span>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Time In
                                    </p>
                                    <p className="mt-3 font-semibold text-foreground">
                                        {formatScanMoment(selectedRecord.timeIn)}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Time Out
                                    </p>
                                    <p className="mt-3 font-semibold text-foreground">
                                        {formatScanMoment(
                                            selectedRecord.timeOut,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Last Scan
                                    </p>
                                    <p className="mt-3 font-semibold text-foreground">
                                        {formatScanMoment(
                                            selectedRecord.lastScan,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Sync Status
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                                            syncClassNames[
                                                selectedRecord.syncStatus
                                            ],
                                        )}
                                    >
                                        {selectedRecord.syncStatus}
                                    </span>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        QR Code ID
                                    </p>
                                    <p className="mt-3 font-semibold text-foreground">
                                        {selectedRecord.qrReference}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Recorded At
                                    </p>
                                    <p className="mt-3 font-semibold text-foreground">
                                        {formatScanMoment(
                                            selectedRecord.recordedAt,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-sm font-semibold text-foreground">
                                    Remarks
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {selectedRecord.note}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSelectedRecordId(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EvacuationMonitoring.layout = {
    breadcrumbs: [
        {
            title: 'Evacuation Monitoring',
            href: evacuationMonitoringRoute(),
        },
    ],
};
