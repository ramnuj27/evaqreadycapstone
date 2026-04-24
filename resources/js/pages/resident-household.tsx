import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit3, Home, Plus, Trash2, UsersRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
    destroyHouseholdMember,
    storeHouseholdMember,
    updateHouseholdMember,
} from '@/actions/App/Http/Controllers/ResidentController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    residentAge,
    residentDate,
    residentFlags,
    residentLabel,
    residentRelationLabel,
} from '@/lib/resident';
import resident from '@/routes/resident';

type HouseholdMemberRecord = {
    birthdate?: string | null;
    category: string;
    fullName: string;
    gender?: string | null;
    id: number;
    isPregnant: boolean;
    isPwd: boolean;
    pwdType?: string | null;
    pwdTypeOther?: string | null;
};

type HouseholdHead = {
    birthdate?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    gender?: string | null;
    isPregnant: boolean;
    isPwd: boolean;
    name?: string | null;
    pwdType?: string | null;
    pwdTypeOther?: string | null;
};

type HouseholdPayload = {
    address: string;
    barangay: string;
    city?: string | null;
    evacuationStatus: {
        label: string;
        tone: string;
    };
    hazardZone: {
        key?: string | null;
        label: string;
    };
    head: HouseholdHead;
    householdCode: string;
    householdRole: string;
    members: HouseholdMemberRecord[];
    name: string;
    streetAddress: string;
    totalResidents: number;
};

