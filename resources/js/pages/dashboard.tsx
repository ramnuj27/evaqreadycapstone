import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Clock3,
    MapPinned,
    Megaphone,
    Play,
    Plus,
    QrCode,
    Siren,
    TriangleAlert,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { DashboardPageProps } from '@/components/console-panels';
import { MapboxStaticMap } from '@/components/mapbox-static-map';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    alertsNotifications as alertsNotificationsRoute,
    dashboard as dashboardRoute,
    evacuationMonitoring as evacuationMonitoringRoute,
    householdManagement as householdManagementRoute,
    mapMonitoring as mapMonitoringRoute,
} from '@/routes';
import type { Auth } from '@/types';
import type { RouteDefinition } from '@/wayfinder';

type SummaryTone = 'amber' | 'emerald' | 'orange' | 'rose';
type AlertItem = DashboardPageProps['dashboard']['alerts'][number];
type ActivityItem = DashboardPageProps['dashboard']['liveActivity'][number];
type CenterItem =
    DashboardPageProps['dashboard']['evacuationCenters']['centers'][number];
type DashboardMapMarker =
    DashboardPageProps['dashboard']['mapMonitoring']['markers'][number];

const alertSurfaceClassNames: Record<AlertItem['tone'], string> = {
    critical:
        'border-rose-200/80 bg-[linear-gradient(155deg,rgba(255,255,255,0.98)_0%,rgba(255,241,242,0.96)_48%,rgba(254,226,226,0.98)_100%)] dark:border-rose-900/60 dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.98)_0%,rgba(69,10,10,0.84)_100%)]',
    info: 'border-sky-200/80 bg-[linear-gradient(155deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.96)_48%,rgba(224,242,254,0.98)_100%)] dark:border-sky-900/60 dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.98)_0%,rgba(12,74,110,0.82)_100%)]',
    warning:
        'border-amber-200/80 bg-[linear-gradient(155deg,rgba(255,255,255,0.98)_0%,rgba(255,251,235,0.96)_48%,rgba(254,243,199,0.98)_100%)] dark:border-amber-900/60 dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.98)_0%,rgba(120,53,15,0.84)_100%)]',
};

const centerStatusClassNames: Record<CenterItem['status'], string> = {
    Available:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Full: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Inactive:
        'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
    'Near Full':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const centerStatusBarClassNames: Record<CenterItem['status'], string> = {
    Available: 'bg-emerald-500',
    Full: 'bg-rose-500',
    Inactive: 'bg-slate-400',
    'Near Full': 'bg-amber-500',
};

const centerStatusLabels: Record<CenterItem['status'], string> = {
    Available: 'OPEN',
    Full: 'FULL',
    Inactive: 'INACTIVE',
    'Near Full': 'NEAR FULL',
};

const summarySurfaceClassNames: Record<SummaryTone, string> = {
    amber: 'bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,251,235,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(120,53,15,0.64)_100%)]',
    emerald:
        'bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(236,253,245,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(6,78,59,0.64)_100%)]',
    orange: 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,247,237,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(124,45,18,0.64)_100%)]',
    rose: 'bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,241,242,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.98)_0%,rgba(127,29,29,0.64)_100%)]',
};

const summaryIconClassNames: Record<SummaryTone, string> = {
    amber: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
    emerald: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    orange: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
    rose: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
};

function formatCount(value: number): string {
    return value.toLocaleString();
}

