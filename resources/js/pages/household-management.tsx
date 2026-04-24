import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    Home,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    UsersRound,
} from 'lucide-react';
import {
    Fragment,
    startTransition,
    useCallback,
    useDeferredValue,
    useEffect,
    useRef,
    useState,
} from 'react';
import type { FormEvent } from 'react';
import {
    destroyManagedHouseholdMember,
    destroyHousehold,
    storeManagedHouseholdMember,
    updateHousehold,
    updateManagedHouseholdMember,
} from '@/actions/App/Http/Controllers/DashboardController';
import type { DashboardPageProps } from '@/components/console-panels';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { householdManagement as householdManagementRoute } from '@/routes';

type HouseholdManagementData = {
    actions: {
        canManageHouseholds: boolean;
    };
    filters: {
        barangay: string;
        barangays: string[];
        search: string;
        status: string;
        statuses: string[];
    };
    options: {
        hazardZones: string[];
        pwdTypes: string[];
    };
    summary: {
        barangaysCovered: number;
        totalHouseholds: number;
        totalRegisteredMembers: number;
    };
    table: {
        pagination: {
            currentPage: number;
            from: number | null;
            hasPages: boolean;
            lastPage: number;
            to: number | null;
            total: number;
        };
        rows: Array<{
            address: string;
            barangay: string;
            city: string | null;
            contactNumber: string | null;
            fullAddress: string;
            hazardZone: string | null;
            head: {
                birthdate: string | null;
                contactNumber: string | null;
                gender: string | null;
                isPregnant: boolean;
                name: string | null;
            };
            headOfFamily: string;
            householdCode: string;
            id: number;
            lastUpdatedAt: string | null;
            members: Array<{
                age: number | null;
                birthdate: string | null;
                category: string | null;
                databaseId: number | null;
                gender: string | null;
                id: string;
                isPregnant: boolean;
                isPwd: boolean | null;
                isSenior: boolean;
                name: string;
                pwdType: string | null;
                pwdTypeOther: string | null;
                relation: string;
                sex: string;
                type: 'head' | 'member';
            }>;
            name: string | null;
            qrReference: string;
            registeredAt: string | null;
            status: string;
            totalMembers: number;
        }>;
    };
};

type HouseholdManagementPageProps = DashboardPageProps & {
    householdManagement: HouseholdManagementData;
};

type HouseholdRow = HouseholdManagementData['table']['rows'][number];
type HouseholdMemberRow = HouseholdRow['members'][number];

type HouseholdFormData = {
    barangay: string;
    birthdate: string;
    city: string;
    contact_number: string;
    gender: string;
    hazard_zone: string;
    head_name: string;
    household_name: string;
    is_pregnant: boolean;
    status: string;
    street_address: string;
};

type MemberFormData = {
    birthdate: string;
    category: string;
    full_name: string;
    gender: string;
    is_pregnant: boolean;
    is_pwd: boolean;
    pwd_type: string;
    pwd_type_other: string;
};

type MemberEditor =
    | {
          mode: 'create';
      }
    | {
          memberId: number;
          mode: 'edit';
      };

