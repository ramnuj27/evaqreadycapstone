import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CircleCheckBig,
    House,
    Mail,
    MapPinHouse,
    Phone,
    Plus,
    QrCode,
    ShieldAlert,
    Trash2,
    UserRound,
    UsersRound,
    Waves,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { store } from '@/routes/register';

type Gender = 'male' | 'female' | '';
type HazardZone = 'flood-prone' | 'coastal' | 'landslide' | 'safe-zone' | '';
type MemberCategory = 'Child' | 'Adult' | 'Senior' | '';
type PwdType =
    | 'visual-impairment'
    | 'hearing-impairment'
    | 'speech-impairment'
    | 'physical-disability'
    | 'intellectual-disability'
    | 'psychosocial-disability'
    | 'multiple-disabilities'
    | 'other'
    | '';
type RegistrationStep = 1 | 2 | 3;

type HouseholdMemberForm = {
    id: string;
    full_name: string;
    gender: Gender;
    birthdate: string;
    category: MemberCategory;
    is_pwd: boolean;
    pwd_type: PwdType;
    pwd_type_other: string;
    is_pregnant: boolean;
};

type RegistrationFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    gender: Gender;
    birthdate: string;
    is_pregnant: boolean;
    is_pwd: boolean;
    pwd_type: PwdType;
    pwd_type_other: string;
    street_address: string;
    barangay: string;
    city: string;
    hazard_zone: HazardZone;
    household_name: string;
    members: HouseholdMemberForm[];
};

type Props = {
    availableBarangays: string[];
    availableCity: string;
};

const steps = [
    ['Head Details', 'Primary resident and contact details'],
    ['Household Setup', 'Family name and member cards'],
    ['Review', 'Confirm the household registration'],
    ['QR Issued', 'Shared code for the whole household'],
] as const;

const hazardZones: Array<{ value: Exclude<HazardZone, ''>; label: string }> = [
    { value: 'flood-prone', label: 'Flood-prone' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'safe-zone', label: 'Safe Zone' },
];

const memberCategories: Array<{
    value: Exclude<MemberCategory, ''>;
    label: string;
}> = [
    { value: 'Child', label: 'Child' },
    { value: 'Adult', label: 'Adult' },
    { value: 'Senior', label: 'Senior' },
];

const pwdTypes: Array<{ value: Exclude<PwdType, ''>; label: string }> = [
    { value: 'visual-impairment', label: 'Visual Impairment' },
    { value: 'hearing-impairment', label: 'Hearing Impairment' },
    { value: 'speech-impairment', label: 'Speech Impairment' },
    { value: 'physical-disability', label: 'Physical Disability' },
    { value: 'intellectual-disability', label: 'Intellectual Disability' },
    { value: 'psychosocial-disability', label: 'Psychosocial Disability' },
    { value: 'multiple-disabilities', label: 'Multiple Disabilities' },
    { value: 'other', label: 'Other' },
];

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

const panelClass =
    'rounded-[28px] border border-white/10 bg-slate-950/35 shadow-[0_20px_55px_rgba(2,10,24,0.3)]';

function makeMember(): HouseholdMemberForm {
    return {
        id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `member-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        full_name: '',
        gender: '',
        birthdate: '',
        category: '',
        is_pwd: false,
        pwd_type: '',
        pwd_type_other: '',
        is_pregnant: false,
    };
}

function ageFromBirthdate(birthdate: string): number | null {
    if (!birthdate) {
        return null;
    }

    const date = new Date(`${birthdate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDelta = today.getMonth() - date.getMonth();

    if (
        monthDelta < 0 ||
        (monthDelta === 0 && today.getDate() < date.getDate())
    ) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

function categoryFromAge(age: number | null): string {
    if (age === null) {
        return 'Pending';
    }

    if (age <= 17) {
        return 'Child';
    }

    if (age <= 59) {
        return 'Adult';
    }

    return 'Senior';
}

function categoryForBirthdate(birthdate: string): MemberCategory {
    const age = ageFromBirthdate(birthdate);

    if (age === null) {
        return '';
    }

    if (age <= 17) {
        return 'Child';
    }

    if (age <= 59) {
        return 'Adult';
    }

    return 'Senior';
}

function niceValue(value: string): string {
    return value
        ? value
              .split('-')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ')
        : 'Not provided';
}

function formatBirthdate(date: string): string {
    if (!date) {
        return 'Not provided';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
}

function StepButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition',
                active
                    ? 'border-orange-300/35 bg-orange-400/15 text-white'
                    : 'border-white/10 bg-slate-950/30 text-slate-300 hover:bg-white/6 hover:text-white',
            )}
        >
            {children}
        </button>
    );
}

