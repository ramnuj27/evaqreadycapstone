import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    ChevronDown,
    HousePlus,
    LocateFixed,
    Menu,
    QrCode,
    RadioTower,
    ShieldCheck,
    Siren,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
import { disasterLinks } from '@/lib/disaster-links';
import { cn } from '@/lib/utils';
import {
    contact as contactRoute,
    dashboard,
    features as featuresRoute,
    home,
    register,
} from '@/routes';

type Props = {
    canRegister?: boolean;
    canResetPassword?: boolean;
};

type NavItem = {
    label: string;
    href: string;
};

type WorkflowStep = {
    step: string;
    title: string;
    description: string;
    icon: LucideIcon;
};

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

const surfaceClassName =
    'public-adaptive-glass rounded-[28px] backdrop-blur-xl';

const workflowSteps: WorkflowStep[] = [
    {
        step: '01',
        title: 'Register as a resident',
        description:
            'Residents create a profile once so barangay teams have accurate household and emergency details before incidents occur.',
        icon: HousePlus,
    },
    {
        step: '02',
        title: 'Receive your QR code',
        description:
            'Each resident gets a unique QR identity that can be accessed quickly during response and relocation operations.',
        icon: QrCode,
    },
    {
        step: '03',
        title: 'Go to the evacuation center',
        description:
            'Guided alerts and assigned center details help families move to the nearest safe location with less confusion.',
        icon: LocateFixed,
    },
    {
        step: '04',
        title: 'QR is scanned by operator',
        description:
            'Operators confirm arrivals in seconds using QR scanning, reducing manual encoding and long entry queues.',
        icon: RadioTower,
    },
    {
        step: '05',
        title: 'Admin sees you as safe',
        description:
            'Administrators instantly see resident status updates inside the dashboard for faster coordination and accountability.',
        icon: ShieldCheck,
    },
];

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
];

function GlassPanel({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn(surfaceClassName, className)}>{children}</div>;
}

export default function HowItWorks({
    canRegister = true,
    canResetPassword = true,
}: Props) {
    const { auth } = usePage().props;
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: 'Home', href: home.url() },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Features', href: featuresRoute.url() },
        { label: 'Contact', href: contactRoute.url() },
    ];

    return (
        <>
            <Head title="How It Works - EvaQReady">
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
                            <Link
                                href={home()}
                                className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white uppercase"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-slate-950 shadow-[0_10px_25px_rgba(251,146,60,0.4)]">
                                    EQ
                                </span>
                                <span className="text-base tracking-[0.22em]">
                                    EvaQReady
                                </span>
                            </Link>

                            <nav className="hidden items-center gap-2 lg:flex">
                                {navItems.slice(0, 3).map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            'rounded-full px-4 py-2 text-sm transition duration-300',
                                            item.label === 'How It Works'
                                                ? 'border border-white/12 bg-white/[0.08] text-white'
                                                : 'text-slate-300 hover:bg-white/6 hover:text-white',
                                        )}
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
                                        {disasterLinks.map((item) => (
                                            <DropdownMenuItem
                                                key={item.label}
                                                asChild
                                                className="cursor-pointer rounded-xl px-3 py-2 text-slate-200 focus:bg-white/8 focus:text-white"
                                            >
                                                <Link href={item.href}>
                                                    {item.label}
                                                </Link>
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
                                        className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)]"
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
                                            className="rounded-full border border-white/12 bg-white/[0.03] px-5 text-slate-100 hover:bg-white/8"
                                        >
                                            Login
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                asChild
                                                className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)]"
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
                                                {navItems.map((item) => (
                                                    <SheetClose
                                                        key={item.label}
                                                        asChild
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className={cn(
                                                                'block rounded-2xl border px-4 py-3 text-base transition duration-300',
                                                                item.label ===
                                                                    'How It Works'
                                                                    ? 'border-white/10 bg-white/[0.08] text-white'
                                                                    : 'border-transparent text-slate-200 hover:border-white/10 hover:bg-white/6 hover:text-white',
                                                            )}
                                                        >
                                                            {item.label}
                                                        </a>
                                                    </SheetClose>
                                                ))}
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

                <main className="pt-28">
                    <section
                        id="how-it-works"
                        className="public-light-section border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-200 uppercase shadow-[0_10px_30px_rgba(2,10,24,0.28)]">
                                        <Siren className="size-3.5 text-orange-300" />
                                        Resident Journey
                                    </p>
                                    <h1
                                        className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl"
                                        style={displayFont}
                                    >
                                        A dedicated page for how EvaQReady
                                        works from registration to verified
                                        safety.
                                    </h1>
                                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                                        This flow keeps residents, operators,
                                        and administrators aligned during
                                        stressful evacuation moments without
                                        mixing the process into the Features
                                        page.
                                    </p>
                                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)]"
                                        >
                                            <Link href={featuresRoute()}>
                                                Explore Features
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={contactRoute()}>
                                                Contact Team
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <GlassPanel className="p-8">
                                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                                        <BellRing className="size-3.5 text-orange-300" />
                                        Process Snapshot
                                    </p>
                                    <h2
                                        className="mt-6 text-3xl font-semibold text-white"
                                        style={displayFont}
                                    >
                                        Five clean steps from onboarding to live
                                        status visibility
                                    </h2>
                                    <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
                                        Every step is designed to shorten lines,
                                        reduce manual tracking, and help the
                                        admin team see safe arrivals in real
                                        time.
                                    </p>
                                    <div className="mt-8 grid gap-4">
                                        <div className="rounded-[24px] border border-white/10 bg-[#06192b]/85 p-5">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <QrCode className="size-4 text-orange-300" />
                                                QR identity
                                            </div>
                                            <p className="mt-3 text-lg leading-7 text-white">
                                                One verified resident identity
                                                that can be scanned quickly when
                                                every second matters.
                                            </p>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-[#06192b]/85 p-5">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <ShieldCheck className="size-4 text-orange-300" />
                                                Live accountability
                                            </div>
                                            <p className="mt-3 text-lg leading-7 text-white">
                                                Barangay teams can confirm who
                                                has arrived and who still needs
                                                follow-up without switching
                                                systems.
                                            </p>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </div>

                            <div className="mt-12 grid gap-5 lg:grid-cols-5">
                                {workflowSteps.map((step) => (
                                    <GlassPanel
                                        key={step.step}
                                        className="group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-white/[0.08]"
                                    >
                                        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-orange-400/10 blur-3xl transition duration-300 group-hover:bg-orange-400/20" />
                                        <div className="relative">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                                                    Step {step.step}
                                                </span>
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-orange-300">
                                                    <step.icon className="size-5" />
                                                </div>
                                            </div>
                                            <h3
                                                className="mt-6 text-xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                {step.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </GlassPanel>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="public-light-section-alt border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-6xl">
                            <GlassPanel className="overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
                                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.28em] text-orange-300 uppercase">
                                            Next Step
                                        </p>
                                        <h2
                                            className="mt-4 text-3xl font-semibold text-white sm:text-4xl"
                                            style={displayFont}
                                        >
                                            Understand the process first, then
                                            move into the tools that support it.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                            The workflow now lives on its own
                                            page so the process stays clear and
                                            separate from the feature overview
                                            and contact details.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)]"
                                        >
                                            <Link href={featuresRoute()}>
                                                View Features
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={contactRoute()}>
                                                Go to Contact
                                            </Link>
                                        </Button>
                                    </div>
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
                                A dedicated process page that explains how
                                resident onboarding, QR verification, and admin
                                visibility work together during evacuation.
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
                        Copyright 2026 EvaQReady. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
