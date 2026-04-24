import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    Edit2,
    Eye,
    Plus,
    Search,
    Trash2,
    UsersRound,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import type { FormEvent } from 'react';
import {
    destroyEvacuationCenter,
    storeEvacuationCenter,
    updateEvacuationCenter,
} from '@/actions/App/Http/Controllers/DashboardController';
import { formatNumber } from '@/components/console-panels';
import type {
    CenterStatus,
    DashboardPageProps,
} from '@/components/console-panels';
import InputError from '@/components/input-error';
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
import { evacuationCenters as evacuationCentersRoute } from '@/routes';
import type { Auth } from '@/types';

type CenterPageStatus = 'Full' | 'Inactive' | 'Near Full' | 'Open';

type CenterRow = {
    availableSlots: number;
    barangay: string;
    capacity: number;
    currentEvacuees: number;
    databaseId: number | null;
    detail: string;
    evacueeNames: string[];
    id: string;
    isActive: boolean;
    isPrototype: boolean;
    name: string;
    status: CenterPageStatus;
};

type CenterFormData = {
    barangay: string;
    capacity: string;
    detail: string;
    is_active: boolean;
    name: string;
};

type CenterDialogMode = 'create' | 'edit' | 'view';

const statusClassNames: Record<CenterPageStatus, string> = {
    Full: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Inactive:
        'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
    'Near Full':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Open: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
};

const statusDotClassNames: Record<CenterPageStatus, string> = {
    Full: 'bg-rose-500',
    Inactive: 'bg-slate-400',
    'Near Full': 'bg-amber-500',
    Open: 'bg-emerald-500',
};

const emptyCenterForm: CenterFormData = {
    barangay: '',
    capacity: '',
    detail: '',
    is_active: true,
    name: '',
};

function mapCenterStatus(status: CenterStatus): CenterPageStatus | null {
    if (status === 'Available') {
        return 'Open';
    }

    if (status === 'Near Full' || status === 'Full' || status === 'Inactive') {
        return status;
    }

    return null;
}

function centerFormDataFromRow(center: CenterRow): CenterFormData {
    return {
        barangay: center.barangay,
        capacity: String(center.capacity),
        detail: center.detail,
        is_active: center.isActive,
        name: center.name,
    };
}

function capacityPercent(current: number, capacity: number): number {
    if (capacity <= 0) {
        return 0;
    }

    return Math.round((current / capacity) * 100);
}