export default function Register({ availableBarangays, availableCity }: Props) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<RegistrationStep>(1);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );
    const form = useForm<RegistrationFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        gender: '',
        birthdate: '',
        is_pregnant: false,
        is_pwd: false,
        pwd_type: '',
        pwd_type_other: '',
        street_address: '',
        barangay: '',
        city: availableCity,
        hazard_zone: '',
        household_name: '',
        members: [],
    });

    const maxDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const headAge = useMemo(
        () => ageFromBirthdate(form.data.birthdate),
        [form.data.birthdate],
    );
    const totalMembers = form.data.members.length + 1;
    const errors = form.errors as Record<string, string | undefined>;
    const landingLoginUrl = home({ query: { login: 1 } });

    useEffect(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [step]);

    const fieldError = (key: string) => clientErrors[key] ?? errors[key];
    const clearClientError = (key: string) => {
        setClientErrors((current) => {
            if (!current[key]) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    };

    const updateMember = <T extends keyof HouseholdMemberForm>(
        id: string,
        key: T,
        value: HouseholdMemberForm[T],
    ) => {
        form.setData(
            'members',
            form.data.members.map((member) => {
                if (member.id !== id) {
                    return member;
                }

                if (key === 'gender') {
                    return {
                        ...member,
                        gender: value as Gender,
                        is_pregnant:
                            value === 'female' ? member.is_pregnant : false,
                    };
                }

                if (key === 'birthdate') {
                    const birthdate = value as string;

                    return {
                        ...member,
                        birthdate,
                        category: categoryForBirthdate(birthdate),
                    };
                }

                if (key === 'is_pwd' && !value) {
                    return {
                        ...member,
                        is_pwd: false,
                        pwd_type: '',
                        pwd_type_other: '',
                    };
                }

                if (key === 'pwd_type' && value !== 'other') {
                    return {
                        ...member,
                        pwd_type: value as PwdType,
                        pwd_type_other: '',
                    };
                }

                return { ...member, [key]: value };
            }),
        );
    };

    const validate = (targetStep: RegistrationStep): Record<string, string> => {
        const next: Record<string, string> = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (targetStep >= 1) {
            if (!form.data.name.trim()) {
                next.name = 'Head of household name is required.';
            }

            if (!form.data.email.trim()) {
                next.email = 'Email address is required.';
            } else if (!emailPattern.test(form.data.email)) {
                next.email = 'Enter a valid email address.';
            }

            if (!form.data.password) {
                next.password = 'Password is required.';
            }

            if (!form.data.password_confirmation) {
                next.password_confirmation = 'Please confirm the password.';
            } else if (form.data.password !== form.data.password_confirmation) {
                next.password_confirmation = 'Passwords do not match.';
            }

            if (!form.data.contact_number.trim()) {
                next.contact_number = 'Contact number is required.';
            }

            if (!form.data.gender) {
                next.gender = 'Select the head of household gender.';
            }

            if (form.data.gender !== 'female' && form.data.is_pregnant) {
                next.is_pregnant =
                    'Pregnant is only available for a female head of household.';
            }

            if (form.data.is_pwd && !form.data.pwd_type) {
                next.pwd_type = 'Select the PWD type.';
            }

            if (
                form.data.is_pwd &&
                form.data.pwd_type === 'other' &&
                !form.data.pwd_type_other.trim()
            ) {
                next.pwd_type_other = 'Specify the PWD type.';
            }

            if (!form.data.birthdate) {
                next.birthdate = 'Birthdate is required.';
            }

            if (!form.data.street_address.trim()) {
                next.street_address = 'Street address is required.';
            }

            if (!form.data.barangay.trim()) {
                next.barangay = 'Barangay is required.';
            }

            if (!form.data.city.trim()) {
                next.city = 'City or municipality is required.';
            }

            if (!form.data.hazard_zone) {
                next.hazard_zone = 'Select the household hazard zone.';
            }
        }

        if (targetStep >= 2) {
            if (!form.data.household_name.trim()) {
                next.household_name = 'Household or family name is required.';
            }

            form.data.members.forEach((member, index) => {
                if (!member.full_name.trim()) {
                    next[`members.${index}.full_name`] =
                        'Member name is required.';
                }

                if (!member.gender) {
                    next[`members.${index}.gender`] = 'Select a gender.';
                }

                if (!member.birthdate) {
                    next[`members.${index}.birthdate`] =
                        'Birthdate is required.';
                }

                if (!member.category) {
                    next[`members.${index}.category`] =
                        'Select the member category.';
                }

                if (member.gender !== 'female' && member.is_pregnant) {
                    next[`members.${index}.is_pregnant`] =
                        'Pregnant is only available for female members.';
                }

                if (member.is_pwd && !member.pwd_type) {
                    next[`members.${index}.pwd_type`] = 'Select the PWD type.';
                }

                if (
                    member.is_pwd &&
                    member.pwd_type === 'other' &&
                    !member.pwd_type_other.trim()
                ) {
                    next[`members.${index}.pwd_type_other`] =
                        'Specify the PWD type.';
                }
            });
        }

        return next;
    };

    const setStepFromErrors = (next: Record<string, string>) => {
        const keys = Object.keys(next);

        if (
            keys.some(
                (key) => !key.startsWith('members') && key !== 'household_name',
            )
        ) {
            setStep(1);

            return;
        }

        if (
            keys.some(
                (key) => key.startsWith('members') || key === 'household_name',
            )
        ) {
            setStep(2);
        }
    };

    const addMember = () => {
        const member = makeMember();
        form.setData('members', [...form.data.members, member]);
        window.setTimeout(() => {
            document
                .getElementById(`member-${member.id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    };

    const removeMember = (id: string) => {
        form.setData(
            'members',
            form.data.members.filter((member) => member.id !== id),
        );
    };

    const nextStep = () => {
        const next = validate(step);

        if (Object.keys(next).length > 0) {
            setClientErrors(next);

            return;
        }

        setClientErrors({});
        setStep((current) =>
            current === 3 ? current : ((current + 1) as RegistrationStep),
        );
    };

    const submit = () => {
        const next = validate(2);

        if (Object.keys(next).length > 0) {
            setClientErrors(next);
            setStepFromErrors(next);

            return;
        }

        setClientErrors({});
        form.post(store.url(), {
            preserveScroll: true,
            onError: (serverErrors) =>
                setStepFromErrors(serverErrors as Record<string, string>),
        });
    };

    return (
        <>
            <Head title="Household Registration">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|outfit:500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[#03111f] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_24%),linear-gradient(180deg,#020b14_0%,#041728_42%,#03111f_100%)]" />
                <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-slate-950">
                                EQ
                            </span>
                            EvaQReady
                        </Link>

                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-full border border-white/12 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]"
                        >
                            <Link href={landingLoginUrl}>Proceed to Login</Link>
                        </Button>
                    </div>

                    <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
                        <aside className="space-y-6 lg:sticky lg:top-8">
                            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_80px_rgba(2,10,24,0.45)] backdrop-blur-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-400/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-orange-200 uppercase">
                                    <QrCode className="size-3.5" /> Household
                                    Registration
                                </div>
                                <h1
                                    className="mt-5 text-4xl font-semibold tracking-tight text-white"
                                    style={displayFont}
                                >
                                    Register one household, issue one secure
                                    family QR.
                                </h1>
                                <p className="mt-4 text-sm leading-7 text-slate-300">
                                    EvaQReady keeps one verified head of
                                    household account and one QR code for the
                                    whole family, so responders can identify the
                                    right residents without mixing households.
                                </p>
                                <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/8">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-orange-400 transition-[width] duration-500"
                                        style={{
                                            width: `${((step - 1) / 3) * 100}%`,
                                        }}
                                    />
                                </div>
                                <div className="mt-5 grid gap-3">
                                    {steps.map(
                                        ([title, description], index) => {
                                            const number = index + 1;
                                            const active = number === step;
                                            const completed = number < step;

                                            return (
                                                <div
                                                    key={title}
                                                    className={cn(
                                                        'rounded-2xl border px-4 py-3',
                                                        active
                                                            ? 'border-orange-300/30 bg-orange-400/10'
                                                            : completed
                                                              ? 'border-emerald-300/20 bg-emerald-400/10'
                                                              : 'border-white/8 bg-white/[0.03]',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={cn(
                                                                'flex size-9 items-center justify-center rounded-full border text-sm font-semibold',
                                                                active
                                                                    ? 'border-orange-300/35 bg-orange-400/15 text-white'
                                                                    : completed
                                                                      ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100'
                                                                      : 'border-white/10 bg-slate-950/40 text-slate-300',
                                                            )}
                                                        >
                                                            {completed ? (
                                                                <CircleCheckBig className="size-4" />
                                                            ) : (
                                                                number
                                                            )}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {title}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                                                {description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 text-orange-300">
                                        <UsersRound className="size-5" />
                                        <p className="text-sm font-semibold text-white">
                                            Household Count
                                        </p>
                                    </div>
                                    <p className="mt-4 text-3xl font-semibold text-white">
                                        {totalMembers}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Head of household plus all added
                                        members.
                                    </p>
                                </div>
                                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 text-sky-300">
                                        <ShieldAlert className="size-5" />
                                        <p className="text-sm font-semibold text-white">
                                            Hazard Snapshot
                                        </p>
                                    </div>
                                    <p className="mt-4 text-base font-medium text-white">
                                        {form.data.hazard_zone
                                            ? niceValue(form.data.hazard_zone)
                                            : 'Waiting for hazard zone'}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        The family QR belongs only to this
                                        household profile.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <div
                            ref={cardRef}
                            className="rounded-[34px] border border-white/10 bg-[#071b2d]/80 shadow-[0_35px_100px_rgba(2,10,24,0.5)] backdrop-blur-2xl"
                        >
                            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                                <p className="text-xs font-semibold tracking-[0.24em] text-orange-300 uppercase">
                                    EvaQReady Registration Wizard
                                </p>
                                <h2
                                    className="mt-3 text-3xl font-semibold text-white"
                                    style={displayFont}
                                >
                                    {step === 1 &&
                                        'Head of household information'}
                                    {step === 2 &&
                                        'Household members and family setup'}
                                    {step === 3 &&
                                        'Review and confirm household registration'}
                                </h2>
                            </div>

                            <div className="p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 sm:p-8">
                                {step === 1 && (
                                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <UserRound className="size-4 text-orange-300" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    value={form.data.name}
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'name',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'name',
                                                        );
                                                    }}
                                                    placeholder="Juan Dela Cruz"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError('name')}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <Mail className="size-4 text-orange-300" />
                                                    Email Address
                                                </Label>
                                                <Input
                                                    type="email"
                                                    value={form.data.email}
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'email',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'email',
                                                        );
                                                    }}
                                                    placeholder="juan@example.com"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'email',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <Phone className="size-4 text-orange-300" />
                                                    Contact Number
                                                </Label>
                                                <Input
                                                    value={
                                                        form.data.contact_number
                                                    }
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'contact_number',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'contact_number',
                                                        );
                                                    }}
                                                    placeholder="09XXXXXXXXX"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'contact_number',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <ShieldAlert className="size-4 text-orange-300" />
                                                    Password
                                                </Label>
                                                <PasswordInput
                                                    value={form.data.password}
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'password',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'password',
                                                        );
                                                    }}
                                                    placeholder="Create a secure password"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'password',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <ShieldAlert className="size-4 text-orange-300" />
                                                    Confirm Password
                                                </Label>
                                                <PasswordInput
                                                    value={
                                                        form.data
                                                            .password_confirmation
                                                    }
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'password_confirmation',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'password_confirmation',
                                                        );
                                                    }}
                                                    placeholder="Repeat the password"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'password_confirmation',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <CalendarDays className="size-4 text-orange-300" />
                                                    Birthdate
                                                </Label>
                                                <Input
                                                    type="date"
                                                    max={maxDate}
                                                    value={form.data.birthdate}
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'birthdate',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'birthdate',
                                                        );
                                                    }}
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'birthdate',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <UsersRound className="size-4 text-orange-300" />
                                                    Age
                                                </Label>
                                                <Input
                                                    value={
                                                        headAge === null
                                                            ? ''
                                                            : String(headAge)
                                                    }
                                                    readOnly
                                                    placeholder="Auto-calculated"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <UserRound className="size-4 text-orange-300" />
                                                    Gender
                                                </Label>
                                                <div className="flex gap-3">
                                                    <StepButton
                                                        active={
                                                            form.data.gender ===
                                                            'male'
                                                        }
                                                        onClick={() => {
                                                            form.setData(
                                                                'gender',
                                                                'male',
                                                            );
                                                            form.setData(
                                                                'is_pregnant',
                                                                false,
                                                            );
                                                            clearClientError(
                                                                'gender',
                                                            );
                                                            clearClientError(
                                                                'is_pregnant',
                                                            );
                                                        }}
                                                    >
                                                        Male
                                                    </StepButton>
                                                    <StepButton
                                                        active={
                                                            form.data.gender ===
                                                            'female'
                                                        }
                                                        onClick={() => {
                                                            form.setData(
                                                                'gender',
                                                                'female',
                                                            );
                                                            clearClientError(
                                                                'gender',
                                                            );
                                                        }}
                                                    >
                                                        Female
                                                    </StepButton>
                                                </div>
                                                <InputError
                                                    message={fieldError(
                                                        'gender',
                                                    )}
                                                />
                                            </div>
                                            {form.data.gender === 'female' && (
                                                <div className="space-y-2 sm:col-span-2">
                                                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                        <ShieldAlert className="size-4 text-orange-300" />
                                                        Pregnancy Status
                                                    </Label>
                                                    <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-white">
                                                                Pregnant
                                                            </p>
                                                            <p className="text-xs leading-5 text-slate-400">
                                                                Mark this only
                                                                when the head of
                                                                household is
                                                                currently
                                                                pregnant.
                                                            </p>
                                                        </div>
                                                        <Toggle
                                                            pressed={
                                                                form.data
                                                                    .is_pregnant
                                                            }
                                                            onPressedChange={(
                                                                pressed,
                                                            ) => {
                                                                form.setData(
                                                                    'is_pregnant',
                                                                    pressed,
                                                                );
                                                                clearClientError(
                                                                    'is_pregnant',
                                                                );
                                                            }}
                                                            variant="outline"
                                                            className="rounded-full border-white/12 bg-white/[0.05] px-4 text-white data-[state=on]:border-orange-300/35 data-[state=on]:bg-orange-400/15"
                                                        >
                                                            {form.data
                                                                .is_pregnant
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </Toggle>
                                                    </div>
                                                    <InputError
                                                        message={fieldError(
                                                            'is_pregnant',
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <ShieldAlert className="size-4 text-orange-300" />
                                                    PWD Status
                                                </Label>
                                                <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">
                                                            Person with disability
                                                        </p>
                                                        <p className="text-xs leading-5 text-slate-400">
                                                            Mark this when the head of household needs accessibility or mobility support.
                                                        </p>
                                                    </div>
                                                    <Toggle
                                                        pressed={form.data.is_pwd}
                                                        onPressedChange={(
                                                            pressed,
                                                        ) => {
                                                            form.setData(
                                                                (current) => ({
                                                                    ...current,
                                                                    is_pwd:
                                                                        pressed,
                                                                    pwd_type:
                                                                        pressed
                                                                            ? current.pwd_type
                                                                            : '',
                                                                    pwd_type_other:
                                                                        pressed
                                                                            ? current.pwd_type_other
                                                                            : '',
                                                                }),
                                                            );
                                                            clearClientError(
                                                                'pwd_type',
                                                            );
                                                            clearClientError(
                                                                'pwd_type_other',
                                                            );
                                                        }}
                                                        variant="outline"
                                                        className="rounded-full border-white/12 bg-white/[0.05] px-4 text-white data-[state=on]:border-orange-300/35 data-[state=on]:bg-orange-400/15"
                                                    >
                                                        {form.data.is_pwd
                                                            ? 'Yes'
                                                            : 'No'}
                                                    </Toggle>
                                                </div>
                                            </div>
                                            {form.data.is_pwd && (
                                                <>
                                                    <div className="space-y-2 sm:col-span-2">
                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                            <ShieldAlert className="size-4 text-orange-300" />
                                                            PWD Type
                                                        </Label>
                                                        <Select
                                                            value={form.data.pwd_type}
                                                            onValueChange={(
                                                                value,
                                                            ) => {
                                                                form.setData(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        pwd_type:
                                                                            value as PwdType,
                                                                        pwd_type_other:
                                                                            value ===
                                                                            'other'
                                                                                ? current.pwd_type_other
                                                                                : '',
                                                                    }),
                                                                );
                                                                clearClientError(
                                                                    'pwd_type',
                                                                );
                                                                clearClientError(
                                                                    'pwd_type_other',
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-slate-950/35 text-white">
                                                                <SelectValue placeholder="Select the PWD type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="border-white/10 bg-[#0a2238] text-white">
                                                                {pwdTypes.map(
                                                                    (
                                                                        pwdType,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                pwdType.value
                                                                            }
                                                                            value={
                                                                                pwdType.value
                                                                            }
                                                                        >
                                                                            {
                                                                                pwdType.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError
                                                            message={fieldError(
                                                                'pwd_type',
                                                            )}
                                                        />
                                                    </div>
                                                    {form.data.pwd_type ===
                                                        'other' && (
                                                        <div className="space-y-2 sm:col-span-2">
                                                            <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                <ShieldAlert className="size-4 text-orange-300" />
                                                                Other PWD Type
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    form.data
                                                                        .pwd_type_other
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    form.setData(
                                                                        'pwd_type_other',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    );
                                                                    clearClientError(
                                                                        'pwd_type_other',
                                                                    );
                                                                }}
                                                                placeholder="Describe the PWD type"
                                                                className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                            />
                                                            <InputError
                                                                message={fieldError(
                                                                    'pwd_type_other',
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <MapPinHouse className="size-4 text-orange-300" />
                                                    Street Address
                                                </Label>
                                                <Input
                                                    value={
                                                        form.data.street_address
                                                    }
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'street_address',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'street_address',
                                                        );
                                                    }}
                                                    placeholder="Purok / street / house number"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'street_address',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <House className="size-4 text-orange-300" />
                                                    Barangay
                                                </Label>
                                                <Select
                                                    value={form.data.barangay}
                                                    onValueChange={(value) => {
                                                        form.setData(
                                                            'barangay',
                                                            value,
                                                        );
                                                        clearClientError(
                                                            'barangay',
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-slate-950/35 text-white">
                                                        <SelectValue placeholder="Select barangay in Mati City" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-white/10 bg-[#0a2238] text-white">
                                                        {availableBarangays.map(
                                                            (barangay) => (
                                                                <SelectItem
                                                                    key={
                                                                        barangay
                                                                    }
                                                                    value={
                                                                        barangay
                                                                    }
                                                                >
                                                                    {barangay}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={fieldError(
                                                        'barangay',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <MapPinHouse className="size-4 text-orange-300" />
                                                    City / Municipality
                                                </Label>
                                                <Input
                                                    value={form.data.city}
                                                    readOnly
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/50 text-white"
                                                />
                                                <p className="text-xs text-slate-400">
                                                    Municipality is fixed to
                                                    Mati City for this
                                                    deployment.
                                                </p>
                                                <InputError
                                                    message={fieldError('city')}
                                                />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <Waves className="size-4 text-orange-300" />
                                                    Hazard Zone
                                                </Label>
                                                <Select
                                                    value={
                                                        form.data.hazard_zone
                                                    }
                                                    onValueChange={(value) => {
                                                        form.setData(
                                                            'hazard_zone',
                                                            value as HazardZone,
                                                        );
                                                        clearClientError(
                                                            'hazard_zone',
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-slate-950/35 text-white">
                                                        <SelectValue placeholder="Select hazard zone" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-white/10 bg-[#0a2238] text-white">
                                                        {hazardZones.map(
                                                            (zone) => (
                                                                <SelectItem
                                                                    key={
                                                                        zone.value
                                                                    }
                                                                    value={
                                                                        zone.value
                                                                    }
                                                                >
                                                                    {zone.label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={fieldError(
                                                        'hazard_zone',
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                panelClass,
                                                'p-5 text-white',
                                            )}
                                        >
                                            <p
                                                className="text-xl font-semibold"
                                                style={displayFont}
                                            >
                                                Auto profile summary
                                            </p>
                                            <div className="mt-4 space-y-4">
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                        Computed Age
                                                    </p>
                                                    <p className="mt-3 text-3xl font-semibold text-white">
                                                        {headAge ?? '--'}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                        Hazard Snapshot
                                                    </p>
                                                    <p className="mt-3 text-lg font-medium text-white">
                                                        {form.data.hazard_zone
                                                            ? niceValue(
                                                                  form.data
                                                                      .hazard_zone,
                                                              )
                                                            : 'Pending selection'}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-orange-300/20 bg-orange-400/8 p-4 text-sm leading-7 text-slate-200">
                                                    The family QR will be tied
                                                    to this household profile
                                                    only, so other families
                                                    cannot use it during
                                                    check-in or evacuation
                                                    validation.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <House className="size-4 text-orange-300" />
                                                    Household Name or Family
                                                    Name
                                                </Label>
                                                <Input
                                                    value={
                                                        form.data.household_name
                                                    }
                                                    onChange={(event) => {
                                                        form.setData(
                                                            'household_name',
                                                            event.target.value,
                                                        );
                                                        clearClientError(
                                                            'household_name',
                                                        );
                                                    }}
                                                    placeholder="Dela Cruz Household"
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                />
                                                <InputError
                                                    message={fieldError(
                                                        'household_name',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                    <UsersRound className="size-4 text-orange-300" />
                                                    Total Members
                                                </Label>
                                                <Input
                                                    value={String(totalMembers)}
                                                    readOnly
                                                    className="h-12 rounded-2xl border-white/10 bg-slate-950/50 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p
                                                    className="text-lg font-semibold text-white"
                                                    style={displayFont}
                                                >
                                                    Add household members
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                                    Add every resident who will
                                                    use the same family QR at
                                                    the evacuation center.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={addMember}
                                                className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Plus className="size-4" />
                                                Add Member
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {form.data.members.length === 0 && (
                                                <div className="rounded-[28px] border border-dashed border-white/15 bg-slate-950/25 p-8 text-center text-sm leading-7 text-slate-400">
                                                    No family members added yet.
                                                    You can still continue if
                                                    this registration is for a
                                                    single-person household.
                                                </div>
                                            )}

                                            {form.data.members.map(
                                                (member, index) => {
                                                    const age =
                                                        ageFromBirthdate(
                                                            member.birthdate,
                                                        );
                                                    const category =
                                                        member.category ||
                                                        categoryForBirthdate(
                                                            member.birthdate,
                                                        );

                                                    return (
                                                        <div
                                                            key={member.id}
                                                            id={`member-${member.id}`}
                                                            className="rounded-[30px] border border-white/10 bg-slate-950/35 p-5 shadow-[0_18px_40px_rgba(2,10,24,0.25)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
                                                        >
                                                            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <p className="text-xs font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                                                        Member{' '}
                                                                        {index +
                                                                            1}
                                                                    </p>
                                                                    <h3
                                                                        className="mt-2 text-xl font-semibold text-white"
                                                                        style={
                                                                            displayFont
                                                                        }
                                                                    >
                                                                        {member.full_name ||
                                                                            'New household member'}
                                                                    </h3>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        removeMember(
                                                                            member.id,
                                                                        )
                                                                    }
                                                                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 text-slate-200 hover:bg-red-500/15 hover:text-white"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    Remove
                                                                </Button>
                                                            </div>

                                                            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
                                                                <div className="grid gap-5 sm:grid-cols-2">
                                                                    <div className="space-y-2 sm:col-span-2">
                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                            <UserRound className="size-4 text-orange-300" />
                                                                            Full
                                                                            Name
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                member.full_name
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) => {
                                                                                updateMember(
                                                                                    member.id,
                                                                                    'full_name',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                );
                                                                                clearClientError(
                                                                                    `members.${index}.full_name`,
                                                                                );
                                                                            }}
                                                                            placeholder="Family member name"
                                                                            className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                                        />
                                                                        <InputError
                                                                            message={fieldError(
                                                                                `members.${index}.full_name`,
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                            <CalendarDays className="size-4 text-orange-300" />
                                                                            Birthdate
                                                                        </Label>
                                                                        <Input
                                                                            type="date"
                                                                            max={
                                                                                maxDate
                                                                            }
                                                                            value={
                                                                                member.birthdate
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) => {
                                                                                updateMember(
                                                                                    member.id,
                                                                                    'birthdate',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                );
                                                                                clearClientError(
                                                                                    `members.${index}.birthdate`,
                                                                                );
                                                                                clearClientError(
                                                                                    `members.${index}.category`,
                                                                                );
                                                                            }}
                                                                            className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white"
                                                                        />
                                                                        <InputError
                                                                            message={fieldError(
                                                                                `members.${index}.birthdate`,
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                            <UsersRound className="size-4 text-orange-300" />
                                                                            Age
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                age ===
                                                                                null
                                                                                    ? ''
                                                                                    : String(
                                                                                          age,
                                                                                      )
                                                                            }
                                                                            readOnly
                                                                            placeholder="Auto-calculated"
                                                                            className="h-12 rounded-2xl border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2 sm:col-span-2">
                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                            <UserRound className="size-4 text-orange-300" />
                                                                            Gender
                                                                        </Label>
                                                                        <div className="flex gap-3">
                                                                            <StepButton
                                                                                active={
                                                                                    member.gender ===
                                                                                    'male'
                                                                                }
                                                                                onClick={() => {
                                                                                    updateMember(
                                                                                        member.id,
                                                                                        'gender',
                                                                                        'male',
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.gender`,
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.is_pregnant`,
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.pwd_type`,
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.pwd_type_other`,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Male
                                                                            </StepButton>
                                                                            <StepButton
                                                                                active={
                                                                                    member.gender ===
                                                                                    'female'
                                                                                }
                                                                                onClick={() => {
                                                                                    updateMember(
                                                                                        member.id,
                                                                                        'gender',
                                                                                        'female',
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.gender`,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Female
                                                                            </StepButton>
                                                                        </div>
                                                                        <InputError
                                                                            message={fieldError(
                                                                                `members.${index}.gender`,
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                            <UsersRound className="size-4 text-orange-300" />
                                                                            Category
                                                                        </Label>
                                                                        <Select
                                                                            value={
                                                                                member.category
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) => {
                                                                                updateMember(
                                                                                    member.id,
                                                                                    'category',
                                                                                    value as MemberCategory,
                                                                                );
                                                                                clearClientError(
                                                                                    `members.${index}.category`,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-slate-950/35 text-white">
                                                                                <SelectValue placeholder="Select category" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="border-white/10 bg-[#0a2238] text-white">
                                                                                {memberCategories.map(
                                                                                    (
                                                                                        option,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                option.value
                                                                                            }
                                                                                            value={
                                                                                                option.value
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                option.label
                                                                                            }
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <p className="text-xs text-slate-400">
                                                                            {category
                                                                                ? `Auto-suggested from age as ${category}. You can adjust it if needed.`
                                                                                : 'Select a birthdate to auto-suggest the category.'}
                                                                        </p>
                                                                        <InputError
                                                                            message={fieldError(
                                                                                `members.${index}.category`,
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
                                                                    <p
                                                                        className="text-sm font-semibold text-white"
                                                                        style={
                                                                            displayFont
                                                                        }
                                                                    >
                                                                        Support
                                                                        and
                                                                        vulnerability
                                                                        details
                                                                    </p>
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                                                                            <div>
                                                                                <p className="text-sm font-medium text-white">
                                                                                    PWD
                                                                                    Status
                                                                                </p>
                                                                                <p className="text-xs text-slate-400">
                                                                                    Mark
                                                                                    this
                                                                                    if
                                                                                    the
                                                                                    resident
                                                                                    needs
                                                                                    additional
                                                                                    evacuation
                                                                                    support.
                                                                                </p>
                                                                            </div>
                                                                            <Toggle
                                                                                pressed={
                                                                                    member.is_pwd
                                                                                }
                                                                                onPressedChange={(
                                                                                    pressed,
                                                                                ) => {
                                                                                    updateMember(
                                                                                        member.id,
                                                                                        'is_pwd',
                                                                                        pressed,
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.pwd_type`,
                                                                                    );
                                                                                    clearClientError(
                                                                                        `members.${index}.pwd_type_other`,
                                                                                    );
                                                                                }}
                                                                                variant="outline"
                                                                                className="rounded-full border-white/12 bg-white/[0.05] px-4 text-white data-[state=on]:border-orange-300/35 data-[state=on]:bg-orange-400/15"
                                                                            >
                                                                                {member.is_pwd
                                                                                    ? 'Yes'
                                                                                    : 'No'}
                                                                            </Toggle>
                                                                        </div>
                                                                        {member.is_pwd && (
                                                                            <>
                                                                                <div className="space-y-2">
                                                                                    <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                                        <ShieldAlert className="size-4 text-orange-300" />
                                                                                        PWD
                                                                                        Type
                                                                                    </Label>
                                                                                    <Select
                                                                                        value={
                                                                                            member.pwd_type
                                                                                        }
                                                                                        onValueChange={(
                                                                                            value,
                                                                                        ) => {
                                                                                            updateMember(
                                                                                                member.id,
                                                                                                'pwd_type',
                                                                                                value as PwdType,
                                                                                            );
                                                                                            clearClientError(
                                                                                                `members.${index}.pwd_type`,
                                                                                            );
                                                                                            clearClientError(
                                                                                                `members.${index}.pwd_type_other`,
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-slate-950/35 text-white">
                                                                                            <SelectValue placeholder="Select PWD type" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="border-white/10 bg-[#0a2238] text-white">
                                                                                            {pwdTypes.map(
                                                                                                (
                                                                                                    option,
                                                                                                ) => (
                                                                                                    <SelectItem
                                                                                                        key={
                                                                                                            option.value
                                                                                                        }
                                                                                                        value={
                                                                                                            option.value
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            option.label
                                                                                                        }
                                                                                                    </SelectItem>
                                                                                                ),
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                    <InputError
                                                                                        message={fieldError(
                                                                                            `members.${index}.pwd_type`,
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                                {member.pwd_type ===
                                                                                    'other' && (
                                                                                    <div className="space-y-2">
                                                                                        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                                                                                            <UserRound className="size-4 text-orange-300" />
                                                                                            Specify
                                                                                            PWD
                                                                                            Type
                                                                                        </Label>
                                                                                        <Input
                                                                                            value={
                                                                                                member.pwd_type_other
                                                                                            }
                                                                                            onChange={(
                                                                                                event,
                                                                                            ) => {
                                                                                                updateMember(
                                                                                                    member.id,
                                                                                                    'pwd_type_other',
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                );
                                                                                                clearClientError(
                                                                                                    `members.${index}.pwd_type_other`,
                                                                                                );
                                                                                            }}
                                                                                            placeholder="Enter the specific disability type"
                                                                                            className="h-12 rounded-2xl border-white/10 bg-slate-950/35 text-white placeholder:text-slate-500"
                                                                                        />
                                                                                        <InputError
                                                                                            message={fieldError(
                                                                                                `members.${index}.pwd_type_other`,
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {member.gender ===
                                                                            'female' && (
                                                                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-white">
                                                                                        Pregnant
                                                                                    </p>
                                                                                    <p className="text-xs text-slate-400">
                                                                                        Visible
                                                                                        only
                                                                                        for
                                                                                        female
                                                                                        household
                                                                                        members.
                                                                                    </p>
                                                                                </div>
                                                                                <Toggle
                                                                                    pressed={
                                                                                        member.is_pregnant
                                                                                    }
                                                                                    onPressedChange={(
                                                                                        pressed,
                                                                                    ) => {
                                                                                        updateMember(
                                                                                            member.id,
                                                                                            'is_pregnant',
                                                                                            pressed,
                                                                                        );
                                                                                        clearClientError(
                                                                                            `members.${index}.is_pregnant`,
                                                                                        );
                                                                                    }}
                                                                                    variant="outline"
                                                                                    className="rounded-full border-white/12 bg-white/[0.05] px-4 text-white data-[state=on]:border-orange-300/35 data-[state=on]:bg-orange-400/15"
                                                                                >
                                                                                    {member.is_pregnant
                                                                                        ? 'Yes'
                                                                                        : 'No'}
                                                                                </Toggle>
                                                                            </div>
                                                                        )}
                                                                        <InputError
                                                                            message={fieldError(
                                                                                `members.${index}.is_pregnant`,
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                                        <div className="space-y-6">
                                            <div
                                                className={cn(
                                                    panelClass,
                                                    'p-5 text-white',
                                                )}
                                            >
                                                <p
                                                    className="text-2xl font-semibold"
                                                    style={displayFont}
                                                >
                                                    Head of household
                                                </p>
                                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Full Name
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {form.data.name}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Email
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {form.data.email}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Contact
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {
                                                                form.data
                                                                    .contact_number
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Birthdate
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {formatBirthdate(
                                                                form.data
                                                                    .birthdate,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Gender / Age
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {niceValue(
                                                                form.data
                                                                    .gender,
                                                            )}{' '}
                                                            / {headAge ?? '--'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Special Status
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {[
                                                                form.data.is_pwd
                                                                    ? form.data.pwd_type ===
                                                                      'other'
                                                                        ? `PWD: ${form.data.pwd_type_other || 'Other'}`
                                                                        : `PWD: ${niceValue(form.data.pwd_type)}`
                                                                    : null,
                                                                form.data
                                                                    .is_pregnant
                                                                    ? 'Pregnant'
                                                                    : null,
                                                            ]
                                                                .filter(
                                                                    Boolean,
                                                                )
                                                                .join(', ') ||
                                                                'No special status marked'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={cn(
                                                    panelClass,
                                                    'p-5 text-white',
                                                )}
                                            >
                                                <p
                                                    className="text-2xl font-semibold"
                                                    style={displayFont}
                                                >
                                                    Household summary
                                                </p>
                                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Household Name
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {
                                                                form.data
                                                                    .household_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Total Members
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {totalMembers}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Address
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {
                                                                form.data
                                                                    .street_address
                                                            }
                                                            ,{' '}
                                                            {form.data.barangay}
                                                            , {form.data.city}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                                            Hazard Zone
                                                        </p>
                                                        <p className="mt-2 text-base font-medium text-white">
                                                            {niceValue(
                                                                form.data
                                                                    .hazard_zone,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={cn(
                                                    panelClass,
                                                    'p-5 text-white',
                                                )}
                                            >
                                                <p
                                                    className="text-2xl font-semibold"
                                                    style={displayFont}
                                                >
                                                    Registered family members
                                                </p>
                                                <div className="mt-5 space-y-4">
                                                    {form.data.members
                                                        .length === 0 ? (
                                                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm text-slate-400">
                                                            No additional
                                                            household members
                                                            were added. This
                                                            will register as a
                                                            single-person
                                                            household.
                                                        </div>
                                                    ) : (
                                                        form.data.members.map(
                                                            (member, index) => {
                                                                const age =
                                                                    ageFromBirthdate(
                                                                        member.birthdate,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            member.id
                                                                        }
                                                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                                                    >
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-xs font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                                                                    Member{' '}
                                                                                    {index +
                                                                                        1}
                                                                                </p>
                                                                                <p className="mt-2 text-lg font-medium text-white">
                                                                                    {
                                                                                        member.full_name
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-medium text-slate-300">
                                                                                {member.category ||
                                                                                    categoryFromAge(
                                                                                        age,
                                                                                    )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-4 grid gap-3 sm:grid-cols-4">
                                                                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                                                                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                                                    Gender
                                                                                </p>
                                                                                <p className="mt-2 text-sm font-medium text-white">
                                                                                    {niceValue(
                                                                                        member.gender,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                                                                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                                                    Birthdate
                                                                                </p>
                                                                                <p className="mt-2 text-sm font-medium text-white">
                                                                                    {formatBirthdate(
                                                                                        member.birthdate,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                                                                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                                                    Age
                                                                                </p>
                                                                                <p className="mt-2 text-sm font-medium text-white">
                                                                                    {age ??
                                                                                        '--'}
                                                                                </p>
                                                                            </div>
                                                                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                                                                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                                                    Support
                                                                                    Details
                                                                                </p>
                                                                                <p className="mt-2 text-sm font-medium text-white">
                                                                                    {[
                                                                                        member.is_pwd
                                                                                            ? member.pwd_type ===
                                                                                              'other'
                                                                                                ? `PWD: ${member.pwd_type_other || 'Other'}`
                                                                                                : `PWD: ${niceValue(member.pwd_type)}`
                                                                                            : null,
                                                                                        member.is_pregnant
                                                                                            ? 'Pregnant'
                                                                                            : null,
                                                                                    ]
                                                                                        .filter(
                                                                                            Boolean,
                                                                                        )
                                                                                        .join(
                                                                                            ', ',
                                                                                        ) ||
                                                                                        'None'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="rounded-[28px] border border-orange-300/15 bg-orange-400/8 p-5 text-white">
                                                <p
                                                    className="text-xl font-semibold"
                                                    style={displayFont}
                                                >
                                                    Submission reminder
                                                </p>
                                                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200">
                                                    <p>
                                                        Submitting this form
                                                        will create one
                                                        head-of-household login
                                                        and one shared QR code
                                                        for the whole family.
                                                    </p>
                                                    <p>
                                                        Other households cannot
                                                        use this QR because
                                                        EvaQReady binds it to
                                                        the generated household
                                                        code for this family
                                                        only.
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    panelClass,
                                                    'p-5 text-white',
                                                )}
                                            >
                                                <p
                                                    className="text-xl font-semibold"
                                                    style={displayFont}
                                                >
                                                    Household QR Preview
                                                </p>
                                                <div className="mt-5 rounded-[28px] border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8 text-center">
                                                    <div className="mx-auto flex size-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] text-orange-300">
                                                        <QrCode className="size-10" />
                                                    </div>
                                                    <p className="mt-5 text-base font-medium text-white">
                                                        One QR code will be
                                                        generated after
                                                        submission.
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                                        The issued code belongs
                                                        to{' '}
                                                        {form.data
                                                            .household_name ||
                                                            'this household'}{' '}
                                                        and covers{' '}
                                                        {totalMembers}{' '}
                                                        registered resident
                                                        {totalMembers > 1
                                                            ? 's'
                                                            : ''}
                                                        .
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                                <div className="text-sm text-slate-400">
                                    {step < 3
                                        ? 'Use Next to continue through the registration steps.'
                                        : 'Ready to submit your household registration.'}
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                setStep(
                                                    (current) =>
                                                        (current -
                                                            1) as RegistrationStep,
                                                )
                                            }
                                            className="h-11 rounded-full border border-white/12 bg-white/[0.04] px-5 text-white hover:bg-white/[0.08]"
                                        >
                                            <ArrowLeft className="size-4" />
                                            Back
                                        </Button>
                                    )}
                                    {step < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-6 text-slate-950 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            Next Step
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={submit}
                                            disabled={form.processing}
                                            className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-6 text-slate-950 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            {form.processing && <Spinner />}
                                            Submit Registration
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