const statusBadgeClassNames: Record<string, string> = {
    Active:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Inactive:
        'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
    Relocated:
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

function formatNumber(value: number): string {
    return value.toLocaleString();
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

function formatTimestamp(value: string | null): string {
    if (!value) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function flagLabel(value: boolean | null): string {
    if (value === null) {
        return 'Not recorded';
    }

    return value ? 'Yes' : 'No';
}

function optionLabel(value: string | null | undefined): string {
    if (!value) {
        return 'Not recorded';
    }

    return value
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

const emptyHouseholdForm: HouseholdFormData = {
    barangay: '',
    birthdate: '',
    city: 'Mati City',
    contact_number: '',
    gender: '',
    hazard_zone: '',
    head_name: '',
    household_name: '',
    is_pregnant: false,
    status: 'Active',
    street_address: '',
};

const emptyMemberForm: MemberFormData = {
    birthdate: '',
    category: '',
    full_name: '',
    gender: '',
    is_pregnant: false,
    is_pwd: false,
    pwd_type: '',
    pwd_type_other: '',
};

function householdFormDataFromRow(household: HouseholdRow): HouseholdFormData {
    return {
        barangay: household.barangay,
        birthdate: household.head.birthdate ?? '',
        city: household.city ?? 'Mati City',
        contact_number:
            household.head.contactNumber ?? household.contactNumber ?? '',
        gender: household.head.gender ?? '',
        hazard_zone: household.hazardZone ?? '',
        head_name: household.head.name ?? household.headOfFamily,
        household_name: household.name ?? household.headOfFamily,
        is_pregnant: household.head.isPregnant,
        status: household.status,
        street_address: household.address,
    };
}

function memberFormDataFromRow(member: HouseholdMemberRow): MemberFormData {
    return {
        birthdate: member.birthdate ?? '',
        category: member.category ?? '',
        full_name: member.name,
        gender: member.gender ?? '',
        is_pregnant: member.isPregnant,
        is_pwd: member.isPwd ?? false,
        pwd_type: member.pwdType ?? '',
        pwd_type_other: member.pwdTypeOther ?? '',
    };
}

function serializeFilterState(filters: {
    barangay: string;
    search: string;
    status: string;
}): string {
    return JSON.stringify({
        barangay: filters.barangay,
        search: filters.search.trim(),
        status: filters.status,
    });
}

function visiblePaginationPages(currentPage: number, lastPage: number): number[] {
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(lastPage, start + 3);
    const adjustedStart = Math.max(1, end - 3);

    return Array.from(
        { length: end - adjustedStart + 1 },
        (_, index) => adjustedStart + index,
    );
}

export default function HouseholdManagement({
    householdManagement,
}: HouseholdManagementPageProps) {
    const [search, setSearch] = useState(householdManagement.filters.search);
    const deferredSearch = useDeferredValue(search);
    const [barangayFilter, setBarangayFilter] = useState(
        householdManagement.filters.barangay,
    );
    const [statusFilter, setStatusFilter] = useState(
        householdManagement.filters.status,
    );
    const [expandedHouseholdId, setExpandedHouseholdId] = useState<
        number | null
    >(null);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<
        number | null
    >(null);
    const [dialogMode, setDialogMode] = useState<'edit' | 'view'>('view');
    const [memberEditor, setMemberEditor] = useState<MemberEditor | null>(
        null,
    );
    const householdForm = useForm<HouseholdFormData>(emptyHouseholdForm);
    const memberForm = useForm<MemberFormData>(emptyMemberForm);
    const appliedFiltersRef = useRef(
        serializeFilterState({
            barangay: householdManagement.filters.barangay,
            search: householdManagement.filters.search,
            status: householdManagement.filters.status,
        }),
    );
    const selectedHousehold =
        householdManagement.table.rows.find(
            (household) => household.id === selectedHouseholdId,
        ) ?? null;
    const pagination = householdManagement.table.pagination;
    const canManageHouseholds =
        householdManagement.actions.canManageHouseholds;
    const activeExpandedHouseholdId =
        expandedHouseholdId !== null &&
        householdManagement.table.rows.some(
            (household) => household.id === expandedHouseholdId,
        )
            ? expandedHouseholdId
            : null;

    const syncHouseholds = useCallback(
        (nextFilters: {
            barangay: string;
            page?: number;
            search: string;
            status: string;
        }) => {
            router.get(
                householdManagementRoute.url({
                    query: {
                        barangay:
                            nextFilters.barangay === 'all'
                                ? undefined
                                : nextFilters.barangay,
                        page:
                            nextFilters.page && nextFilters.page > 1
                                ? nextFilters.page
                                : undefined,
                        search:
                            nextFilters.search.trim() === ''
                                ? undefined
                                : nextFilters.search.trim(),
                        status:
                            nextFilters.status === 'all'
                                ? undefined
                                : nextFilters.status,
                    },
                }),
                {},
                {
                    only: ['householdManagement'],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        },
        [],
    );

    useEffect(() => {
        const nextFilters = {
            barangay: barangayFilter,
            search: deferredSearch,
            status: statusFilter,
        };
        const serializedFilters = serializeFilterState(nextFilters);

        if (serializedFilters === appliedFiltersRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            appliedFiltersRef.current = serializedFilters;
            syncHouseholds({
                ...nextFilters,
                page: 1,
            });
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [barangayFilter, deferredSearch, statusFilter, syncHouseholds]);

    function resetFilters(): void {
        startTransition(() => {
            setSearch('');
            setBarangayFilter('all');
            setStatusFilter('all');
        });
    }

    function openDialog(
        householdId: number,
        mode: 'edit' | 'view',
    ): void {
        const household = householdManagement.table.rows.find(
            (row) => row.id === householdId,
        );

        setSelectedHouseholdId(householdId);
        setDialogMode(mode);
        setMemberEditor(null);
        memberForm.reset();
        memberForm.clearErrors();

        if (mode === 'edit' && household) {
            householdForm.setData(householdFormDataFromRow(household));
            householdForm.clearErrors();
        }
    }

    function closeDialog(): void {
        setSelectedHouseholdId(null);
        setDialogMode('view');
        setMemberEditor(null);
        householdForm.reset();
        householdForm.clearErrors();
        memberForm.reset();
        memberForm.clearErrors();
    }

    function startEditingSelectedHousehold(): void {
        if (!selectedHousehold) {
            return;
        }

        setDialogMode('edit');
        setMemberEditor(null);
        householdForm.setData(householdFormDataFromRow(selectedHousehold));
        householdForm.clearErrors();
        memberForm.reset();
        memberForm.clearErrors();
    }

    function openMemberCreator(householdId: number): void {
        const household = householdManagement.table.rows.find(
            (row) => row.id === householdId,
        );

        if (!household) {
            return;
        }

        setSelectedHouseholdId(householdId);
        setDialogMode('edit');
        setMemberEditor({ mode: 'create' });
        householdForm.setData(householdFormDataFromRow(household));
        householdForm.clearErrors();
        memberForm.setData(emptyMemberForm);
        memberForm.clearErrors();
    }

    function startEditingMember(member: HouseholdMemberRow): void {
        if (member.databaseId === null) {
            return;
        }

        setMemberEditor({
            memberId: member.databaseId,
            mode: 'edit',
        });
        memberForm.setData(memberFormDataFromRow(member));
        memberForm.clearErrors();
    }

    function startAddingMember(): void {
        setMemberEditor({ mode: 'create' });
        memberForm.setData(emptyMemberForm);
        memberForm.clearErrors();
    }

    function handleHouseholdSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!selectedHousehold) {
            return;
        }

        householdForm.put(updateHousehold.url(selectedHousehold.id), {
            onSuccess: () => {
                setDialogMode('view');
                setMemberEditor(null);
            },
            preserveScroll: true,
        });
    }

    function handleDeleteHousehold(household: HouseholdRow): void {
        if (
            !window.confirm(
                'Permanently delete this household record? This will also remove its members and scan history.',
            )
        ) {
            return;
        }

        router.delete(
            destroyHousehold.url(household.id),
            {
                onSuccess: () => {
                    if (selectedHouseholdId === household.id) {
                        closeDialog();
                    }
                },
                preserveScroll: true,
            },
        );
    }

    function handleMemberSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!selectedHousehold || memberEditor === null) {
            return;
        }

        const options = {
            onSuccess: () => {
                setMemberEditor(null);
                memberForm.reset();
                memberForm.clearErrors();
            },
            preserveScroll: true,
        };

        if (memberEditor.mode === 'edit') {
            memberForm.put(
                updateManagedHouseholdMember.url(memberEditor.memberId),
                options,
            );

            return;
        }

        memberForm.post(
            storeManagedHouseholdMember.url(selectedHousehold.id),
            options,
        );
    }

    function handleDeleteMember(member: HouseholdMemberRow): void {
        if (member.databaseId === null) {
            return;
        }

        router.delete(destroyManagedHouseholdMember.url(member.databaseId), {
            preserveScroll: true,
        });
    }

    function goToPage(page: number): void {
        syncHouseholds({
            barangay: barangayFilter,
            page,
            search,
            status: statusFilter,
        });
    }

    return (
        <>
            <Head title="Household Management" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_20%),linear-gradient(140deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_42%,rgba(240,253,250,0.96)_100%)] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_20%),linear-gradient(140deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_42%,rgba(6,78,59,0.34)_100%)] md:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                Resident Registry
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Household Management
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                Manage registered households and view family
                                members. This page stays focused on household
                                records, family composition, and registry
                                details only.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <Home className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Registry Focus
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No QR scanning, alerts, or evacuation logs
                                    are mixed into this screen.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <UsersRound className="size-4" />
                                    <p className="text-sm font-semibold">
                                        Family View
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Expand a row to inspect household members,
                                    flags, and contact details quickly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(220px,0.75fr))_auto] xl:items-center">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.currentTarget.value)
                                }
                                placeholder="Search head, household ID, or address"
                            />
                        </div>

                        <Select
                            value={barangayFilter}
                            onValueChange={setBarangayFilter}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All barangays</SelectItem>
                                {householdManagement.filters.barangays.map(
                                    (barangay) => (
                                        <SelectItem
                                            key={barangay}
                                            value={barangay}
                                        >
                                            {barangay}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {householdManagement.filters.statuses.map(
                                    (status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        <div className="flex justify-start xl:justify-end">
                            <Button
                                variant="outline"
                                className="h-12 rounded-2xl"
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <p>
                            Showing{' '}
                            <span className="font-semibold text-foreground">
                                {pagination.from ?? 0}
                            </span>{' '}
                            to{' '}
                            <span className="font-semibold text-foreground">
                                {pagination.to ?? 0}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-foreground">
                                {formatNumber(pagination.total)}
                            </span>{' '}
                            households in the current result set.
                        </p>
                        <p>
                            Search updates automatically as you type and keeps
                            the current filters in the URL.
                        </p>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(236,253,245,0.96)_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(6,78,59,0.34)_100%)]">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Households
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                            {formatNumber(
                                householdManagement.summary.totalHouseholds,
                            )}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Registered household profiles currently available in
                            the city registry.
                        </p>
                    </div>

                    <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.96)_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(12,74,110,0.34)_100%)]">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Total Registered Members
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                            {formatNumber(
                                householdManagement.summary
                                    .totalRegisteredMembers,
                            )}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Includes each household head plus every recorded
                            family member.
                        </p>
                    </div>

                    <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,247,237,0.96)_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(124,45,18,0.34)_100%)]">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Barangays Covered
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                            {formatNumber(
                                householdManagement.summary.barangaysCovered,
                            )}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Active registry coverage across barangays with at
                            least one household record.
                        </p>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                Household Table
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                Registered households and family members
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Click the arrow or anywhere on a household row
                                to expand the family details, contact data, and
                                household member list.
                            </p>
                        </div>

                        <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            Household actions are centered here so admins can
                            review records without switching to evacuation or
                            alert modules.
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                <thead className="bg-slate-50/90 dark:bg-slate-900/90">
                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="w-14 px-4 py-3">View</th>
                                        <th className="px-4 py-3">Household ID</th>
                                        <th className="px-4 py-3">
                                            Head of Family
                                        </th>
                                        <th className="px-4 py-3">Barangay</th>
                                        <th className="px-4 py-3">Address</th>
                                        <th className="px-4 py-3">Members</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                    {householdManagement.table.rows.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="px-6 py-12 text-center text-sm leading-7 text-muted-foreground"
                                            >
                                                No households matched the current
                                                filters. Try another household
                                                ID, head name, address, barangay,
                                                or status.
                                            </td>
                                        </tr>
                                    ) : (
                                        householdManagement.table.rows.map(
                                            (household) => {
                                                const isExpanded =
                                                    activeExpandedHouseholdId ===
                                                    household.id;

                                                return (
                                                    <Fragment
                                                        key={household.id}
                                                    >
                                                        <tr
                                                            className={cn(
                                                                'cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-900/70',
                                                                isExpanded &&
                                                                    'bg-slate-50/80 dark:bg-slate-900/60',
                                                            )}
                                                            onClick={() =>
                                                                setExpandedHouseholdId(
                                                                    isExpanded
                                                                        ? null
                                                                        : household.id,
                                                                )
                                                            }
                                                        >
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        setExpandedHouseholdId(
                                                                            isExpanded
                                                                                ? null
                                                                                : household.id,
                                                                        );
                                                                    }}
                                                                >
                                                                    <ChevronDown
                                                                        className={cn(
                                                                            'size-4 transition-transform',
                                                                            isExpanded &&
                                                                                'rotate-180',
                                                                        )}
                                                                    />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="space-y-1">
                                                                    <p className="font-semibold text-foreground">
                                                                        {
                                                                            household.householdCode
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        QR:{' '}
                                                                        {
                                                                            household.qrReference
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <p className="font-semibold text-foreground">
                                                                    {
                                                                        household.headOfFamily
                                                                    }
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-medium text-foreground">
                                                                {
                                                                    household.barangay
                                                                }
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="max-w-[220px]">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        {
                                                                            household.address
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        Full
                                                                        details
                                                                        in
                                                                        expanded
                                                                        view
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-semibold text-foreground">
                                                                {formatNumber(
                                                                    household.totalMembers,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                                    <Phone className="size-3.5 text-muted-foreground" />
                                                                    <span>
                                                                        {household.contactNumber ??
                                                                            'Not recorded'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                                                        statusBadgeClassNames[
                                                                            household
                                                                                .status
                                                                        ],
                                                                    )}
                                                                >
                                                                    {
                                                                        household.status
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div
                                                                    className="flex flex-wrap gap-2"
                                                                    onClick={(
                                                                        event,
                                                                    ) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="size-8 rounded-full p-0"
                                                                        title="View household"
                                                                        aria-label="View household"
                                                                        onClick={() =>
                                                                            openDialog(
                                                                                household.id,
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
                                                                        title="Edit household"
                                                                        aria-label="Edit household"
                                                                        disabled={
                                                                            !canManageHouseholds
                                                                        }
                                                                        onClick={() =>
                                                                            openDialog(
                                                                                household.id,
                                                                                'edit',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="size-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="size-8 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                                                        title="Delete household"
                                                                        aria-label="Delete household"
                                                                        disabled={
                                                                            !canManageHouseholds ||
                                                                            household.status ===
                                                                                'Inactive'
                                                                        }
                                                                        onClick={() =>
                                                                            handleDeleteHousehold(
                                                                                household,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {isExpanded ? (
                                                            <tr
                                                                key={`expanded-${household.id}`}
                                                            >
                                                                <td
                                                                    colSpan={9}
                                                                    className="bg-slate-50/80 px-4 py-5 dark:bg-slate-900/60"
                                                                >
                                                                    <div className="space-y-5 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                                            <div>
                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                    <p className="text-lg font-semibold text-foreground">
                                                                                        {
                                                                                            household.householdCode
                                                                                        }
                                                                                    </p>
                                                                                    <span
                                                                                        className={cn(
                                                                                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                                                                            statusBadgeClassNames[
                                                                                                household
                                                                                                    .status
                                                                                            ],
                                                                                        )}
                                                                                    >
                                                                                        {
                                                                                            household.status
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <p className="mt-2 text-sm text-muted-foreground">
                                                                                    {
                                                                                        household.headOfFamily
                                                                                    }{' '}
                                                                                    from{' '}
                                                                                    {
                                                                                        household.barangay
                                                                                    }{' '}
                                                                                    with{' '}
                                                                                    {formatNumber(
                                                                                        household.totalMembers,
                                                                                    )}{' '}
                                                                                    registered
                                                                                    members.
                                                                                </p>
                                                                            </div>

                                                                            <div className="flex flex-wrap gap-2">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className="size-9 rounded-full p-0"
                                                                                    title="View household"
                                                                                    aria-label="View household"
                                                                                    onClick={() =>
                                                                                        openDialog(
                                                                                            household.id,
                                                                                            'view',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Eye className="size-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    className="size-9 rounded-full p-0"
                                                                                    title="Edit household"
                                                                                    aria-label="Edit household"
                                                                                    disabled={
                                                                                        !canManageHouseholds
                                                                                    }
                                                                                    onClick={() =>
                                                                                        openDialog(
                                                                                            household.id,
                                                                                            'edit',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Pencil className="size-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    className="size-9 rounded-full p-0"
                                                                                    title="Add member"
                                                                                    aria-label="Add member"
                                                                                    disabled={
                                                                                        !canManageHouseholds
                                                                                    }
                                                                                    onClick={() =>
                                                                                        openMemberCreator(
                                                                                            household.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Plus className="size-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                                    Full
                                                                                    Address
                                                                                </p>
                                                                                <p className="mt-2 font-semibold text-foreground">
                                                                                    {
                                                                                        household.fullAddress
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                                    Contact
                                                                                </p>
                                                                                <p className="mt-2 font-semibold text-foreground">
                                                                                    {household.contactNumber ??
                                                                                        'Not recorded'}
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                                    Registered
                                                                                </p>
                                                                                <p className="mt-2 font-semibold text-foreground">
                                                                                    {formatDate(
                                                                                        household.registeredAt,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                                    Last
                                                                                    Updated
                                                                                </p>
                                                                                <p className="mt-2 font-semibold text-foreground">
                                                                                    {formatTimestamp(
                                                                                        household.lastUpdatedAt,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div>
                                                                                    <p className="text-sm font-semibold text-foreground">
                                                                                        Members
                                                                                    </p>
                                                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                                                        Family
                                                                                        members,
                                                                                        vulnerability
                                                                                        flags,
                                                                                        and
                                                                                        household
                                                                                        roles.
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="mt-4 overflow-x-auto rounded-[22px] border border-slate-200/80 dark:border-slate-800">
                                                                                <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                                                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                                                                        <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                                                                            <th className="px-4 py-3">
                                                                                                Member
                                                                                                Name
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                Age
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                Sex
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                Role
                                                                                                /
                                                                                                Relationship
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                PWD
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                Senior
                                                                                            </th>
                                                                                            <th className="px-4 py-3">
                                                                                                Pregnant
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                                                                        {household.members.map(
                                                                                            (
                                                                                                member,
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        member.id
                                                                                                    }
                                                                                                >
                                                                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                                                                        {
                                                                                                            member.name
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {member.age ??
                                                                                                            '-'}
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {
                                                                                                            member.sex
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {
                                                                                                            member.relation
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {flagLabel(
                                                                                                            member.isPwd,
                                                                                                        )}
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {member.isSenior
                                                                                                            ? 'Yes'
                                                                                                            : 'No'}
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 text-sm text-foreground">
                                                                                                        {member.isPregnant
                                                                                                            ? 'Yes'
                                                                                                            : 'No'}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ),
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : null}
                                                    </Fragment>
                                                );
                                            },
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagination.hasPages ? (
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    goToPage(
                                        Math.max(
                                            pagination.currentPage - 1,
                                            1,
                                        ),
                                    )
                                }
                                disabled={pagination.currentPage === 1}
                            >
                                Previous
                            </Button>

                            {visiblePaginationPages(
                                pagination.currentPage,
                                pagination.lastPage,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === pagination.currentPage
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => goToPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    goToPage(
                                        Math.min(
                                            pagination.currentPage + 1,
                                            pagination.lastPage,
                                        ),
                                    )
                                }
                                disabled={
                                    pagination.currentPage ===
                                    pagination.lastPage
                                }
                            >
                                Next
                            </Button>
                        </div>
                    ) : null}
                </section>
            </div>

            <Dialog
                open={selectedHousehold !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'edit'
                                ? 'Edit Household'
                                : 'Household Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'edit'
                                ? 'Update the household profile and member roster. Changes save directly to the registry.'
                                : 'Review the household profile, family members, and current registry flags in one place.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedHousehold ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Household ID
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.householdCode}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Head of Family
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.headOfFamily}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Barangay
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.barangay}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Status
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                            statusBadgeClassNames[
                                                selectedHousehold.status
                                            ],
                                        )}
                                    >
                                        {selectedHousehold.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Full Address
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.fullAddress}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Contact Number
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.contactNumber ??
                                            'Not recorded'}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Total Members
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(
                                            selectedHousehold.totalMembers,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Hazard Zone
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {optionLabel(
                                            selectedHousehold.hazardZone,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Registration Date
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatDate(
                                            selectedHousehold.registeredAt,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        QR Reference
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedHousehold.qrReference}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Last Updated
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatTimestamp(
                                            selectedHousehold.lastUpdatedAt,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {dialogMode === 'edit' && canManageHouseholds ? (
                                <form
                                    onSubmit={handleHouseholdSubmit}
                                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Household Profile
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Minimal fields only. Keep the
                                                registry accurate and readable.
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={householdForm.processing}
                                            className="rounded-full"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="household_name">
                                                Household Name
                                            </Label>
                                            <Input
                                                id="household_name"
                                                value={
                                                    householdForm.data
                                                        .household_name
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'household_name',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .household_name
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="head_name">
                                                Head of Family
                                            </Label>
                                            <Input
                                                id="head_name"
                                                value={
                                                    householdForm.data.head_name
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'head_name',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .head_name
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="contact_number">
                                                Contact Number
                                            </Label>
                                            <Input
                                                id="contact_number"
                                                value={
                                                    householdForm.data
                                                        .contact_number
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'contact_number',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .contact_number
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="birthdate">
                                                Head Birthdate
                                            </Label>
                                            <Input
                                                id="birthdate"
                                                type="date"
                                                value={
                                                    householdForm.data.birthdate
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'birthdate',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .birthdate
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">Sex</Label>
                                            <select
                                                id="gender"
                                                value={
                                                    householdForm.data.gender
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        (current) => ({
                                                            ...current,
                                                            gender: event
                                                                .currentTarget
                                                                .value,
                                                            is_pregnant:
                                                                event
                                                                    .currentTarget
                                                                    .value ===
                                                                'female'
                                                                    ? current.is_pregnant
                                                                    : false,
                                                        }),
                                                    )
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                            >
                                                <option value="">
                                                    Select sex
                                                </option>
                                                <option value="male">
                                                    Male
                                                </option>
                                                <option value="female">
                                                    Female
                                                </option>
                                            </select>
                                            <InputError
                                                message={
                                                    householdForm.errors.gender
                                                }
                                            />
                                        </div>

                                        <label className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    householdForm.data
                                                        .is_pregnant
                                                }
                                                disabled={
                                                    householdForm.data.gender !==
                                                    'female'
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'is_pregnant',
                                                        event.currentTarget
                                                            .checked,
                                                    )
                                                }
                                                className="mt-1"
                                            />
                                            <span>
                                                <span className="block text-sm font-semibold text-foreground">
                                                    Pregnant
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    Available only when sex is
                                                    female.
                                                </span>
                                                <InputError
                                                    message={
                                                        householdForm.errors
                                                            .is_pregnant
                                                    }
                                                />
                                            </span>
                                        </label>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="street_address">
                                                Street Address
                                            </Label>
                                            <Input
                                                id="street_address"
                                                value={
                                                    householdForm.data
                                                        .street_address
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'street_address',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .street_address
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="barangay">
                                                Barangay
                                            </Label>
                                            <select
                                                id="barangay"
                                                value={
                                                    householdForm.data.barangay
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'barangay',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                            >
                                                <option value="">
                                                    Select barangay
                                                </option>
                                                {householdManagement.filters.barangays.map(
                                                    (barangay) => (
                                                        <option
                                                            key={barangay}
                                                            value={barangay}
                                                        >
                                                            {barangay}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .barangay
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={householdForm.data.city}
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'city',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    householdForm.errors.city
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="hazard_zone">
                                                Hazard Zone
                                            </Label>
                                            <select
                                                id="hazard_zone"
                                                value={
                                                    householdForm.data
                                                        .hazard_zone
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'hazard_zone',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                            >
                                                <option value="">
                                                    Select hazard zone
                                                </option>
                                                {householdManagement.options.hazardZones.map(
                                                    (hazardZone) => (
                                                        <option
                                                            key={hazardZone}
                                                            value={hazardZone}
                                                        >
                                                            {optionLabel(
                                                                hazardZone,
                                                            )}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <InputError
                                                message={
                                                    householdForm.errors
                                                        .hazard_zone
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <select
                                                id="status"
                                                value={
                                                    householdForm.data.status
                                                }
                                                onChange={(event) =>
                                                    householdForm.setData(
                                                        'status',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                            >
                                                {householdManagement.filters.statuses.map(
                                                    (status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <InputError
                                                message={
                                                    householdForm.errors.status
                                                }
                                            />
                                        </div>
                                    </div>
                                </form>
                            ) : null}

                            <div className="rounded-[24px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            Household Members
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Add, edit, or remove non-head
                                            members from this household.
                                        </p>
                                    </div>
                                    {dialogMode === 'edit' &&
                                    canManageHouseholds ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-full"
                                            onClick={startAddingMember}
                                        >
                                            <Plus className="size-4" />
                                            Add Member
                                        </Button>
                                    ) : null}
                                </div>

                                {dialogMode === 'edit' &&
                                canManageHouseholds &&
                                memberEditor !== null ? (
                                    <form
                                        onSubmit={handleMemberSubmit}
                                        className="border-b border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {memberEditor.mode ===
                                                    'create'
                                                        ? 'Add Member'
                                                        : 'Edit Member'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Member information updates
                                                    the scan roster and registry
                                                    lists.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="rounded-full"
                                                    onClick={() => {
                                                        setMemberEditor(null);
                                                        memberForm.reset();
                                                        memberForm.clearErrors();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        memberForm.processing
                                                    }
                                                    className="rounded-full"
                                                >
                                                    {memberEditor.mode ===
                                                    'create'
                                                        ? 'Add Member'
                                                        : 'Save Member'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="member_full_name">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="member_full_name"
                                                    value={
                                                        memberForm.data
                                                            .full_name
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            'full_name',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        memberForm.errors
                                                            .full_name
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="member_gender">
                                                    Sex
                                                </Label>
                                                <select
                                                    id="member_gender"
                                                    value={
                                                        memberForm.data.gender
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            (current) => ({
                                                                ...current,
                                                                gender: event
                                                                    .currentTarget
                                                                    .value,
                                                                is_pregnant:
                                                                    event
                                                                        .currentTarget
                                                                        .value ===
                                                                    'female'
                                                                        ? current.is_pregnant
                                                                        : false,
                                                            }),
                                                        )
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                                >
                                                    <option value="">
                                                        Select sex
                                                    </option>
                                                    <option value="male">
                                                        Male
                                                    </option>
                                                    <option value="female">
                                                        Female
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        memberForm.errors.gender
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="member_birthdate">
                                                    Birthdate
                                                </Label>
                                                <Input
                                                    id="member_birthdate"
                                                    type="date"
                                                    value={
                                                        memberForm.data
                                                            .birthdate
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            'birthdate',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        memberForm.errors
                                                            .birthdate
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="member_category">
                                                    Category
                                                </Label>
                                                <select
                                                    id="member_category"
                                                    value={
                                                        memberForm.data.category
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            'category',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                                >
                                                    <option value="">
                                                        Select category
                                                    </option>
                                                    <option value="Child">
                                                        Child
                                                    </option>
                                                    <option value="Adult">
                                                        Adult
                                                    </option>
                                                    <option value="Senior">
                                                        Senior
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        memberForm.errors
                                                            .category
                                                    }
                                                />
                                            </div>

                                            <label className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        memberForm.data.is_pwd
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            (current) => ({
                                                                ...current,
                                                                is_pwd:
                                                                    event
                                                                        .currentTarget
                                                                        .checked,
                                                                pwd_type: event
                                                                    .currentTarget
                                                                    .checked
                                                                    ? current.pwd_type
                                                                    : '',
                                                                pwd_type_other:
                                                                    event
                                                                        .currentTarget
                                                                        .checked
                                                                        ? current.pwd_type_other
                                                                        : '',
                                                            }),
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-semibold text-foreground">
                                                        PWD
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Mark if the member needs
                                                        disability support.
                                                    </span>
                                                    <InputError
                                                        message={
                                                            memberForm.errors
                                                                .is_pwd
                                                        }
                                                    />
                                                </span>
                                            </label>

                                            <label className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        memberForm.data
                                                            .is_pregnant
                                                    }
                                                    disabled={
                                                        memberForm.data
                                                            .gender !==
                                                        'female'
                                                    }
                                                    onChange={(event) =>
                                                        memberForm.setData(
                                                            'is_pregnant',
                                                            event.currentTarget
                                                                .checked,
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-semibold text-foreground">
                                                        Pregnant
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Available only when sex
                                                        is female.
                                                    </span>
                                                    <InputError
                                                        message={
                                                            memberForm.errors
                                                                .is_pregnant
                                                        }
                                                    />
                                                </span>
                                            </label>

                                            {memberForm.data.is_pwd ? (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="member_pwd_type">
                                                            PWD Type
                                                        </Label>
                                                        <select
                                                            id="member_pwd_type"
                                                            value={
                                                                memberForm.data
                                                                    .pwd_type
                                                            }
                                                            onChange={(event) =>
                                                                memberForm.setData(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        pwd_type:
                                                                            event
                                                                                .currentTarget
                                                                                .value,
                                                                        pwd_type_other:
                                                                            event
                                                                                .currentTarget
                                                                                .value ===
                                                                            'other'
                                                                                ? current.pwd_type_other
                                                                                : '',
                                                                    }),
                                                                )
                                                            }
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                                        >
                                                            <option value="">
                                                                Select PWD type
                                                            </option>
                                                            {householdManagement.options.pwdTypes.map(
                                                                (pwdType) => (
                                                                    <option
                                                                        key={
                                                                            pwdType
                                                                        }
                                                                        value={
                                                                            pwdType
                                                                        }
                                                                    >
                                                                        {optionLabel(
                                                                            pwdType,
                                                                        )}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                        <InputError
                                                            message={
                                                                memberForm
                                                                    .errors
                                                                    .pwd_type
                                                            }
                                                        />
                                                    </div>

                                                    {memberForm.data
                                                        .pwd_type ===
                                                    'other' ? (
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="member_pwd_type_other">
                                                                Specify PWD Type
                                                            </Label>
                                                            <Input
                                                                id="member_pwd_type_other"
                                                                value={
                                                                    memberForm
                                                                        .data
                                                                        .pwd_type_other
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    memberForm.setData(
                                                                        'pwd_type_other',
                                                                        event
                                                                            .currentTarget
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    memberForm
                                                                        .errors
                                                                        .pwd_type_other
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                </>
                                            ) : null}
                                        </div>
                                    </form>
                                ) : null}

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200/80 dark:divide-slate-800">
                                        <thead className="bg-slate-50 dark:bg-slate-900">
                                            <tr className="text-left text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                                <th className="px-4 py-3">
                                                    Member Name
                                                </th>
                                                <th className="px-4 py-3">
                                                    Age
                                                </th>
                                                <th className="px-4 py-3">
                                                    Sex
                                                </th>
                                                <th className="px-4 py-3">
                                                    Relationship
                                                </th>
                                                <th className="px-4 py-3">
                                                    PWD
                                                </th>
                                                <th className="px-4 py-3">
                                                    Senior
                                                </th>
                                                <th className="px-4 py-3">
                                                    Pregnant
                                                </th>
                                                {dialogMode === 'edit' &&
                                                canManageHouseholds ? (
                                                    <th className="px-4 py-3">
                                                        Actions
                                                    </th>
                                                ) : null}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200/80 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                            {selectedHousehold.members.map(
                                                (member) => (
                                                    <tr key={member.id}>
                                                        <td className="px-4 py-3 font-medium text-foreground">
                                                            <div>
                                                                <p>
                                                                    {
                                                                        member.name
                                                                    }
                                                                </p>
                                                                {member.pwdType ? (
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        {optionLabel(
                                                                            member.pwdType,
                                                                        )}
                                                                        {member.pwdTypeOther
                                                                            ? `: ${member.pwdTypeOther}`
                                                                            : ''}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {member.age ?? '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {member.sex}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {member.relation}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {flagLabel(
                                                                member.isPwd,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {member.isSenior
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-foreground">
                                                            {member.isPregnant
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </td>
                                                        {dialogMode ===
                                                            'edit' &&
                                                        canManageHouseholds ? (
                                                            <td className="px-4 py-3">
                                                                {member.type ===
                                                                'member' ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="size-8 rounded-full p-0"
                                                                            title="Edit member"
                                                                            aria-label="Edit member"
                                                                            onClick={() =>
                                                                                startEditingMember(
                                                                                    member,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="size-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="size-8 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                                                            title="Delete member"
                                                                            aria-label="Delete member"
                                                                            onClick={() =>
                                                                                handleDeleteMember(
                                                                                    member,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Edit in
                                                                        profile
                                                                        form
                                                                    </span>
                                                                )}
                                                            </td>
                                                        ) : null}
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2">
                        {selectedHousehold &&
                        canManageHouseholds &&
                        dialogMode === 'view' ? (
                            <Button
                                variant="outline"
                                className="size-9 rounded-full p-0"
                                title="Edit household"
                                aria-label="Edit household"
                                onClick={startEditingSelectedHousehold}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        ) : null}
                        {selectedHousehold &&
                        canManageHouseholds &&
                        selectedHousehold.status !== 'Inactive' ? (
                            <Button
                                variant="ghost"
                                className="size-9 rounded-full p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                title="Delete household"
                                aria-label="Delete household"
                                onClick={() =>
                                    handleDeleteHousehold(selectedHousehold)
                                }
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost"
                            className="h-9 rounded-full px-3 text-xs"
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

HouseholdManagement.layout = {
    breadcrumbs: [
        {
            title: 'Household Management',
            href: householdManagementRoute(),
        },
    ],
};
