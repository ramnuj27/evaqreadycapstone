import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    MapPinned,
    Navigation,
    QrCode,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { residentDateTime, residentLabel } from '@/lib/resident';
import resident from '@/routes/resident';

type AlertCard = {
    id: number;
    message: string;
    severity: string;
    time: string | null;
    title: string;
    type: string;
};

type CenterCard = {
    address: string;
    distanceKm: string;
    etaMinutes: number;
    name: string;
    status: string;
};

type ResidentDashboardProps = {
    residentDashboard: {
        evacuationStatus: {
            label: string;
            tone: string;
        };
        hazardZone: string;
        householdCode?: string | null;
        householdSize: number;
        latestAlert: AlertCard | null;
        nearestCenter: CenterCard | null;
        qrStatus: string;
        residentName: string;
    };
};

const toneBadgeClassNames: Record<string, string> = {
    critical:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
    default:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    warning:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
};

const alertToneClassNames: Record<string, string> = {
    critical:
        'border-rose-200/80 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30',
    high: 'border-orange-200/80 bg-orange-50/80 dark:border-orange-900/60 dark:bg-orange-950/30',
    low: 'border-sky-200/80 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30',
    medium: 'border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30',
};

export default function ResidentDashboard({
    residentDashboard,
}: ResidentDashboardProps) {
    const quickActions = [
        {
            description: 'Open and download your household QR code.',
            href: resident.qrCode(),
            icon: QrCode,
            title: 'View QR',
        },
        {
            description:
                'Check your nearest evacuation center and route preview.',
            href: resident.map(),
            icon: MapPinned,
            title: 'Open Map',
        },
        {
            description:
                'Use your camera and compass to point toward the nearest open center.',
            href: resident.evacuationAr(),
            icon: Navigation,
            title: 'AR Guide',
        },
        {
            description:
                'Review safety steps for flood, earthquake, typhoon, and tsunami.',
            href: resident.disasterInfo(),
            icon: BookOpen,
            title: 'Disaster Guide',
        },
        {
            description: 'Read the latest announcements and warnings.',
            href: resident.alerts(),
            icon: AlertTriangle,
            title: 'Read Alerts',
        },
    ];

    return (
        <>
            <Head title="Resident Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#082f49_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Resident Module
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Resident Dashboard
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Keep your household QR ready, check your current
                                evacuation status, and review the latest alert
                                or nearest open center without digging through
                                admin screens.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Household
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {residentDashboard.householdCode ??
                                        'Not registered'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {residentDashboard.householdSize} resident
                                    {residentDashboard.householdSize === 1
                                        ? ''
                                        : 's'}{' '}
                                    linked to this account
                                </p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Hazard Zone
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {residentDashboard.hazardZone}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Assigned for{' '}
                                    {residentDashboard.residentName}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
                    <Card className="rounded-[28px] border-border/70 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <QrCode className="size-5 text-sky-600" />
                                My QR Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
                                {residentDashboard.qrStatus}
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {residentDashboard.householdCode
                                    ? `QR is ready for household ${residentDashboard.householdCode}.`
                                    : 'Your household QR will appear once registration is complete.'}
                            </p>
                            <Button asChild className="w-full rounded-full">
                                <Link href={resident.qrCode()}>
                                    View QR Code
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border-border/70 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="size-5 text-emerald-600" />
                                Evacuation Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Badge
                                className={
                                    toneBadgeClassNames[
                                        residentDashboard.evacuationStatus.tone
                                    ]
                                }
                                variant="outline"
                            >
                                {residentDashboard.evacuationStatus.label}
                            </Badge>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {residentDashboard.evacuationStatus.label ===
                                'Registered'
                                    ? 'Your household is registered and ready for check-in if evacuation is ordered.'
                                    : `Current status is ${residentDashboard.evacuationStatus.label.toLowerCase()}.`}
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full rounded-full"
                            >
                                <Link href={resident.household()}>
                                    Review Household
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card
                        className={`rounded-[28px] border-border/70 shadow-sm ${residentDashboard.latestAlert ? alertToneClassNames[residentDashboard.latestAlert.severity] : ''}`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="size-5 text-orange-600" />
                                Latest Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {residentDashboard.latestAlert ? (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {
                                                    residentDashboard
                                                        .latestAlert.title
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {residentDateTime(
                                                    residentDashboard
                                                        .latestAlert.time,
                                                )}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {residentLabel(
                                                residentDashboard.latestAlert
                                                    .severity,
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="text-sm leading-6 text-foreground/90">
                                        {residentDashboard.latestAlert.message}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    No active alerts at this time. Continue
                                    checking the alerts page for announcements
                                    and barangay-specific warnings.
                                </p>
                            )}
                            <Button
                                asChild
                                variant="outline"
                                className="w-full rounded-full"
                            >
                                <Link href={resident.alerts()}>
                                    Read Alerts
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border-border/70 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPinned className="size-5 text-rose-600" />
                                Nearest Center
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {residentDashboard.nearestCenter ? (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {
                                                    residentDashboard
                                                        .nearestCenter.name
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    residentDashboard
                                                        .nearestCenter.address
                                                }
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {
                                                residentDashboard.nearestCenter
                                                    .status
                                            }
                                        </Badge>
                                    </div>
                                    <div className="rounded-[20px] border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                        {
                                            residentDashboard.nearestCenter
                                                .distanceKm
                                        }
                                        {' / '}
                                        {
                                            residentDashboard.nearestCenter
                                                .etaMinutes
                                        }{' '}
                                        min estimated travel
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Your nearest evacuation center will appear
                                    once the household barangay is available.
                                </p>
                            )}
                            <Button
                                asChild
                                variant="outline"
                                className="w-full rounded-full"
                            >
                                <Link href={resident.map()}>View Map</Link>
                            </Button>
                            <Button asChild className="w-full rounded-full">
                                <Link href={resident.evacuationAr()}>
                                    <Navigation className="size-4" />
                                    Open AR Guide
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="rounded-[24px] border border-border/70 bg-muted/20 p-4 shadow-sm transition hover:border-primary/40 hover:bg-accent/40"
                                >
                                    <span className="flex size-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                                        <action.icon className="size-5" />
                                    </span>
                                    <p className="mt-4 font-semibold text-foreground">
                                        {action.title}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {action.description}
                                    </p>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <UsersRound className="size-5 text-sky-600" />
                                Household Reminder
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm leading-6 text-muted-foreground">
                                Make sure your household member list stays up to
                                date. The resident QR, evacuation monitoring,
                                and center planning all depend on accurate
                                household information.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full rounded-full"
                            >
                                <Link href={resident.household()}>
                                    Open My Household
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

ResidentDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Resident Dashboard',
            href: resident.dashboard(),
        },
    ],
};