type ResidentHouseholdProps = {
    household: HouseholdPayload | null;
    pwdTypes: string[];
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

const toneBadgeClassNames: Record<string, string> = {
    critical:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
    default:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    warning:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
};

function formDataFromMember(member: HouseholdMemberRecord): MemberFormData {
    return {
        birthdate: member.birthdate ?? '',
        category: member.category,
        full_name: member.fullName,
        gender: member.gender ?? '',
        is_pregnant: member.isPregnant,
        is_pwd: member.isPwd,
        pwd_type: member.pwdType ?? '',
        pwd_type_other: member.pwdTypeOther ?? '',
    };
}

export default function ResidentHousehold({
    household,
    pwdTypes,
}: ResidentHouseholdProps) {
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const form = useForm<MemberFormData>(emptyMemberForm);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                form.reset();
                setEditingMemberId(null);
                setShowForm(false);
            },
            preserveScroll: true,
        };

        if (editingMemberId !== null) {
            form.put(updateHouseholdMember.url(editingMemberId), options);

            return;
        }

        form.post(storeHouseholdMember.url(), options);
    };

    const handleEditMember = (member: HouseholdMemberRecord) => {
        setEditingMemberId(member.id);
        setShowForm(true);
        form.setData(formDataFromMember(member));
    };

    const handleAddMember = () => {
        setEditingMemberId(null);
        setShowForm(true);
        form.reset();
    };

    const handleDeleteMember = (memberId: number) => {
        router.delete(destroyHouseholdMember.url(memberId), {
            preserveScroll: true,
        });
    };

    const headFlags = household
        ? residentFlags({
              category: null,
              isPregnant: household.head.isPregnant,
              isPwd: household.head.isPwd,
          })
        : [];

    return (
        <>
            <Head title="My Household" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#ecfdf5_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#052e16_100%)] md:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                Family Record
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                My Household
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review your household code, head of family
                                details, member roster, and vulnerability flags
                                in one place.
                            </p>
                        </div>

                        {household ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        Household ID
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-foreground">
                                        {household.householdCode}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {household.totalResidents} total resident
                                        {household.totalResidents === 1 ? '' : 's'}
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        Evacuation Status
                                    </p>
                                    <Badge
                                        className={`mt-2 ${toneBadgeClassNames[household.evacuationStatus.tone]}`}
                                        variant="outline"
                                    >
                                        {household.evacuationStatus.label}
                                    </Badge>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Hazard zone: {household.hazardZone.label}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                {!household ? (
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No household information is available for this
                            resident account yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-4">
                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Home className="size-5 text-emerald-600" />
                                        Household Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Head of Family
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {household.head.name ?? household.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Role
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {household.householdRole}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Address
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {household.address}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Contact Number
                                        </p>
                                        <p className="mt-2 font-semibold text-foreground">
                                            {household.head.contactNumber ?? 'Not provided'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <UsersRound className="size-5 text-sky-600" />
                                            Household Members
                                        </CardTitle>
                                        <CardDescription>
                                            Add, review, and update family
                                            members linked to this household.
                                        </CardDescription>
                                    </div>

                                    {!showForm ? (
                                        <Button
                                            type="button"
                                            className="rounded-full"
                                            onClick={handleAddMember}
                                        >
                                            <Plus className="size-4" />
                                            Add Member
                                        </Button>
                                    ) : null}
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {showForm ? (
                                        <form
                                            onSubmit={handleSubmit}
                                            className="rounded-[24px] border border-border/70 bg-muted/20 p-5"
                                        >
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2 md:col-span-2">
                                                    <Label htmlFor="full_name">
                                                        Full Name
                                                    </Label>
                                                    <Input
                                                        id="full_name"
                                                        value={form.data.full_name}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'full_name',
                                                                event.currentTarget.value,
                                                            )
                                                        }
                                                        placeholder="Member full name"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors.full_name
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="gender">
                                                        Sex
                                                    </Label>
                                                    <select
                                                        id="gender"
                                                        value={form.data.gender}
                                                        onChange={(event) =>
                                                            form.setData((current) => ({
                                                                ...current,
                                                                gender:
                                                                    event.currentTarget
                                                                        .value,
                                                                is_pregnant:
                                                                    event.currentTarget
                                                                        .value ===
                                                                    'female'
                                                                        ? current.is_pregnant
                                                                        : false,
                                                            }))
                                                        }
                                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
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
                                                        message={form.errors.gender}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="birthdate">
                                                        Birthdate
                                                    </Label>
                                                    <Input
                                                        id="birthdate"
                                                        type="date"
                                                        value={form.data.birthdate}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'birthdate',
                                                                event.currentTarget.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors.birthdate
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="category">
                                                        Category
                                                    </Label>
                                                    <select
                                                        id="category"
                                                        value={form.data.category}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'category',
                                                                event.currentTarget.value,
                                                            )
                                                        }
                                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
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
                                                            form.errors.category
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                                <label className="flex items-start gap-3 rounded-[20px] border border-border/70 p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.is_pwd}
                                                        onChange={(event) =>
                                                            form.setData((current) => ({
                                                                ...current,
                                                                is_pwd:
                                                                    event.currentTarget
                                                                        .checked,
                                                                pwd_type:
                                                                    event.currentTarget
                                                                        .checked
                                                                        ? current.pwd_type
                                                                        : '',
                                                                pwd_type_other:
                                                                    event.currentTarget
                                                                        .checked
                                                                        ? current.pwd_type_other
                                                                        : '',
                                                            }))
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            PWD
                                                        </p>
                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            Mark this if the
                                                            member needs
                                                            disability support.
                                                        </p>
                                                    </div>
                                                </label>

                                                <label className="flex items-start gap-3 rounded-[20px] border border-border/70 p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.is_pregnant}
                                                        disabled={
                                                            form.data.gender !==
                                                            'female'
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'is_pregnant',
                                                                event.currentTarget
                                                                    .checked,
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            Pregnant
                                                        </p>
                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            Available only for a
                                                            female member.
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>

                                            {form.data.is_pwd ? (
                                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="pwd_type">
                                                            PWD Type
                                                        </Label>
                                                        <select
                                                            id="pwd_type"
                                                            value={form.data.pwd_type}
                                                            onChange={(event) =>
                                                                form.setData((current) => ({
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
                                                                }))
                                                            }
                                                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                                        >
                                                            <option value="">
                                                                Select PWD type
                                                            </option>
                                                            {pwdTypes.map((pwdType) => (
                                                                <option
                                                                    key={pwdType}
                                                                    value={pwdType}
                                                                >
                                                                    {residentLabel(
                                                                        pwdType,
                                                                    )}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <InputError
                                                            message={
                                                                form.errors
                                                                    .pwd_type
                                                            }
                                                        />
                                                    </div>

                                                    {form.data.pwd_type ===
                                                    'other' ? (
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="pwd_type_other">
                                                                Specify PWD Type
                                                            </Label>
                                                            <Input
                                                                id="pwd_type_other"
                                                                value={
                                                                    form.data
                                                                        .pwd_type_other
                                                                }
                                                                onChange={(event) =>
                                                                    form.setData(
                                                                        'pwd_type_other',
                                                                        event
                                                                            .currentTarget
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Describe the PWD type"
                                                            />
                                                            <InputError
                                                                message={
                                                                    form.errors
                                                                        .pwd_type_other
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                                <Button
                                                    type="submit"
                                                    disabled={form.processing}
                                                    className="rounded-full px-6"
                                                >
                                                    {editingMemberId === null
                                                        ? 'Add Member'
                                                        : 'Update Member'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-full"
                                                    onClick={() => {
                                                        form.reset();
                                                        setEditingMemberId(null);
                                                        setShowForm(false);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    ) : null}

                                    <div className="overflow-hidden rounded-[24px] border border-border/70">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/40">
                                                    <tr className="text-left text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                                        <th className="px-4 py-3">
                                                            Name
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Age
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Sex
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Relation
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Flags
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border bg-card">
                                                    <tr className="align-top">
                                                        <td className="px-4 py-4">
                                                            <p className="font-semibold text-foreground">
                                                                {household.head.name ??
                                                                    household.name}
                                                            </p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {household.head.email ??
                                                                    'Household head'}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-foreground">
                                                            {residentAge(
                                                                household.head.birthdate,
                                                            ) ?? 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-foreground">
                                                            {residentLabel(
                                                                household.head.gender,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-foreground">
                                                            {residentRelationLabel(
                                                                null,
                                                                true,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {headFlags.length ===
                                                                0 ? (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        None
                                                                    </span>
                                                                ) : (
                                                                    headFlags.map(
                                                                        (flag) => (
                                                                            <Badge
                                                                                key={
                                                                                    flag
                                                                                }
                                                                                variant="outline"
                                                                            >
                                                                                {
                                                                                    flag
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-muted-foreground">
                                                            Managed from
                                                            profile
                                                        </td>
                                                    </tr>

                                                    {household.members.map(
                                                        (member) => {
                                                            const flags =
                                                                residentFlags({
                                                                    category:
                                                                        member.category,
                                                                    isPregnant:
                                                                        member.isPregnant,
                                                                    isPwd:
                                                                        member.isPwd,
                                                                });

                                                            return (
                                                                <tr
                                                                    key={member.id}
                                                                    className="align-top"
                                                                >
                                                                    <td className="px-4 py-4">
                                                                        <p className="font-semibold text-foreground">
                                                                            {
                                                                                member.fullName
                                                                            }
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                                            {residentDate(
                                                                                member.birthdate,
                                                                            )}
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                                        {residentAge(
                                                                            member.birthdate,
                                                                        ) ??
                                                                            'N/A'}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                                        {residentLabel(
                                                                            member.gender,
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm text-foreground">
                                                                        {residentRelationLabel(
                                                                            member.category,
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-4">
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {flags.length ===
                                                                            0 ? (
                                                                                <span className="text-sm text-muted-foreground">
                                                                                    None
                                                                                </span>
                                                                            ) : (
                                                                                flags.map(
                                                                                    (
                                                                                        flag,
                                                                                    ) => (
                                                                                        <Badge
                                                                                            key={
                                                                                                flag
                                                                                            }
                                                                                            variant="outline"
                                                                                        >
                                                                                            {
                                                                                                flag
                                                                                            }
                                                                                        </Badge>
                                                                                    ),
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-4">
                                                                        <div className="flex flex-wrap gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() =>
                                                                                    handleEditMember(
                                                                                        member,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Edit3 className="size-3.5" />
                                                                                Edit
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-rose-600 hover:text-rose-700"
                                                                                onClick={() =>
                                                                                    handleDeleteMember(
                                                                                        member.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="size-3.5" />
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        Household Snapshot
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Household Name
                                        </p>
                                        <p className="mt-1 font-medium text-foreground">
                                            {household.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Barangay
                                        </p>
                                        <p className="mt-1 font-medium text-foreground">
                                            {household.barangay}
                                            {household.city
                                                ? `, ${household.city}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            QR Access
                                        </p>
                                        <p className="mt-1 font-medium text-foreground">
                                            Linked to household code{' '}
                                            {household.householdCode}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[30px] border-border/70 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        Quick Access
                                    </CardTitle>
                                    <CardDescription>
                                        Continue to other resident tools.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full rounded-full"
                                    >
                                        <Link href={resident.qrCode()}>
                                            Open My QR Code
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full rounded-full"
                                    >
                                        <Link href={resident.profile()}>
                                            Open My Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ResidentHousehold.layout = {
    breadcrumbs: [
        {
            title: 'My Household',
            href: resident.household(),
        },
    ],
};