function formatMoment(value: string | null): string {
    if (!value) {
        return 'Live now';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

function formatTimeOnly(value: string | null): string {
    if (!value) {
        return 'No scan yet';
    }

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function percentage(part: number, total: number): number {
    if (part <= 0 || total <= 0) {
        return 0;
    }

    return Math.round((part / total) * 100);
}

function severityLabel(
    severity: AlertItem['severity'],
): 'HIGH' | 'LOW' | 'MEDIUM' {
    if (severity === 'Critical') {
        return 'HIGH';
    }

    if (severity === 'Warning') {
        return 'MEDIUM';
    }

    return 'LOW';
}

function activityToneClassName(activity: ActivityItem): string {
    return activity.tone === 'amber'
        ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300'
        : activity.tone === 'emerald'
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
          : activity.tone === 'rose'
            ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
            : activity.tone === 'sky'
              ? 'bg-sky-500/12 text-sky-700 dark:text-sky-300'
              : 'bg-slate-500/12 text-slate-700 dark:text-slate-300';
}

function activityIcon(activityType: ActivityItem['type']): LucideIcon {
    if (activityType === 'Alert Issued') {
        return Siren;
    }

    if (activityType === 'Center Update') {
        return Building2;
    }

    if (activityType === 'New Registration') {
        return Plus;
    }

    return QrCode;
}

function mapStatusLabel(status: DashboardMapMarker['status']): string {
    return status === 'Available' ? 'Open' : status;
}

function pieChartStyle(
    segments: ReadonlyArray<{ color: string; value: number }>,
) {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return {
            background: 'conic-gradient(#cbd5e1 0deg 360deg)',
        };
    }

    let start = 0;
    const stops = segments.map((segment) => {
        const degrees = (segment.value / total) * 360;
        const stop = `${segment.color} ${start}deg ${start + degrees}deg`;

        start += degrees;

        return stop;
    });

    return {
        background: `conic-gradient(${stops.join(', ')})`,
    };
}

function SectionShell({
    action,
    children,
    description,
    title,
}: {
    action?: ReactNode;
    children: ReactNode;
    description: string;
    title: string;
}) {
    return (
        <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
                {action}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function SidebarSection({
    action,
    children,
    description,
    title,
}: {
    action?: ReactNode;
    children: ReactNode;
    description: string;
    title: string;
}) {
    return (
        <section className="rounded-[26px] border border-slate-200/70 bg-card p-4 shadow-sm md:p-5 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
                {action}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function SummaryCard({
    detail,
    icon: Icon,
    label,
    tone,
    value,
}: {
    detail: string;
    icon: LucideIcon;
    label: string;
    tone: SummaryTone;
    value: number;
}) {
    return (
        <div
            className={cn(
                'rounded-[28px] border border-slate-200/80 p-5 shadow-sm dark:border-slate-800',
                summarySurfaceClassNames[tone],
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                        {formatCount(value)}
                    </p>
                </div>
                <div
                    className={cn(
                        'rounded-2xl p-3 shadow-sm',
                        summaryIconClassNames[tone],
                    )}
                >
                    <Icon className="size-5" />
                </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {detail}
            </p>
        </div>
    );
}

function QuickActionCard({
    description,
    href,
    icon: Icon,
    title,
}: {
    description: string;
    href: RouteDefinition<'get'>;
    icon: LucideIcon;
    title: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white/85 px-4 py-3.5 shadow-sm transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700 dark:hover:bg-slate-950"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700 dark:bg-slate-50/5 dark:text-slate-200">
                <Icon className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-muted-foreground transition group-hover:bg-orange-500/10 group-hover:text-orange-700 dark:bg-slate-50/5 dark:group-hover:text-orange-300">
                <ArrowRight className="size-4" />
            </div>
        </Link>
    );
}

export default function Dashboard({ dashboard }: DashboardPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isCdrrmoAdmin = auth.user?.role === 'CDRRMO Admin';
    const isBarangayCommittee = auth.user?.role === 'Barangay Committee';
    const dashboardRoleLabel = auth.user?.role ?? 'Console User';
    const barangayName = auth.user?.barangay ?? null;
    const scopedBarangayMetrics =
        isBarangayCommittee && barangayName
            ? (dashboard.barangayMonitoring.find(
                  (barangay) => barangay.name === barangayName,
              ) ??
              dashboard.barangayMonitoring[0] ??
              null)
            : null;
    const pageTitle =
        isBarangayCommittee && barangayName
            ? `${barangayName} Barangay Dashboard`
            : isCdrrmoAdmin
              ? 'CDRRMO Command Dashboard'
              : 'Operations Dashboard';
    const heroBadge =
        isBarangayCommittee && barangayName
            ? `${barangayName} Barangay Committee`
            : dashboardRoleLabel;
    const heroTitle =
        isBarangayCommittee && barangayName
            ? 'Assigned barangay response view'
            : 'City-wide command and coordination view';
    const heroDescription =
        isBarangayCommittee && barangayName
            ? `Monitor incoming directives, household movement, and evacuation-center readiness for Barangay ${barangayName}.`
            : 'Coordinate barangays, review alerts, and monitor evacuation operations from the central command desk.';
    const monitoringSummary = dashboard.evacuationMonitoring.summary;
    const activeCenters = dashboard.evacuationCenters.centers.filter(
        (center) => center.isActive,
    );
    const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        const refreshInterval = window.setInterval(() => {
            router.reload({
                only: ['dashboard'],
            });
        }, 15000);

        return () => window.clearInterval(refreshInterval);
    }, []);

    const latestAlert = dashboard.latestAlert;
    const monitoringMapPoints = dashboard.mapMonitoring.markers.map(
        (marker) => ({
            latitude: marker.latitude,
            longitude: marker.longitude,
        }),
    );
    const previewHazards = dashboard.mapMonitoring.hazardAreas.slice(0, 2);
    const chartItems = [
        {
            color: '#10b981',
            label: 'Evacuated',
            toneClassName:
                'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
            value: monitoringSummary.evacuated,
        },
        {
            color: '#f59e0b',
            label: 'Not Yet',
            toneClassName:
                'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
            value: monitoringSummary.notYetEvacuated,
        },
        {
            color: '#f43f5e',
            label: 'Missing',
            toneClassName:
                'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
            value: monitoringSummary.missing,
        },
    ] as const;
    const totalMonitoredResidents = chartItems.reduce(
        (sum, item) => sum + item.value,
        0,
    );
    const summaryCards = isBarangayCommittee
        ? ([
              {
                  detail: 'Incoming active alerts and announcements for your assigned barangay.',
                  icon: Siren,
                  label: 'Received Alerts',
                  tone: 'rose' as const,
                  value: dashboard.alerts.length,
              },
              {
                  detail: 'Registered residents currently tracked inside your barangay scope.',
                  icon: UsersRound,
                  label: 'Residents In Scope',
                  tone: 'orange' as const,
                  value: scopedBarangayMetrics?.registeredResidents ?? 0,
              },
              {
                  detail:
                      monitoringSummary.evacuated === 0
                          ? 'No verified safe arrivals have been scanned yet.'
                          : 'Residents already checked in and accounted for in a center.',
                  icon: QrCode,
                  label: 'Evacuated',
                  tone: 'emerald' as const,
                  value: monitoringSummary.evacuated,
              },
              {
                  detail: 'Active evacuation centers currently available inside your assignment.',
                  icon: Building2,
                  label: 'Ready Centers',
                  tone: 'amber' as const,
                  value: dashboard.evacuationCenters.summary.active,
              },
          ] as const)
        : ([
              {
                  detail:
                      monitoringSummary.evacuated === 0
                          ? 'No verified safe arrivals have been scanned yet.'
                          : 'Residents already checked in and accounted for in a center.',
                  icon: QrCode,
                  label: 'Evacuated',
                  tone: 'emerald' as const,
                  value: monitoringSummary.evacuated,
              },
              {
                  detail: 'Registered residents still waiting for a safe-arrival scan.',
                  icon: Clock3,
                  label: 'Not Yet',
                  tone: 'amber' as const,
                  value: monitoringSummary.notYetEvacuated,
              },
              {
                  detail: 'High-risk residents with no recorded scan yet need follow-up.',
                  icon: TriangleAlert,
                  label: 'Missing',
                  tone: 'rose' as const,
                  value: monitoringSummary.missing,
              },
              {
                  detail: 'Active evacuation centers currently available across the response network.',
                  icon: Building2,
                  label: 'Centers',
                  tone: 'orange' as const,
                  value: dashboard.evacuationCenters.summary.active,
              },
          ] as const);
    const quickActions = isBarangayCommittee
        ? [
              {
                  description:
                      'Monitor scans and local household accountability.',
                  href: evacuationMonitoringRoute(),
                  icon: QrCode,
                  title: 'Track Evacuees',
              },
              {
                  description: 'Update resident records and household status.',
                  href: householdManagementRoute(),
                  icon: Plus,
                  title: 'Update Households',
              },
              {
                  description: 'Review the latest alerts from command.',
                  href: alertsNotificationsRoute(),
                  icon: Megaphone,
                  title: 'View Alerts',
              },
          ]
        : [
              {
                  description:
                      'Check scan gaps and recent safe-arrival updates.',
                  href: evacuationMonitoringRoute(),
                  icon: QrCode,
                  title: 'Review Accountability',
              },
              {
                  description:
                      'Review center load and barangay density on the map.',
                  href: mapMonitoringRoute(),
                  icon: MapPinned,
                  title: 'Open Map',
              },
              {
                  description: 'Send city-wide notices to barangay committees.',
                  href: alertsNotificationsRoute(),
                  icon: Megaphone,
                  title: 'Broadcast Alerts',
              },
          ];

    function playAlertAudio(alert: AlertItem): void {
        if (typeof window === 'undefined') {
            return;
        }

        if (alert.audioUrl) {
            window.open(alert.audioUrl, '_blank', 'noopener');

            return;
        }

        if (!('speechSynthesis' in window)) {
            return;
        }

        if (playingAlertId === alert.id) {
            window.speechSynthesis.cancel();
            setPlayingAlertId(null);

            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(
            `${alert.label}. ${alert.message}`,
        );

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
            setPlayingAlertId((currentAlertId) =>
                currentAlertId === alert.id ? null : currentAlertId,
            );
        };
        utterance.onerror = () => {
            setPlayingAlertId((currentAlertId) =>
                currentAlertId === alert.id ? null : currentAlertId,
            );
        };

        setPlayingAlertId(alert.id);
        window.speechSynthesis.speak(utterance);
    }

    return (
        <>
            <Head title={pageTitle} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_22%),linear-gradient(140deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_48%,rgba(255,247,237,0.98)_100%)] p-6 shadow-sm md:p-7 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_22%),linear-gradient(140deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.96)_48%,rgba(124,45,18,0.54)_100%)]">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-orange-700 uppercase dark:text-orange-300">
                                {heroBadge}
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                {heroTitle}
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                                {heroDescription}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Logged In
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {dashboard.command.adminName}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {dashboardRoleLabel}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Monitoring Date
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {dashboard.command.dateLabel}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Registered Today
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {formatCount(
                                        dashboard.command.registrationsToday,
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    New household
                                    {dashboard.command.registrationsToday === 1
                                        ? ''
                                        : 's'}{' '}
                                    added today
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                    Assigned Scope
                                </p>
                                <p className="mt-2 text-lg font-semibold text-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? barangayName
                                        : 'All operational barangays'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <SummaryCard
                            key={card.label}
                            detail={card.detail}
                            icon={card.icon}
                            label={card.label}
                            tone={card.tone}
                            value={card.value}
                        />
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <div
                        className={cn(
                            'rounded-[30px] border p-5 shadow-sm md:p-6 dark:border-slate-800',
                            latestAlert
                                ? alertSurfaceClassNames[latestAlert.tone]
                                : 'border-slate-200/70 bg-card',
                        )}
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.22em] uppercase opacity-80">
                                    Alerts with Audio
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                    Immediate action panel
                                </h2>
                                <p className="mt-2 text-sm leading-6 opacity-85">
                                    Prioritize the latest warning first, then
                                    use the audio button for quick spoken
                                    playback.
                                </p>
                            </div>

                            {latestAlert ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full border-current/20 bg-white/70 text-current hover:bg-white/90 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
                                    onClick={() => playAlertAudio(latestAlert)}
                                >
                                    <Play className="size-4" />
                                    {playingAlertId === latestAlert.id
                                        ? 'Stop Audio'
                                        : 'Play Audio'}
                                </Button>
                            ) : null}
                        </div>

                        {latestAlert ? (
                            <>
                                <div className="mt-6 rounded-[28px] border border-current/12 bg-white/70 p-5 dark:bg-slate-950/35">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex rounded-full border border-current/10 bg-white/60 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase dark:bg-slate-950/40">
                                            Severity:{' '}
                                            {severityLabel(
                                                latestAlert.severity,
                                            )}
                                        </span>
                                        <span className="inline-flex rounded-full border border-current/10 bg-white/60 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase dark:bg-slate-950/40">
                                            Time:{' '}
                                            {formatTimeOnly(
                                                latestAlert.reportedAt,
                                            )}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                                        {latestAlert.affectedBarangay
                                            ? `${latestAlert.label} - Brgy. ${latestAlert.affectedBarangay}`
                                            : latestAlert.label}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 opacity-90">
                                        {latestAlert.message}
                                    </p>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-[22px] border border-current/10 bg-white/60 px-4 py-4 dark:bg-slate-950/35">
                                        <p className="text-xs tracking-[0.18em] uppercase opacity-70">
                                            Barangay
                                        </p>
                                        <p className="mt-2 font-semibold">
                                            {latestAlert.affectedBarangay ??
                                                'All barangays'}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-current/10 bg-white/60 px-4 py-4 dark:bg-slate-950/35">
                                        <p className="text-xs tracking-[0.18em] uppercase opacity-70">
                                            Response Tone
                                        </p>
                                        <p className="mt-2 font-semibold">
                                            {latestAlert.severity}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-current/10 bg-white/60 px-4 py-4 dark:bg-slate-950/35">
                                        <p className="text-xs tracking-[0.18em] uppercase opacity-70">
                                            Last Update
                                        </p>
                                        <p className="mt-2 font-semibold">
                                            {formatMoment(
                                                latestAlert.reportedAt,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                No active alerts right now.
                            </div>
                        )}
                    </div>

                    <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                                    Map Snapshot
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                    Live center snapshot
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Shared monitoring imagery is back on the
                                    dashboard so command can spot center
                                    pressure at a glance before opening the full
                                    monitoring page.
                                </p>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full"
                            >
                                <Link href={mapMonitoringRoute()}>
                                    Open Monitoring Page
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-100/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="relative h-full min-h-[268px] overflow-hidden rounded-[24px] border border-white/50 dark:border-slate-800/80">
                                    <MapboxStaticMap
                                        points={monitoringMapPoints}
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_26%)]" />

                                    {previewHazards.map((hazard) => (
                                        <div
                                            key={hazard.id}
                                            className={cn(
                                                'absolute -translate-x-1/2 -translate-y-1/2 rounded-[28px] border backdrop-blur-[2px]',
                                                hazard.tone === 'amber' &&
                                                    'border-amber-200/70 bg-amber-100/35 dark:border-amber-900/50 dark:bg-amber-500/10',
                                                hazard.tone === 'blue' &&
                                                    'border-blue-200/70 bg-blue-100/35 dark:border-blue-900/50 dark:bg-blue-500/10',
                                                hazard.tone === 'sky' &&
                                                    'border-sky-200/70 bg-sky-100/35 dark:border-sky-900/50 dark:bg-sky-500/10',
                                            )}
                                            style={{
                                                height: `${hazard.height}%`,
                                                left: `${hazard.x}%`,
                                                top: `${hazard.y}%`,
                                                width: `${hazard.width}%`,
                                            }}
                                        />
                                    ))}

                                    {dashboard.mapMonitoring.markers.map(
                                        (marker) => (
                                            <div
                                                key={marker.id}
                                                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                                                style={{
                                                    left: `${marker.x}%`,
                                                    top: `${marker.y}%`,
                                                }}
                                            >
                                                <div className="rounded-full border border-white/70 bg-white/92 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'size-2.5 rounded-full',
                                                                marker.status ===
                                                                    'Available' &&
                                                                    'bg-emerald-500',
                                                                marker.status ===
                                                                    'Near Full' &&
                                                                    'bg-amber-500',
                                                                marker.status ===
                                                                    'Full' &&
                                                                    'bg-rose-500',
                                                            )}
                                                        />
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {marker.barangay}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                        {mapStatusLabel(
                                                            marker.status,
                                                        )}{' '}
                                                        •{' '}
                                                        {formatCount(
                                                            marker.availableSlots,
                                                        )}{' '}
                                                        slots left
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}

                                    <div className="absolute bottom-4 left-4 max-w-xs rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/90">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Shared Mapbox Preview
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">
                                            {formatCount(
                                                dashboard.mapMonitoring.markers
                                                    .length,
                                            )}{' '}
                                            center markers ready for quick
                                            review
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {dashboard.mapMonitoring.meta.note}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 text-left sm:grid-cols-3">
                                <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Open
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">
                                        {formatCount(
                                            dashboard.mapMonitoring.summary
                                                .open,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Near Full
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">
                                        {formatCount(
                                            dashboard.mapMonitoring.summary
                                                .nearFull,
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Full
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">
                                        {formatCount(
                                            dashboard.mapMonitoring.summary
                                                .full,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>

                <SectionShell
                    title="Evacuation Center Status"
                    description="See which centers are open, nearing capacity, or already full so routing decisions stay simple and fast."
                >
                    {activeCenters.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            No active evacuation centers are listed yet.
                        </div>
                    ) : (
                        <div className="grid gap-3 xl:grid-cols-2">
                            {activeCenters.map((center) => (
                                <div
                                    key={center.name}
                                    className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-lg font-semibold text-foreground">
                                                    {center.name}
                                                </p>
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase',
                                                        centerStatusClassNames[
                                                            center.status
                                                        ],
                                                    )}
                                                >
                                                    {
                                                        centerStatusLabels[
                                                            center.status
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Barangay {center.barangay}
                                            </p>
                                        </div>

                                        <p className="text-2xl font-semibold text-foreground">
                                            {formatCount(center.occupied)} /{' '}
                                            {formatCount(center.capacity)}
                                        </p>
                                    </div>

                                    <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className={cn(
                                                'h-3 rounded-full',
                                                centerStatusBarClassNames[
                                                    center.status
                                                ],
                                            )}
                                            style={{
                                                width: `${percentage(
                                                    center.occupied,
                                                    center.capacity,
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                        <span>{center.detail}</span>
                                        <span>
                                            {formatCount(
                                                Math.max(
                                                    center.capacity -
                                                        center.occupied,
                                                    0,
                                                ),
                                            )}{' '}
                                            slots left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionShell>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_360px]">
                    <SectionShell
                        title="Live Activity Feed"
                        description={
                            isBarangayCommittee
                                ? 'Recent scans, registrations, and incoming alert activity for your assigned barangay.'
                                : 'Recent scans, registrations, and broadcast activity from the city-wide command desk.'
                        }
                    >
                        {dashboard.liveActivity.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                No live activity has been recorded yet.
                            </div>
                        ) : (
                            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                                {dashboard.liveActivity.map((activity) => {
                                    const ActivityIcon = activityIcon(
                                        activity.type,
                                    );

                                    return (
                                        <div
                                            key={activity.id}
                                            className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'rounded-2xl p-3',
                                                        activityToneClassName(
                                                            activity,
                                                        ),
                                                    )}
                                                >
                                                    <ActivityIcon className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                                {activity.type}
                                                            </p>
                                                            <p className="mt-1 text-lg font-semibold text-foreground">
                                                                {activity.title}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatMoment(
                                                                activity.timestamp,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                                        {activity.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionShell>

                    <div className="space-y-4">
                        <SidebarSection
                            title="Quick Actions"
                            description={
                                isBarangayCommittee
                                    ? 'Fast links for the tools you use most in your barangay.'
                                    : 'Fast links for the command tools used most.'
                            }
                        >
                            <div className="space-y-3">
                                {quickActions.map((action) => (
                                    <QuickActionCard
                                        key={action.title}
                                        description={action.description}
                                        href={action.href}
                                        icon={action.icon}
                                        title={action.title}
                                    />
                                ))}
                            </div>
                        </SidebarSection>

                        <SidebarSection
                            title="Evacuation Status"
                            description={
                                isBarangayCommittee
                                    ? 'Compact view of resident accountability inside your barangay.'
                                    : 'Compact view of resident accountability across the city.'
                            }
                            action={
                                <div className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground dark:border-slate-800 dark:bg-slate-950/70">
                                    <span className="font-semibold text-foreground">
                                        {formatCount(totalMonitoredResidents)}
                                    </span>{' '}
                                    residents
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                                    <div
                                        className="relative flex size-40 items-center justify-center rounded-full"
                                        style={pieChartStyle(chartItems)}
                                    >
                                        <div className="flex size-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner ring-1 ring-slate-200/80 dark:ring-slate-800">
                                            <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                In Scope
                                            </span>
                                            <span className="mt-1 text-2xl font-semibold text-foreground">
                                                {formatCount(
                                                    totalMonitoredResidents,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Residents being monitored right now.
                                    </p>
                                </div>

                                <div className="space-y-2.5">
                                    {chartItems.map((item) => {
                                        const itemShare = percentage(
                                            item.value,
                                            totalMonitoredResidents,
                                        );

                                        return (
                                            <div
                                                key={item.label}
                                                className="rounded-[18px] border border-slate-200/80 bg-white/80 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="size-2.5 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-baseline gap-2">
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {item.label}
                                                                </p>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {itemShare}%
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {formatCount(
                                                                    item.value,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                                                            <div
                                                                className="h-1.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.color,
                                                                    width: `${itemShare}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </SidebarSection>
                    </div>
                </section>

                <section className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                    {isBarangayCommittee
                        ? 'Incoming CDRRMO broadcasts refresh automatically in this dashboard. Audio playback uses browser text-to-speech when a recorded alert file is not available yet.'
                        : 'City-wide broadcasts refresh automatically in this dashboard. Audio playback uses browser text-to-speech when a recorded alert file is not available yet.'}
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboardRoute(),
        },
    ],
};
