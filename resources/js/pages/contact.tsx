import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    Clock3,
    Mail,
    MapPin,
    Menu,
    MessageSquareText,
    Phone,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
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
    dashboard,
    features as featuresRoute,
    home,
    howItWorks as howItWorksRoute,
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

type ContactCard = {
    title: string;
    value: string;
    detail: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
};

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

const surfaceClassName =
    'public-adaptive-glass rounded-[28px] backdrop-blur-xl';

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
];

const contactCards: ContactCard[] = [
    {
        title: 'Email Support',
        value: 'response@evaqready.gov.ph',
        detail: 'For onboarding, barangay coordination, and system questions.',
        href: 'mailto:response@evaqready.gov.ph',
        icon: Mail,
    },
    {
        title: 'Emergency Hotline',
        value: '+63 917 123 4567',
        detail: 'Use for urgent response coordination and evacuation updates.',
        href: 'tel:+639171234567',
        icon: Phone,
    },
    {
        title: 'Operations Center',
        value: 'Municipal Disaster Operations Center',
        detail: 'Primary command location for resident tracking and alerts.',
        icon: MapPin,
    },
    {
        title: 'Availability',
        value: '24/7 Monitoring Window',
        detail: 'Preparedness, alerts, and resident status review remain active.',
        icon: Clock3,
    },
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

export default function Contact({
    canRegister = true,
    canResetPassword = true,
}: Props) {
    const { auth } = usePage().props;
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: 'Home', href: home.url() },
        { label: 'How It Works', href: howItWorksRoute.url() },
        { label: 'Features', href: featuresRoute.url() },
        { label: 'Contact', href: '#contact' },
    ];

    return (
        <>
            <Head title="Contact - EvaQReady">
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
                                    href="#contact"
                                    className="rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm text-white transition duration-300"
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
                                                                    'Contact'
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
                        id="contact"
                        className="public-light-section border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-200 uppercase shadow-[0_10px_30px_rgba(2,10,24,0.28)]">
                                        <MessageSquareText className="size-3.5 text-orange-300" />
                                        Contact EvaQReady
                                    </p>
                                    <h1
                                        className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl"
                                        style={displayFont}
                                    >
                                        A dedicated contact page for support,
                                        onboarding, and response coordination.
                                    </h1>
                                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                                        Contact now lives on its own page so the
                                        public site can keep communication
                                        details separate from Home, Features,
                                        and How It Works.
                                    </p>
                                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)]"
                                        >
                                            <a href="mailto:response@evaqready.gov.ph">
                                                Email Support
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <a href="tel:+639171234567">
                                                Call Hotline
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                <GlassPanel className="p-8">
                                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                                        <Clock3 className="size-3.5 text-orange-300" />
                                        Response Window
                                    </p>
                                    <h2
                                        className="mt-6 text-3xl font-semibold text-white"
                                        style={displayFont}
                                    >
                                        Reach the team through the channel that
                                        fits the urgency.
                                    </h2>
                                    <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
                                        Use email for onboarding and system
                                        questions, or the hotline for urgent
                                        coordination during evacuation activity.
                                    </p>
                                    <div className="mt-8 grid gap-4">
                                        <div className="rounded-[24px] border border-white/10 bg-[#06192b]/85 p-5">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Mail className="size-4 text-orange-300" />
                                                Support mailbox
                                            </div>
                                            <p className="mt-3 text-lg leading-7 text-white">
                                                response@evaqready.gov.ph
                                            </p>
                                        </div>
                                        <div className="rounded-[24px] border border-white/10 bg-[#06192b]/85 p-5">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Phone className="size-4 text-orange-300" />
                                                Hotline
                                            </div>
                                            <p className="mt-3 text-lg leading-7 text-white">
                                                +63 917 123 4567
                                            </p>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </div>

                            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                {contactCards.map((card) => (
                                    <GlassPanel
                                        key={card.title}
                                        className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-white/[0.08]"
                                    >
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-orange-300 transition duration-300 group-hover:border-orange-300/20 group-hover:bg-orange-400/10">
                                            <card.icon className="size-5" />
                                        </div>
                                        <h3
                                            className="mt-5 text-xl font-semibold text-white"
                                            style={displayFont}
                                        >
                                            {card.title}
                                        </h3>
                                        {card.href ? (
                                            <a
                                                href={card.href}
                                                className="mt-3 block text-base font-medium text-white transition-colors duration-300 hover:text-orange-200"
                                            >
                                                {card.value}
                                            </a>
                                        ) : (
                                            <p className="mt-3 text-base font-medium text-white">
                                                {card.value}
                                            </p>
                                        )}
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {card.detail}
                                        </p>
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
                                            Need the process or the feature
                                            overview first? Jump there directly.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                            Contact is now kept separate, so the
                                            rest of the public site can stay
                                            focused on explaining the system and
                                            the workflow.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)]"
                                        >
                                            <Link href={howItWorksRoute()}>
                                                View How It Works
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={featuresRoute()}>
                                                View Features
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
                                A dedicated contact page that keeps support
                                details, hotline access, and communication
                                channels in one public destination.
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
                                    href={howItWorksRoute.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    How It Works
                                </a>
                                <a
                                    href={featuresRoute.url()}
                                    className="transition-colors duration-300 hover:text-white"
                                >
                                    Features
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
