import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    LogIn,
    MapPinHouse,
    QrCode,
    UsersRound,
} from 'lucide-react';
import { home } from '@/routes';

type Props = {
    registration: {
        household_name: string;
        household_code: string;
        qr_payload: string;
        qr_svg: string;
        total_members: number;
        hazard_zone: string;
        address: {
            street_address: string;
            barangay: string;
            city: string;
        };
        head: {
            name: string;
            email: string;
            contact_number: string;
            gender: string;
            birthdate: string | null;
        };
        members: Array<{
            full_name: string;
            gender: string;
            birthdate: string | null;
            category: string;
            is_pwd: boolean;
            is_pregnant: boolean;
        }>;
    };
};

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

function niceValue(value: string): string {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function RegisterSuccess({ registration }: Props) {
    const landingLoginUrl = home({ query: { login: 1 } });

    const downloadQr = () => {
        const blob = new Blob([registration.qr_svg], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${registration.household_code.toLowerCase()}-qr.svg`;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
    };

    return (
        <>
            <Head title="Registration Complete">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|outfit:500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_28%),linear-gradient(180deg,#020b14_0%,#041728_42%,#03111f_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
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
                        <Link
                            href={landingLoginUrl}
                            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]"
                        >
                            <LogIn className="size-4" />
                            Proceed to Login
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="rounded-[34px] border border-white/10 bg-[#071b2d]/80 p-6 shadow-[0_35px_100px_rgba(2,10,24,0.5)] backdrop-blur-2xl sm:p-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-emerald-200 uppercase">
                                <CheckCircle2 className="size-3.5" />
                                Registration Complete
                            </div>
                            <h1
                                className="mt-5 text-4xl font-semibold tracking-tight text-white"
                                style={displayFont}
                            >
                                Your household QR is ready.
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                                EvaQReady created one QR code for{' '}
                                {registration.household_name}. This code belongs
                                only to your registered household, so other
                                families cannot use it during evacuation
                                check-in.
                            </p>

                            <div className="mt-8 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 text-center">
                                    <div
                                        className="mx-auto flex max-w-[220px] items-center justify-center rounded-[28px] bg-white p-5 shadow-[0_18px_40px_rgba(2,10,24,0.2)]"
                                        dangerouslySetInnerHTML={{
                                            __html: registration.qr_svg,
                                        }}
                                    />
                                    <p className="mt-5 text-sm font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                        {registration.household_code}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Shared QR for{' '}
                                        {registration.total_members} registered
                                        household member
                                        {registration.total_members > 1
                                            ? 's'
                                            : ''}
                                        .
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                            Head of Household
                                        </p>
                                        <p className="mt-3 text-lg font-medium text-white">
                                            {registration.head.name}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-400">
                                            {registration.head.email}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {registration.head.contact_number}
                                        </p>
                                    </div>
                                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                            Hazard Zone
                                        </p>
                                        <p className="mt-3 text-lg font-medium text-white">
                                            {niceValue(
                                                registration.hazard_zone,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:col-span-2">
                                        <p className="text-xs tracking-[0.22em] text-slate-400 uppercase">
                                            Household Address
                                        </p>
                                        <p className="mt-3 text-base leading-7 text-white">
                                            {
                                                registration.address
                                                    .street_address
                                            }
                                            , {registration.address.barangay},{' '}
                                            {registration.address.city}
                                        </p>
                                    </div>
                                    <div className="rounded-[24px] border border-orange-300/20 bg-orange-400/8 p-5 sm:col-span-2">
                                        <p className="text-sm leading-7 text-slate-200">
                                            Keep this QR code with your family.
                                            The same code can be presented for
                                            the registered members in this
                                            household, but it will not match any
                                            other family record.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={downloadQr}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-6 text-sm font-semibold text-slate-950 transition hover:from-orange-400 hover:to-amber-200"
                                >
                                    <Download className="size-4" />
                                    Download QR Code
                                </button>
                                <Link
                                    href={landingLoginUrl}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                                >
                                    <LogIn className="size-4" />
                                    Proceed to Login
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-[30px] border border-white/10 bg-[#071b2d]/80 p-5 shadow-[0_25px_70px_rgba(2,10,24,0.4)] backdrop-blur-2xl">
                                <div className="flex items-center gap-3 text-orange-300">
                                    <UsersRound className="size-5" />
                                    <p className="text-sm font-semibold text-white">
                                        Registered Members
                                    </p>
                                </div>
                                <div className="mt-5 space-y-3">
                                    {registration.members.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-slate-400">
                                            No additional members were added.
                                            This household QR is assigned to the
                                            head of household only.
                                        </div>
                                    ) : (
                                        registration.members.map((member) => (
                                            <div
                                                key={`${member.full_name}-${member.birthdate}`}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                            >
                                                <p className="text-sm font-medium text-white">
                                                    {member.full_name}
                                                </p>
                                                <p className="mt-1 text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                    {member.category}
                                                </p>
                                                <p className="mt-2 text-sm text-slate-400">
                                                    {niceValue(member.gender)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[30px] border border-white/10 bg-[#071b2d]/80 p-5 shadow-[0_25px_70px_rgba(2,10,24,0.4)] backdrop-blur-2xl">
                                <div className="flex items-center gap-3 text-sky-300">
                                    <MapPinHouse className="size-5" />
                                    <p className="text-sm font-semibold text-white">
                                        QR Payload
                                    </p>
                                </div>
                                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 font-mono text-xs leading-6 text-slate-300">
                                    {registration.qr_payload}
                                </div>
                                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                                    <QrCode className="mt-1 size-4 shrink-0 text-orange-300" />
                                    Use this encoded household value when
                                    integrating QR scanning at evacuation
                                    centers later in the capstone workflow.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
