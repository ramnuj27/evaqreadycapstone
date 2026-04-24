import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeAlert,
    Building2,
    ChevronDown,
    CircleCheckBig,
    Menu,
    RadioTower,
    ShieldCheck,
    Siren,
    TriangleAlert,
    UsersRound,
    Waves,
    Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import LandingLoginDialog from '@/components/landing-login-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { getDisasterHref, type DisasterGuideId } from '@/lib/disaster-links';
import { cn } from '@/lib/utils';
import {
    contact as contactRoute,
    dashboard,
    features as featuresRoute,
    home,
    howItWorks as howItWorksRoute,
    register,
} from '@/routes';

type Props = {
    canRegister?: boolean;
    canResetPassword?: boolean;
    heroImageUrl?: string;
};

type NavigationItem = {
    label: string;
    href: string;
};

type DisasterCard = {
    id: DisasterGuideId;
    title: string;
    description: string;
    icon: LucideIcon;
};

type CommandMetric = {
    label: string;
    value: string;
    detail: string;
};

type CenterStatus = {
    name: string;
    occupancy: string;
    progress: string;
};

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

const navigationItems: NavigationItem[] = [
    { label: 'Home', href: home.url() },
    { label: 'How It Works', href: howItWorksRoute.url() },
    { label: 'Features', href: featuresRoute.url() },
    { label: 'Contact', href: contactRoute.url() },
];

const disasterCards: DisasterCard[] = [
    {
        id: 'flood',
        title: 'Flood',
        description:
            'Monitor rising water levels, vulnerable zones, and center capacity for low-lying communities.',
        icon: Waves,
    },
    {
        id: 'tsunami',
        title: 'Tsunami',
        description:
            'Coordinate rapid coastal evacuation and verify safe arrival at inland centers.',
        icon: RadioTower,
    },
    {
        id: 'earthquake',
        title: 'Earthquake',
        description:
            'Track displaced residents quickly when structural damage forces immediate relocation.',
        icon: TriangleAlert,
    },
    {
        id: 'typhoon',
        title: 'Typhoon',
        description:
            'Stay ahead of wind, rainfall, and pre-emptive evacuation operations with centralized monitoring.',
        icon: Wind,
    },
];

const heroHighlights = [
    'Real-time resident roster',
    'Barangay command visibility',
    'Rapid QR-based safe check-in',
];

const commandMetrics: CommandMetric[] = [
    {
        label: 'Residents Verified',
        value: '1,482',
        detail: 'across active evacuation sites',
    },
    {
        label: 'Barangays Monitored',
        value: '14',
        detail: 'within one live dashboard',
    },
    {
        label: 'Alert Readiness',
        value: '24/7',
        detail: 'for warnings and status changes',
    },
];

const centerStatuses: CenterStatus[] = [
    { name: 'North Gymnasium', occupancy: '76% occupied', progress: '76%' },
    {
        name: 'Bayview Covered Court',
        occupancy: '58% occupied',
        progress: '58%',
    },
    { name: 'Central Civic Hall', occupancy: '91% occupied', progress: '91%' },
];

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
];

