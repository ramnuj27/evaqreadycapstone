import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Eye,
    Search,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import {
    type DashboardPageProps,
    formatNumber,
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
import { barangayManagement as barangayManagementRoute } from '@/routes';

type BarangayPageStatus = 'Critical' | 'Safe' | 'Warning';

type BarangayRow = {
    centers: DashboardPageProps['dashboard']['evacuationCenters']['centers'];
    evacuated: number;
    evacuees: number;
    households: number;
    missing: number;
    name: string;
    notYet: number;
    status: BarangayPageStatus;
};

const statusClassNames: Record<BarangayPageStatus, string> = {
    Critical:
        'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Safe: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Warning:
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const statusDotClassNames: Record<BarangayPageStatus, string> = {
    Critical: 'bg-rose-500',
    Safe: 'bg-emerald-500',
    Warning: 'bg-amber-500',
};

function statusIcon(status: BarangayPageStatus) {
    if (status === 'Safe') {
        return ShieldCheck;
    }

    if (status === 'Warning') {
        return ShieldAlert;
    }

    return AlertTriangle;
}

function barangayStatus(row: Omit<BarangayRow, 'status'>): BarangayPageStatus {
    if (row.missing > 0) {
        return 'Critical';
    }

    if (row.notYet > row.evacuated) {
        return 'Warning';
    }

    return 'Safe';
}

export default function BarangayManagement({
    dashboard,
}: DashboardPageProps) {
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [statusFilter, setStatusFilter] = useState<'all' | BarangayPageStatus>(
        'all',
    );
    const [selectedBarangayName, setSelectedBarangayName] = useState<
        string | null
    >(null);

    const barangayRows: BarangayRow[] = dashboard.barangayMonitoring
        .map((barangay) => {
            const evacuationRows = dashboard.evacuationMonitoring.rows.filter(
                (row) => row.barangay === barangay.name,
            );
            const centers = dashboard.evacuationCenters.centers.filter(
                (center) => center.barangay === barangay.name,
            );
            const rowBase = {
                centers,
                evacuated: evacuationRows.filter(
                    (row) => row.status === 'Evacuated',
                ).length,
                evacuees: evacuationRows.length,
                households: barangay.households,
                missing: evacuationRows.filter(
                    (row) => row.status === 'Missing',
                ).length,
                name: barangay.name,
                notYet: evacuationRows.filter(
                    (row) => row.status === 'Not Yet Evacuated',
                ).length,
            };

            return {
                ...rowBase,
                status: barangayStatus(rowBase),
            };
        })
        .sort((first, second) => {
            const statusPriority: Record<BarangayPageStatus, number> = {
                Critical: 0,
                Warning: 1,
                Safe: 2,
            };

            return (
                statusPriority[first.status] - statusPriority[second.status]
                || second.evacuees - first.evacuees
                || first.name.localeCompare(second.name)
            );
        });

    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const filteredRows = barangayRows.filter((row) => {
        const matchesSearch =
            normalizedSearch === ''
            || row.name.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
            statusFilter === 'all' || row.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const selectedBarangay =
        barangayRows.find((row) => row.name === selectedBarangayName) ?? null;

    const summary = {
        totalBarangays: filteredRows.length,
        totalEvacuees: filteredRows.reduce(
            (total, row) => total + row.evacuees,
            0,
        ),
        totalHouseholds: filteredRows.reduce(
            (total, row) => total + row.households,
            0,
        ),
    };

    return (
        <>
            <Head title="Barangays" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_55%,#eff6ff_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_55%,#0f172a_100%)] md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Barangay Monitoring
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Barangays
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review households, evacuees, evacuation status,
                                and available evacuation centers per barangay in
                                one table.
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.currentTarget.value)
                                    }
                                    placeholder="Search barangay..."
                                />
                            </div>

                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(
                                        value as 'all' | BarangayPageStatus,
                                    )
                                }
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="Safe">Safe</SelectItem>
                                    <SelectItem value="Warning">
                                        Warning
                                    </SelectItem>
                                    <SelectItem value="Critical">
                                        Critical
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Barangays
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.totalBarangays)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Households
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.totalHouseholds)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Evacuees
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.totalEvacuees)}
                        </p>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                Main Barangay Table
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Color-coded status makes it easier to spot which
                                barangays are safe, under warning, or already
                                critical.
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {formatNumber(filteredRows.length)} barangay
                            {filteredRows.length === 1 ? '' : 's'} found
                        </p>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                <thead className="bg-slate-50/90 dark:bg-slate-900/90">
                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-4 py-3">
                                            Barangay Name
                                        </th>
                                        <th className="px-4 py-3">
                                            Total Households
                                        </th>
                                        <th className="px-4 py-3">
                                            Total Evacuees
                                        </th>
                                        <th className="px-4 py-3">Evacuated</th>
                                        <th className="px-4 py-3">Not Yet</th>
                                        <th className="px-4 py-3">Missing</th>
                                        <th className="px-4 py-3">
                                            Evacuation Centers
                                        </th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="px-6 py-12 text-center text-sm leading-7 text-muted-foreground"
                                            >
                                                No barangay matched the current
                                                search and status filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRows.map((row) => {
                                            const Icon = statusIcon(row.status);

                                            return (
                                                <tr
                                                    key={row.name}
                                                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                                                >
                                                    <td className="px-4 py-4 font-semibold text-foreground">
                                                        {row.name}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.households,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.evacuees,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.evacuated,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.notYet,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.missing,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                        {formatNumber(
                                                            row.centers.length,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                                                                statusClassNames[
                                                                    row.status
                                                                ],
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'size-2 rounded-full',
                                                                    statusDotClassNames[
                                                                        row.status
                                                                    ],
                                                                )}
                                                            />
                                                            <Icon className="size-3.5" />
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setSelectedBarangayName(
                                                                    row.name,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="size-3.5" />
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog
                open={selectedBarangay !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedBarangayName(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Barangay: {selectedBarangay?.name ?? ''}
                        </DialogTitle>
                        <DialogDescription>
                            Review evacuation totals, current status, and the
                            evacuation centers assigned to this barangay.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBarangay ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Households
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">
                                        {formatNumber(
                                            selectedBarangay.households,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Evacuees
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">
                                        {formatNumber(
                                            selectedBarangay.evacuees,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Evacuation Status
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Quick summary of safe, waiting, and
                                            missing evacuees in this barangay.
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                                            statusClassNames[
                                                selectedBarangay.status
                                            ],
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                statusDotClassNames[
                                                    selectedBarangay.status
                                                ],
                                            )}
                                        />
                                        {selectedBarangay.status}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Evacuated
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {formatNumber(
                                                selectedBarangay.evacuated,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Not Yet
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {formatNumber(
                                                selectedBarangay.notYet,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Missing
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {formatNumber(
                                                selectedBarangay.missing,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center gap-2">
                                    <Building2 className="size-4 text-sky-600" />
                                    <p className="text-sm font-semibold text-foreground">
                                        Evacuation Centers
                                    </p>
                                </div>

                                {selectedBarangay.centers.length === 0 ? (
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                        No evacuation center is currently listed
                                        for this barangay in the prototype
                                        roster.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {selectedBarangay.centers.map(
                                            (center) => (
                                                <div
                                                    key={center.name}
                                                    className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                                >
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <p className="font-semibold text-foreground">
                                                                {center.name}
                                                            </p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {center.detail}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm font-medium text-foreground">
                                                            Capacity:{' '}
                                                            {formatNumber(
                                                                center.capacity,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSelectedBarangayName(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

BarangayManagement.layout = {
    breadcrumbs: [
        {
            title: 'Barangays',
            href: barangayManagementRoute(),
        },
    ],
};