export default function EvacuationCenters({
    dashboard,
}: DashboardPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const distributionLabel =
        auth.user?.role === 'Barangay Committee' && auth.user.barangay
            ? `${auth.user.barangay} Center View`
            : 'CDRRMO Distribution View';
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [barangayFilter, setBarangayFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<
        'all' | CenterPageStatus
    >('all');
    const [selectedCenterId, setSelectedCenterId] = useState<string | null>(
        null,
    );
    const [dialogMode, setDialogMode] = useState<CenterDialogMode>('view');
    const form = useForm<CenterFormData>(emptyCenterForm);
    const canManageCenters =
        dashboard.evacuationCenters.actions.canManageCenters;
    const centerBarangays = dashboard.evacuationCenters.options.barangays;

    const centerRows: CenterRow[] = dashboard.evacuationCenters.centers
        .map((center) => {
            const status = mapCenterStatus(center.status);

            if (status === null) {
                return null;
            }

            const evacueeNames = Array.from(
                new Set(
                    dashboard.evacuationMonitoring.rows
                        .filter(
                            (row) =>
                                row.evacuationCenter === center.name
                                && row.status !== 'Missing',
                        )
                        .map((row) => row.name),
                ),
            );

            return {
                availableSlots: Math.max(
                    center.capacity - center.occupied,
                    0,
                ),
                barangay: center.barangay,
                capacity: center.capacity,
                currentEvacuees: center.occupied,
                databaseId: center.id,
                detail: center.detail,
                evacueeNames,
                id: center.id === null ? center.name : `center-${center.id}`,
                isActive: center.isActive,
                isPrototype: dashboard.evacuationCenters.prototype,
                name: center.name,
                status,
            };
        })
        .filter((center): center is CenterRow => center !== null)
        .sort((first, second) => {
            const statusPriority: Record<CenterPageStatus, number> = {
                Full: 0,
                'Near Full': 1,
                Open: 2,
                Inactive: 3,
            };

            return (
                statusPriority[first.status] - statusPriority[second.status]
                || second.currentEvacuees - first.currentEvacuees
                || first.name.localeCompare(second.name)
            );
        });

    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const filteredCenters = centerRows.filter((center) => {
        const matchesSearch =
            normalizedSearch === ''
            || center.name.toLowerCase().includes(normalizedSearch);
        const matchesBarangay =
            barangayFilter === 'all' || center.barangay === barangayFilter;
        const matchesStatus =
            statusFilter === 'all' || center.status === statusFilter;

        return matchesSearch && matchesBarangay && matchesStatus;
    });

    const selectedCenter =
        filteredCenters.find((center) => center.id === selectedCenterId)
        ?? centerRows.find((center) => center.id === selectedCenterId)
        ?? null;

    const summary = {
        full: filteredCenters.filter((center) => center.status === 'Full')
            .length,
        nearFull: filteredCenters.filter(
            (center) => center.status === 'Near Full',
        ).length,
        open: filteredCenters.filter((center) => center.status === 'Open')
            .length,
        totalCenters: filteredCenters.length,
    };

    const barangays = Array.from(
        new Set(centerRows.map((center) => center.barangay)),
    ).sort((first, second) => first.localeCompare(second));

    function openCenterDialog(center: CenterRow, mode: CenterDialogMode): void {
        setSelectedCenterId(center.id);
        setDialogMode(mode);
        form.clearErrors();

        if (mode === 'edit') {
            form.setData(centerFormDataFromRow(center));
        }
    }

    function openCreateDialog(): void {
        setSelectedCenterId(null);
        setDialogMode('create');
        form.setData(emptyCenterForm);
        form.clearErrors();
    }

    function closeDialog(): void {
        setSelectedCenterId(null);
        setDialogMode('view');
        form.reset();
        form.clearErrors();
    }

    function submitCenter(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const options = {
            onSuccess: closeDialog,
            preserveScroll: true,
        };

        if (dialogMode === 'edit' && selectedCenter?.databaseId != null) {
            form.put(
                updateEvacuationCenter.url(selectedCenter.databaseId),
                options,
            );

            return;
        }

        form.post(storeEvacuationCenter.url(), options);
    }

    function deleteCenter(center: CenterRow): void {
        if (center.databaseId === null) {
            return;
        }

        if (!window.confirm('Delete this evacuation center record?')) {
            return;
        }

        router.delete(destroyEvacuationCenter.url(center.databaseId), {
            onSuccess: () => {
                if (selectedCenterId === center.id) {
                    closeDialog();
                }
            },
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Evacuation Centers" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_54%,#ecfdf5_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_54%,#052e16_100%)] md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                {distributionLabel}
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                Evacuation Centers
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                Review center capacity, current evacuees, and
                                slot availability so evacuees can be
                                distributed faster across available sites.
                            </p>
                        </div>

                        <Button
                            className="h-11 rounded-full bg-emerald-600 px-5 text-white shadow-sm hover:bg-emerald-700 disabled:bg-slate-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                            disabled={!canManageCenters}
                            onClick={openCreateDialog}
                        >
                            <Plus className="size-4" />
                            Add Center
                        </Button>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-[24px] border border-white/70 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/55 md:grid-cols-[minmax(260px,1fr)_220px_220px]">
                        <div className="relative min-w-0">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.currentTarget.value)
                                }
                                placeholder="Search center..."
                            />
                        </div>

                        <Select
                            value={barangayFilter}
                            onValueChange={setBarangayFilter}
                        >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All barangays
                                </SelectItem>
                                {barangays.map((barangay) => (
                                    <SelectItem
                                        key={barangay}
                                        value={barangay}
                                    >
                                        {barangay}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                setStatusFilter(
                                    value as 'all' | CenterPageStatus,
                                )
                            }
                        >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All statuses
                                </SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Near Full">
                                    Near Full
                                </SelectItem>
                                <SelectItem value="Full">Full</SelectItem>
                                <SelectItem value="Inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Centers
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.totalCenters)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Open
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.open)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Near Full
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.nearFull)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Full
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.full)}
                        </p>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                Main Centers Table
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Use the center roster to decide where evacuees
                                should be routed next based on current load and
                                remaining slots.
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {formatNumber(filteredCenters.length)} center
                            {filteredCenters.length === 1 ? '' : 's'} found
                        </p>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200/80 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                <thead className="bg-slate-50/90 dark:bg-slate-900/90">
                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-4 py-3">
                                            Center Name
                                        </th>
                                        <th className="px-4 py-3">Barangay</th>
                                        <th className="px-4 py-3">Capacity</th>
                                        <th className="px-4 py-3">
                                            Current Evacuees
                                        </th>
                                        <th className="px-4 py-3">
                                            Available Slots
                                        </th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {filteredCenters.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center text-sm leading-7 text-muted-foreground"
                                            >
                                                No evacuation center matched the
                                                current search or filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCenters.map((center) => (
                                            <tr
                                                key={center.id}
                                                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-foreground">
                                                            {center.name}
                                                        </p>
                                                        {center.isPrototype ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                Prototype
                                                                planning roster
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {center.barangay}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {formatNumber(
                                                        center.capacity,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-foreground">
                                                    {formatNumber(
                                                        center.currentEvacuees,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-semibold text-foreground">
                                                    {formatNumber(
                                                        center.availableSlots,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                                                            statusClassNames[
                                                                center.status
                                                            ],
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'size-2 rounded-full',
                                                                statusDotClassNames[
                                                                    center.status
                                                                ],
                                                            )}
                                                        />
                                                        {center.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="size-8 rounded-full p-0"
                                                            title="View center"
                                                            aria-label="View center"
                                                            onClick={() =>
                                                                openCenterDialog(
                                                                    center,
                                                                    'view',
                                                                )
                                                            }
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="size-8 rounded-full p-0"
                                                            title="Edit center"
                                                            aria-label="Edit center"
                                                            disabled={
                                                                !canManageCenters
                                                                || center.databaseId ===
                                                                    null
                                                            }
                                                            onClick={() =>
                                                                openCenterDialog(
                                                                    center,
                                                                    'edit',
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="size-8 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                                            title="Delete center"
                                                            aria-label="Delete center"
                                                            disabled={
                                                                !canManageCenters
                                                                || center.databaseId ===
                                                                    null
                                                            }
                                                            onClick={() =>
                                                                deleteCenter(
                                                                    center,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog
                open={dialogMode === 'create' || selectedCenter !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'create'
                                ? 'Add Center'
                                : dialogMode === 'edit'
                                  ? 'Edit Center'
                                  : `Center: ${selectedCenter?.name ?? ''}`}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'view'
                                ? 'Review capacity, current evacuees, available slots, and the roster tied to this center.'
                                : 'Keep the center record simple: name, barangay, capacity, status, and one short note.'}
                        </DialogDescription>
                    </DialogHeader>

                    {dialogMode !== 'view' ? (
                        <form
                            onSubmit={submitCenter}
                            className="space-y-4 rounded-[22px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <label
                                        htmlFor="center_name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Center Name
                                    </label>
                                    <Input
                                        id="center_name"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Example: Central Evacuation Center"
                                    />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="center_barangay"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Barangay
                                    </label>
                                    <select
                                        id="center_barangay"
                                        value={form.data.barangay}
                                        onChange={(event) =>
                                            form.setData(
                                                'barangay',
                                                event.currentTarget.value,
                                            )
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="">Select barangay</option>
                                        {centerBarangays.map((barangay) => (
                                            <option
                                                key={barangay}
                                                value={barangay}
                                            >
                                                {barangay}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.barangay}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="center_capacity"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Capacity
                                    </label>
                                    <Input
                                        id="center_capacity"
                                        type="number"
                                        min="1"
                                        value={form.data.capacity}
                                        onChange={(event) =>
                                            form.setData(
                                                'capacity',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.capacity}
                                    />
                                </div>

                                <label className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(event) =>
                                            form.setData(
                                                'is_active',
                                                event.currentTarget.checked,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-foreground">
                                            Active center
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Active centers can receive evacuees.
                                        </span>
                                        <InputError
                                            message={form.errors.is_active}
                                        />
                                    </span>
                                </label>

                                <div className="grid gap-2 md:col-span-2">
                                    <label
                                        htmlFor="center_detail"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Note
                                    </label>
                                    <textarea
                                        id="center_detail"
                                        value={form.data.detail}
                                        onChange={(event) =>
                                            form.setData(
                                                'detail',
                                                event.currentTarget.value,
                                            )
                                        }
                                        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                        placeholder="Short operational note"
                                    />
                                    <InputError message={form.errors.detail} />
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full"
                                    onClick={closeDialog}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-full"
                                    disabled={form.processing}
                                >
                                    {dialogMode === 'create'
                                        ? 'Add Center'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    ) : null}

                    {selectedCenter && dialogMode === 'view' ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Barangay
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedCenter.barangay}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Capacity
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(selectedCenter.capacity)}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Current Evacuees
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(
                                            selectedCenter.currentEvacuees,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Available Slots
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(
                                            selectedCenter.availableSlots,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Status
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                                            statusClassNames[
                                                selectedCenter.status
                                            ],
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                statusDotClassNames[
                                                    selectedCenter.status
                                                ],
                                            )}
                                        />
                                        {selectedCenter.status}
                                    </span>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Manifest Count
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(
                                            selectedCenter.evacueeNames.length,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center gap-2">
                                    <Building2 className="size-4 text-emerald-600" />
                                    <p className="text-sm font-semibold text-foreground">
                                        Capacity Bar
                                    </p>
                                </div>
                                <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            selectedCenter.status === 'Open'
                                                && 'bg-emerald-500',
                                            selectedCenter.status
                                                === 'Near Full'
                                                && 'bg-amber-500',
                                            selectedCenter.status === 'Full'
                                                && 'bg-rose-500',
                                        )}
                                        style={{
                                            width: `${capacityPercent(
                                                selectedCenter.currentEvacuees,
                                                selectedCenter.capacity,
                                            )}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    {formatNumber(
                                        selectedCenter.currentEvacuees,
                                    )}{' '}
                                    / {formatNumber(selectedCenter.capacity)}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {selectedCenter.detail}
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center gap-2">
                                    <UsersRound className="size-4 text-sky-600" />
                                    <p className="text-sm font-semibold text-foreground">
                                        Evacuees
                                    </p>
                                </div>

                                {selectedCenter.evacueeNames.length === 0 ? (
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                        No evacuee roster is currently tied to
                                        this center. This usually means the
                                        manifest is still pending or the
                                        residents are flagged elsewhere in the
                                        monitoring flow.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-2">
                                        {selectedCenter.evacueeNames.map(
                                            (name) => (
                                                <div
                                                    key={name}
                                                    className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-foreground dark:border-slate-800 dark:bg-slate-900/70"
                                                >
                                                    - {name}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2">
                        {selectedCenter?.databaseId !== null &&
                        selectedCenter !== null &&
                        canManageCenters &&
                        dialogMode === 'view' ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="size-9 rounded-full p-0"
                                    title="Edit center"
                                    aria-label="Edit center"
                                    onClick={() =>
                                        openCenterDialog(
                                            selectedCenter,
                                            'edit',
                                        )
                                    }
                                >
                                    <Edit2 className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="size-9 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                    title="Delete center"
                                    aria-label="Delete center"
                                    onClick={() => deleteCenter(selectedCenter)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </>
                        ) : null}
                        <Button
                            variant="ghost"
                            onClick={closeDialog}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EvacuationCenters.layout = {
    breadcrumbs: [
        {
            title: 'Evacuation Centers',
            href: evacuationCentersRoute(),
        },
    ],
};