const surfaceClassName =
    'public-adaptive-glass rounded-[28px] backdrop-blur-xl';

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
}: {
    eyebrow: string;
    title: string;
    description: string;
    align?: 'left' | 'center';
}) {
    return (
        <div
            className={cn(
                'max-w-3xl',
                align === 'center' && 'mx-auto text-center',
            )}
        >
            <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-orange-300 uppercase">
                {eyebrow}
            </p>
            <h2
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                style={displayFont}
            >
                {title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                {description}
            </p>
        </div>
    );
}

function GlassPanel({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn(surfaceClassName, className)}>{children}</div>;
}

export default function Welcome({
    canRegister = true,
    canResetPassword = true,
    heroImageUrl = '/mati-evacuation-cover.png',
}: Props) {
    const { auth } = usePage().props;
    const [isLoginOpen, setIsLoginOpen] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return new URLSearchParams(window.location.search).get('login') === '1';
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        if (searchParams.get('login') !== '1') {
            return;
        }

        searchParams.delete('login');

        const nextQuery = searchParams.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;

        window.history.replaceState(
            window.history.state,
            '',
            nextUrl || home.url(),
        );
    }, []);

    return (
        <>
            <Head title="EvaQReady">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|outfit:500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <LandingLoginDialog
                open={isLoginOpen}
                onOpenChange={setIsLoginOpen}
                canRegister={canRegister}
                canResetPassword={canResetPassword}
            />

            <div className="public-page min-h-screen selection:bg-orange-300 selection:text-slate-950">
                <header className="fixed inset-x-0 top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="public-header-shell flex items-center justify-between gap-4 rounded-full px-5 py-3 backdrop-blur-xl">
                            <a
                                href="#home"
                                className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white uppercase"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-slate-950 shadow-[0_10px_25px_rgba(251,146,60,0.4)]">
                                    EQ
                                </span>
                                <span className="text-base tracking-[0.22em]">
                                    EvaQReady
                                </span>
                            </a>

                            <nav className="hidden items-center gap-2 lg:flex">
                                {navigationItems.slice(0, 3).map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="rounded-full px-4 py-2 text-sm text-slate-300 transition duration-300 hover:bg-white/6 hover:text-white"
                                    >
                                        {item.label}
                                    </a>
                                ))}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-slate-300 transition duration-300 hover:bg-white/6 hover:text-white"
                                        >
                                            Disaster Info
                                            <ChevronDown className="size-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="center"
                                        className="public-dropdown-shell w-56 rounded-2xl p-2 backdrop-blur-xl"
                                    >
                                        {disasterCards.map((card) => (
                                            <DropdownMenuItem
                                                key={card.id}
                                                asChild
                                                className="cursor-pointer rounded-xl px-3 py-2 text-slate-200 focus:bg-white/8 focus:text-white"
                                            >
                                                <a
                                                    href={getDisasterHref(
                                                        card.id,
                                                    )}
                                                >
                                                    {card.title}
                                                </a>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <a
                                    href={contactRoute.url()}
                                    className="rounded-full px-4 py-2 text-sm text-slate-300 transition duration-300 hover:bg-white/6 hover:text-white"
                                >
                                    Contact
                                </a>
                            </nav>

                            <div className="hidden items-center gap-3 lg:flex">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                    >
                                        <Link href={dashboard()}>
                                            Open Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsLoginOpen(true)}
                                            className="rounded-full border border-white/12 bg-white/[0.03] px-5 text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white/8"
                                        >
                                            Login
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                asChild
                                                className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Link href={register()}>
                                                    Sign Up
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full border border-white/12 bg-white/[0.03] text-white hover:bg-white/8"
                                        >
                                            <Menu className="size-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="public-mobile-sheet backdrop-blur-xl">
                                        <SheetHeader className="border-b border-white/10 px-6 pt-6 pb-4 text-left">
                                            <SheetTitle
                                                className="text-left text-xl text-white"
                                                style={displayFont}
                                            >
                                                EvaQReady
                                            </SheetTitle>
                                        </SheetHeader>

                                        <div className="flex h-full flex-col justify-between px-6 pt-4 pb-6">
                                            <div className="space-y-2">
                                                {navigationItems.map((item) => (
                                                    <SheetClose
                                                        key={item.label}
                                                        asChild
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className="block rounded-2xl border border-transparent px-4 py-3 text-base text-slate-200 transition duration-300 hover:border-white/10 hover:bg-white/6 hover:text-white"
                                                        >
                                                            {item.label}
                                                        </a>
                                                    </SheetClose>
                                                ))}

                                                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                                                    <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-orange-300 uppercase">
                                                        Disaster Info
                                                    </p>
                                                    <div className="grid gap-2">
                                                        {disasterCards.map(
                                                            (card) => (
                                                                <SheetClose
                                                                    key={
                                                                        card.id
                                                                    }
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={getDisasterHref(
                                                                            card.id,
                                                                        )}
                                                                        className="rounded-2xl px-3 py-2 text-sm text-slate-200 transition duration-300 hover:bg-white/6 hover:text-white"
                                                                    >
                                                                        {
                                                                            card.title
                                                                        }
                                                                    </a>
                                                                </SheetClose>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 pt-6">
                                                {auth.user ? (
                                                    <SheetClose asChild>
                                                        <Button
                                                            asChild
                                                            className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-slate-950"
                                                        >
                                                            <Link
                                                                href={dashboard()}
                                                            >
                                                                Open Dashboard
                                                            </Link>
                                                        </Button>
                                                    </SheetClose>
                                                ) : (
                                                    <>
                                                        <SheetClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setIsLoginOpen(
                                                                        true,
                                                                    )
                                                                }
                                                                className="h-11 rounded-full border border-white/12 bg-white/[0.03] text-white hover:bg-white/8"
                                                            >
                                                                Login
                                                            </Button>
                                                        </SheetClose>
                                                        {canRegister && (
                                                            <SheetClose asChild>
                                                                <Button
                                                                    asChild
                                                                    className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-slate-950"
                                                                >
                                                                    <Link
                                                                        href={register()}
                                                                    >
                                                                        Sign Up
                                                                    </Link>
                                                                </Button>
                                                            </SheetClose>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </header>

                <main>
                    <section
                        id="home"
                        className="public-hero-dark relative isolate min-h-screen overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 bg-cover opacity-55"
                            style={{
                                backgroundImage: `url('${heroImageUrl}')`,
                                backgroundPosition: 'center 40%',
                            }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(3,17,31,0.94)_18%,rgba(4,28,50,0.74)_54%,rgba(3,17,31,0.9)_100%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.26),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.2),transparent_26%)]" />

                        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,420px)] lg:items-center">
                                <div className="duration-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-200 uppercase shadow-[0_10px_30px_rgba(2,10,24,0.28)] backdrop-blur-xl">
                                        <Siren className="size-3.5 text-orange-300" />
                                        Disaster Evacuation Management System
                                    </div>

                                    <h1
                                        className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
                                        style={displayFont}
                                    >
                                        Stay Safe. Stay Tracked. Evacuate
                                        Smarter.
                                    </h1>

                                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                                        A smart evacuation system that tracks
                                        residents in real-time using QR
                                        technology.
                                    </p>

                                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                        {auth.user ? (
                                            <Button
                                                asChild
                                                size="lg"
                                                className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Link href={dashboard()}>
                                                    Open Dashboard
                                                </Link>
                                            </Button>
                                        ) : canRegister ? (
                                            <Button
                                                asChild
                                                size="lg"
                                                className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Link href={register()}>
                                                    Create Account
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="lg"
                                                onClick={() =>
                                                    setIsLoginOpen(true)
                                                }
                                                className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                Create Account
                                            </Button>
                                        )}

                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={howItWorksRoute()}>
                                                Learn More
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {heroHighlights.map((highlight) => (
                                            <div
                                                key={highlight}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 shadow-[0_10px_25px_rgba(2,10,24,0.18)] backdrop-blur-xl"
                                            >
                                                <CircleCheckBig className="size-4 text-emerald-300" />
                                                {highlight}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                        {commandMetrics.map((metric, index) => (
                                            <GlassPanel
                                                key={metric.label}
                                                className={cn(
                                                    'p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6',
                                                    index === 1 &&
                                                        'sm:translate-y-6',
                                                )}
                                            >
                                                <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                    {metric.label}
                                                </p>
                                                <p
                                                    className="mt-3 text-3xl font-semibold text-white"
                                                    style={displayFont}
                                                >
                                                    {metric.value}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                                    {metric.detail}
                                                </p>
                                            </GlassPanel>
                                        ))}
                                    </div>
                                </div>

                                <div className="duration-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 lg:justify-self-end">
                                    <GlassPanel className="overflow-hidden">
                                        <div className="border-b border-white/10 px-6 py-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-200 uppercase">
                                                    <ShieldCheck className="size-3.5" />
                                                    System Online
                                                </div>
                                                <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                                                    <BadgeAlert className="size-4 text-orange-300" />
                                                    Ready for alerts
                                                </div>
                                            </div>

                                            <h2
                                                className="mt-5 text-3xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Live command snapshot
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                A unified view for resident
                                                arrivals, center occupancy, and
                                                barangay-level response
                                                readiness.
                                            </p>
                                        </div>

                                        <div className="grid gap-5 px-6 py-6">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-3xl border border-white/10 bg-[#06192b]/85 p-4">
                                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                                        <UsersRound className="size-4 text-orange-300" />
                                                        Active families tracked
                                                    </div>
                                                    <p
                                                        className="mt-3 text-3xl font-semibold text-white"
                                                        style={displayFont}
                                                    >
                                                        426
                                                    </p>
                                                    <p className="mt-2 text-xs tracking-[0.18em] text-emerald-300 uppercase">
                                                        98% verified on-site
                                                    </p>
                                                </div>

                                                <div className="rounded-3xl border border-white/10 bg-[#06192b]/85 p-4">
                                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                                        <Building2 className="size-4 text-orange-300" />
                                                        Monitored centers
                                                    </div>
                                                    <p
                                                        className="mt-3 text-3xl font-semibold text-white"
                                                        style={displayFont}
                                                    >
                                                        12
                                                    </p>
                                                    <p className="mt-2 text-xs tracking-[0.18em] text-sky-300 uppercase">
                                                        Capacity balanced live
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-[26px] border border-white/10 bg-[#06192b]/82 p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                            Center Occupancy
                                                        </p>
                                                        <p className="mt-2 text-lg font-medium text-white">
                                                            Priority monitoring
                                                            for tonight&apos;s
                                                            response window
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-right text-sm text-slate-200">
                                                        3 centers
                                                        <div className="text-xs text-slate-400">
                                                            nearing capacity
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 space-y-4">
                                                    {centerStatuses.map(
                                                        (center) => (
                                                            <div
                                                                key={
                                                                    center.name
                                                                }
                                                                className="space-y-2"
                                                            >
                                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                                    <span className="text-slate-100">
                                                                        {
                                                                            center.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-slate-400">
                                                                        {
                                                                            center.occupancy
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                                                                    <div
                                                                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-orange-400 to-orange-300"
                                                                        style={{
                                                                            width: center.progress,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-[26px] border border-orange-400/18 bg-orange-400/8 p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-2xl bg-orange-400/18 p-2 text-orange-200">
                                                        <TriangleAlert className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold tracking-[0.22em] text-orange-200 uppercase">
                                                            Preparedness Alert
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-orange-50/90">
                                                            Typhoon monitoring
                                                            remains elevated.
                                                            Operators can scan
                                                            residents on arrival
                                                            and instantly mark
                                                            them safe for admin
                                                            review.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassPanel>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="disaster-info"
                        className="public-light-section-alt border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Disaster Info"
                                title="Preparedness views designed for the threats communities face most"
                                description="Each incident type demands different timing, routes, and verification pressure. EvaQReady gives response teams a structure that adapts to each one."
                            />

                            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                {disasterCards.map((card) => (
                                    <GlassPanel
                                        key={card.id}
                                        className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-white/[0.08]"
                                    >
                                        <div id={card.id} className="sr-only">
                                            {card.title}
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-orange-300 transition duration-300 group-hover:border-orange-300/20 group-hover:bg-orange-400/10">
                                                <card.icon className="size-5" />
                                            </div>
                                            <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                                                Response Mode
                                            </span>
                                        </div>
                                        <h3
                                            className="mt-5 text-2xl font-semibold text-white"
                                            style={displayFont}
                                        >
                                            {card.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {card.description}
                                        </p>
                                    </GlassPanel>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="public-light-section border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-6xl">
                            <GlassPanel className="overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
                                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.28em] text-orange-300 uppercase">
                                            Call To Action
                                        </p>
                                        <h2
                                            className="mt-4 text-3xl font-semibold text-white sm:text-4xl"
                                            style={displayFont}
                                        >
                                            Be Prepared Before Disaster Strikes
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                            Launch a modern evacuation workflow
                                            that reduces manual tracking,
                                            improves resident accountability,
                                            and gives administrators live
                                            operational confidence.
                                        </p>
                                    </div>

                                    {auth.user ? (
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            <Link href={dashboard()}>
                                                Get Started Now
                                            </Link>
                                        </Button>
                                    ) : canRegister ? (
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            <Link href={register()}>
                                                Get Started Now
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="lg"
                                            onClick={() => setIsLoginOpen(true)}
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            Get Started Now
                                        </Button>
                                    )}
                                </div>
                            </GlassPanel>
                        </div>
                    </section>
                </main>

                <footer className="public-footer-shell border-t border-white/8 px-4 py-14 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-slate-950 shadow-[0_10px_25px_rgba(251,146,60,0.4)]">
                                    EQ
                                </span>
                                <div>
                                    <p
                                        className="text-xl font-semibold text-white"
                                        style={displayFont}
                                    >
                                        EvaQReady
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Smart evacuation management for modern
                                        communities
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                                Designed as a capstone-ready disaster evacuation
                                platform that gives local government teams a
                                more reliable way to track residents, coordinate
                                centers, and communicate alerts.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                Quick Links
                            </p>
                            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                                <a
                                    href={home.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    Home
                                </a>
                                <a
                                    href={featuresRoute.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    Features
                                </a>
                                <a
                                    href={howItWorksRoute.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    How It Works
                                </a>
                                <a
                                    href={contactRoute.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                Social Links
                            </p>
                            <div className="mt-4 grid gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-300 hover:text-white"
                                    >
                                        {link.label}
                                        <ArrowRight className="size-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 max-w-7xl border-t border-white/8 pt-6 text-sm text-slate-500">
                        © 2026 EvaQReady. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
