import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, MapPinHouse, Phone, Save, Shield, Sparkles, UserRound } from 'lucide-react';
import { FormEvent } from 'react';
import { updateProfile } from '@/actions/App/Http/Controllers/ResidentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { residentDate, residentLabel } from '@/lib/resident';
import resident from '@/routes/resident';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editSecurity } from '@/routes/security';

type ResidentProfileProps = {
    availableBarangays: string[];
    profile: {
        address?: string | null;
        barangay?: string | null;
        birthdate?: string | null;
        city?: string | null;
        contactNumber?: string | null;
        email: string;
        gender?: string | null;
        isPregnant: boolean;
        isPwd: boolean;
        name: string;
        pwdType?: string | null;
        pwdTypeOther?: string | null;
    };
    pwdTypes: string[];
};

export default function ResidentProfile({
    availableBarangays,
    profile,
    pwdTypes,
}: ResidentProfileProps) {
    const form = useForm({
        barangay: profile.barangay ?? '',
        birthdate: profile.birthdate ?? '',
        contact_number: profile.contactNumber ?? '',
        email: profile.email,
        gender: profile.gender ?? '',
        is_pregnant: profile.isPregnant,
        is_pwd: profile.isPwd,
        name: profile.name,
        pwd_type: profile.pwdType ?? '',
        pwd_type_other: profile.pwdTypeOther ?? '',
        street_address: profile.address ?? '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(updateProfile.url(), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="My Profile" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#ecfeff_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#082f49_100%)] md:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Personal Information
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                My Profile
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review and update your account details, address,
                                and personal conditions so your household record
                                stays accurate for alerts and evacuation
                                planning.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Registered Email
                                </p>
                                <p className="mt-2 text-base font-semibold text-foreground">
                                    {profile.email}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Used for account access and verification
                                </p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Current Address
                                </p>
                                <p className="mt-2 text-base font-semibold text-foreground">
                                    {profile.address ?? 'Not provided'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {profile.barangay ?? 'No barangay selected'}
                                    {profile.city ? `, ${profile.city}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <UserRound className="size-5 text-sky-600" />
                                    Personal Details
                                </CardTitle>
                                <CardDescription>
                                    Keep your primary resident information up to
                                    date.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData('name', event.currentTarget.value)
                                        }
                                        placeholder="Full name"
                                    />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData('email', event.currentTarget.value)
                                        }
                                        placeholder="Email address"
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_number">
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contact_number"
                                        value={form.data.contact_number}
                                        onChange={(event) =>
                                            form.setData(
                                                'contact_number',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="09171234567"
                                    />
                                    <InputError
                                        message={form.errors.contact_number}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="birthdate">Birthdate</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={form.data.birthdate}
                                        onChange={(event) =>
                                            form.setData('birthdate', event.currentTarget.value)
                                        }
                                    />
                                    <InputError
                                        message={form.errors.birthdate}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Sex</Label>
                                    <select
                                        id="gender"
                                        value={form.data.gender}
                                        onChange={(event) => {
                                            const gender = event.currentTarget.value;

                                            form.setData((current) => ({
                                                ...current,
                                                gender,
                                                is_pregnant:
                                                    gender === 'female'
                                                        ? current.is_pregnant
                                                        : false,
                                            }));
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="">Select sex</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    <InputError message={form.errors.gender} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <MapPinHouse className="size-5 text-rose-600" />
                                    Address Information
                                </CardTitle>
                                <CardDescription>
                                    This address is used to match alerts and
                                    evacuation center guidance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="street_address">Address</Label>
                                    <Input
                                        id="street_address"
                                        value={form.data.street_address}
                                        onChange={(event) =>
                                            form.setData(
                                                'street_address',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Purok / Street / Sitio"
                                    />
                                    <InputError
                                        message={form.errors.street_address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="barangay">Barangay</Label>
                                    <select
                                        id="barangay"
                                        value={form.data.barangay}
                                        onChange={(event) =>
                                            form.setData('barangay', event.currentTarget.value)
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                    >
                                        <option value="">Select barangay</option>
                                        {availableBarangays.map((barangay) => (
                                            <option key={barangay} value={barangay}>
                                                {barangay}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.barangay}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        readOnly
                                        value={profile.city ?? 'Mati City'}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Sparkles className="size-5 text-amber-600" />
                                    Special Conditions
                                </CardTitle>
                                <CardDescription>
                                    These details help responders prepare the
                                    right support during evacuation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="flex items-start gap-3 rounded-[20px] border border-border/70 p-4">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_pwd}
                                            onChange={(event) =>
                                                form.setData((current) => ({
                                                    ...current,
                                                    is_pwd: event.currentTarget.checked,
                                                    pwd_type: event.currentTarget.checked
                                                        ? current.pwd_type
                                                        : '',
                                                    pwd_type_other:
                                                        event.currentTarget.checked
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
                                                Mark this if the resident needs
                                                disability-related support.
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 rounded-[20px] border border-border/70 p-4">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_pregnant}
                                            disabled={form.data.gender !== 'female'}
                                            onChange={(event) =>
                                                form.setData(
                                                    'is_pregnant',
                                                    event.currentTarget.checked,
                                                )
                                            }
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                Pregnant
                                            </p>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                Available only for a female
                                                resident profile.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {form.data.is_pwd ? (
                                    <div className="grid gap-5 md:grid-cols-2">
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
                                                            event.currentTarget.value,
                                                        pwd_type_other:
                                                            event.currentTarget.value ===
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
                                                    <option key={pwdType} value={pwdType}>
                                                        {residentLabel(pwdType)}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={form.errors.pwd_type}
                                            />
                                        </div>

                                        {form.data.pwd_type === 'other' ? (
                                            <div className="grid gap-2">
                                                <Label htmlFor="pwd_type_other">
                                                    Specify PWD Type
                                                </Label>
                                                <Input
                                                    id="pwd_type_other"
                                                    value={form.data.pwd_type_other}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'pwd_type_other',
                                                            event.currentTarget.value,
                                                        )
                                                    }
                                                    placeholder="Describe the PWD type"
                                                />
                                                <InputError
                                                    message={
                                                        form.errors.pwd_type_other
                                                    }
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                <InputError
                                    message={form.errors.is_pregnant}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-full px-6"
                            >
                                <Save className="size-4" />
                                Save Changes
                            </Button>
                            {form.recentlySuccessful ? (
                                <p className="text-sm text-muted-foreground">
                                    Profile updated successfully.
                                </p>
                            ) : null}
                        </div>
                    </form>

                    <div className="space-y-4">
                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Mail className="size-5 text-sky-600" />
                                    Current Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Birthdate
                                    </p>
                                    <p className="mt-1 font-medium text-foreground">
                                        {residentDate(profile.birthdate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Sex
                                    </p>
                                    <p className="mt-1 font-medium text-foreground">
                                        {residentLabel(profile.gender)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Contact
                                    </p>
                                    <p className="mt-1 font-medium text-foreground">
                                        {profile.contactNumber ?? 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Status Flags
                                    </p>
                                    <p className="mt-1 font-medium text-foreground">
                                        {[
                                            profile.isPwd ? 'PWD' : null,
                                            profile.isPregnant ? 'Pregnant' : null,
                                        ]
                                            .filter(Boolean)
                                            .join(', ') || 'None'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Shield className="size-5 text-emerald-600" />
                                    Account Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage password protection and appearance
                                    preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full rounded-full"
                                >
                                    <Link href={editSecurity()}>
                                        Open Security Settings
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full rounded-full"
                                >
                                    <Link href={editAppearance()}>
                                        Open Appearance Settings
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Phone className="size-5 text-rose-600" />
                                    Household Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Need to update family members, household QR,
                                    or evacuation center guidance?
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-4 w-full rounded-full"
                                >
                                    <Link href={resident.household()}>
                                        Open My Household
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ResidentProfile.layout = {
    breadcrumbs: [
        {
            title: 'My Profile',
            href: resident.profile(),
        },
    ],
};
