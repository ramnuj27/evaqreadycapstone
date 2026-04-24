import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    ArrowRight,
    BellRing,
    Building2,
    LayoutGrid,
    MapPinned,
    ShieldAlert,
    Siren,
    TriangleAlert,
    UserCog,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    alertsNotifications,
    evacuationCenters,
    householdManagement,
    mapMonitoring,
    reportsAnalytics,
    userManagement,
} from '@/routes';

export type HazardZoneKey =
    | 'flood-prone'
    | 'coastal'
    | 'landslide'
    | 'safe-zone';
export type BarangayStatus = 'Safe' | 'At Risk' | 'Evacuating';
export type AlertTone = 'info' | 'warning' | 'critical';
export type AlertSeverity = 'Info' | 'Warning' | 'Critical';
export type CenterStatus = 'Available' | 'Near Full' | 'Full' | 'Inactive';
export type MapCenterStatus = 'Available' | 'Near Full' | 'Full';
export type EvacuationMonitoringStatus =
    | 'Evacuated'
    | 'Not Yet Evacuated'
    | 'Missing';
export type EvacuationSyncStatus = 'Pending Sync' | 'Synced';
export type AlertItem = {
    affectedBarangay: string | null;
    audioUrl: string | null;
    id: string;
    label: string;
    message: string;
    reportedAt: string | null;
    severity: AlertSeverity;
    tone: AlertTone;
};
export type LiveActivityTone = 'amber' | 'emerald' | 'rose' | 'sky' | 'slate';
export type LiveActivityItem = {
    detail: string;
    id: string;
    timestamp: string | null;
    title: string;
    tone: LiveActivityTone;
    type:
        | 'Alert Issued'
        | 'Center Update'
        | 'New Registration'
        | 'Scanned Evacuee';
};

export type ConsoleDashboard = {
    alerts: AlertItem[];
    analytics: {
        ageGroups: Array<{ detail: string; key: 'children' | 'adults' | 'seniors'; label: string; total: number }>;
        gender: Array<{ key: 'male' | 'female'; label: string; total: number }>;
        vulnerableGroups: Array<{ detail: string; key: 'pwd' | 'pregnant' | 'senior' | 'children'; label: string; total: number }>;
    };
    barangayMonitoring: Array<{
        atRiskResidents: number;
        checkedInEvacuees: number;
        coveragePercent: number;
        households: number;
        name: string;
        registeredResidents: number;
        riskLabel: string;
        status: BarangayStatus;
    }>;
    command: {
        adminName: string;
        dateLabel: string;
        registrationsToday: number;
        status: string;
        subtitle: string;
    };
    evacuationCenters: {
        actions: {
            canManageCenters: boolean;
        };
        centers: Array<{ barangay: string; capacity: number; detail: string; id: number | null; isActive: boolean; name: string; occupied: number; status: CenterStatus }>;
        options: {
            barangays: string[];
        };
        prototype: boolean;
        summary: { active: number; available: number; capacity: number; inactive: number; occupied: number; total: number };
    };
    mapMonitoring: {
        filters: {
            barangays: string[];
            statuses: MapCenterStatus[];
        };
        hazardAreas: Array<{
            barangays: string[];
            description: string;
            height: number;
            id: string;
            key: HazardZoneKey;
            label: string;
            tone: 'amber' | 'blue' | 'sky';
            total: number;
            width: number;
            x: number;
            y: number;
        }>;
        legend: Array<{
            label: string;
            status: MapCenterStatus;
        }>;
        markers: Array<{
            availableSlots: number;
            barangay: string;
            capacity: number;
            currentEvacuees: number;
            id: string;
            imageLabel: string;
            latitude: number;
            longitude: number;
            name: string;
            note: string;
            status: MapCenterStatus;
            x: number;
            y: number;
        }>;
        meta: {
            note: string;
            supportsDirections: boolean;
            supportsGeolocation: boolean;
        };
        summary: {
            full: number;
            nearFull: number;
            open: number;
            total: number;
        };
    };
    evacuationMonitoring: {
        filters: {
            barangays: string[];
            centers: string[];
            statuses: EvacuationMonitoringStatus[];
        };
        meta: {
            note: string;
            offlineMode: boolean;
            scannerConnected: boolean;
        };
        rows: Array<{
            barangay: string;
            evacuationCenter: string | null;
            gender: string;
            hazardZone: HazardZoneKey;
            household: string;
            householdCode: string;
            id: string;
            lastScan: string | null;
            name: string;
            note: string;
            qrReference: string;
            recordedAt: string | null;
            role: string;
            status: EvacuationMonitoringStatus;
            syncStatus: EvacuationSyncStatus;
            timeIn: string | null;
            timeOut: string | null;
        }>;
        summary: {
            evacuated: number;
            missing: number;
            notYetEvacuated: number;
        };
    };
    hazardBreakdown: Array<{ detail: string; key: HazardZoneKey; label: string; total: number }>;
    latestAlert: AlertItem | null;
    liveActivity: LiveActivityItem[];
    mapPanel: {
        densityLeaders: Array<{ atRiskResidents: number; name: string; status: BarangayStatus }>;
        note: string;
        prototype: boolean;
    };
    overview: {
        capacity: { available: number; detail: string; isPrototype: boolean; occupied: number; total: number };
        centers: { active: number; detail: string; inactive: number; isPrototype: boolean; total: number };
        checkedInDetail: string;
        checkedInEvacuees: number;
        checkedInIsPrototype: boolean;
        coverage: { coveredBarangays: number; percent: number; totalBarangays: number };
        registeredResidents: number;
    };
    summary: {
        activeCenters: { detail: string; total: number };
        evacuatedSafe: { detail: string; total: number };
        missingUnaccounted: { detail: string; total: number };
        notYetEvacuated: { detail: string; total: number };
    };
    recentHouseholds: Array<{ barangay: string; created_at: string | null; hazard_zone: HazardZoneKey; head_name: string; household_code: string; id: number; name: string; total_members: number }>;
    userSummary: {
        manageUsersAvailable: boolean;
        roles: Array<{ detail: string; key: string; label: string; total: number | null }>;
        rolesConfigured: boolean;
        totalUsers: number;
    };
};

export type DashboardPageProps = { dashboard: ConsoleDashboard };

const vulnerabilityIcons: Record<
    ConsoleDashboard['analytics']['vulnerableGroups'][number]['key'],
    LucideIcon
> = {
    children: UsersRound,
    pregnant: BellRing,
    pwd: ShieldAlert,
    senior: UserRound,
};

const statusClassNames: Record<BarangayStatus, string> = {
    'At Risk':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Evacuating:
        'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Safe: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
};

const centerStatusClassNames: Record<CenterStatus, string> = {
    Available:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Full: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Inactive:
        'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
    'Near Full':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const alertToneClassNames: Record<AlertTone, string> = {
    critical:
        'border-rose-200/70 bg-rose-50/80 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100',
    info: 'border-sky-200/70 bg-sky-50/80 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100',
    warning:
        'border-amber-200/70 bg-amber-50/80 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
};

const mapMarkerPositions: Record<HazardZoneKey, string> = {
    coastal: 'left-[72%] top-[36%]',
    'flood-prone': 'left-[16%] top-[28%]',
    landslide: 'left-[44%] top-[20%]',
    'safe-zone': 'left-[42%] top-[63%]',
};

const centerMarkerPositions = [
    'left-[26%] top-[68%]',
    'left-[58%] top-[28%]',
    'left-[76%] top-[58%]',
    'left-[34%] top-[38%]',
] as const;

export function formatNumber(value: number | null): string {
    return value === null ? 'Pending' : value.toLocaleString();
}

export function formatDate(value: string | null): string {
    if (!value) {
        return 'Just now';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

export function niceValue(value: string): string {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function percentage(part: number, total: number): number {
    if (part <= 0 || total <= 0) {
        return 0;
    }

    return Math.round((part / total) * 100);
}

function SectionHeader({
    badge,
    description,
    title,
}: {
    badge: string;
    description: string;
    title: string;
}) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-orange-600 uppercase">
                {badge}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export function DashboardModuleCards({ dashboard }: DashboardPageProps) {
    const residentHouseholds =
        dashboard.userSummary.roles.find((role) => role.key === 'resident')
            ?.total ?? 0;

    const cards = [
        {
            description: 'Map hazard zones, evacuation centers, and area density in one command view.',
            href: mapMonitoring(),
            icon: MapPinned,
            iconClassName: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
            metric: `${formatNumber(dashboard.hazardBreakdown.length)} hazard groups`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(240,253,250,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'Map Monitoring',
        },
        {
            description: 'Review registered households, family members, and record status in one registry page.',
            href: householdManagement(),
            icon: LayoutGrid,
            iconClassName: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
            metric: `${formatNumber(residentHouseholds)} household${residentHouseholds === 1 ? '' : 's'}`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(239,246,255,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'Household Management',
        },
        {
            description: 'Focus on sex, age-group, and vulnerable-group analytics outside the dashboard.',
            href: reportsAnalytics(),
            icon: Activity,
            iconClassName: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
            metric: `${formatNumber(dashboard.analytics.vulnerableGroups.length)} analytics groups`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,247,237,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'Reports & Analytics',
        },
        {
            description: 'Monitor center status, capacity, and operational readiness in one place.',
            href: evacuationCenters(),
            icon: Building2,
            iconClassName: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
            metric: `${formatNumber(dashboard.evacuationCenters.summary.active)} active centers`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(240,253,250,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'Evacuation Centers',
        },
        {
            description: 'Track alerts, announcements, and emergency updates in a dedicated feed.',
            href: alertsNotifications(),
            icon: Siren,
            iconClassName: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
            metric: `${formatNumber(dashboard.alerts.length)} current alerts`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,241,242,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'Alerts & Announcements',
        },
        {
            description: 'Review resident, operator, and admin account summaries and registration activity.',
            href: userManagement(),
            icon: UserCog,
            iconClassName: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
            metric: `${formatNumber(dashboard.userSummary.totalUsers)} users`,
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(245,243,255,0.92)_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.94)_100%)]',
            title: 'User Management',
        },
    ] as const;

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <Link
                        key={card.title}
                        href={card.href}
                        className={cn(
                            'group rounded-[30px] border border-slate-200/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-slate-800',
                            card.surfaceClassName,
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div
                                className={cn(
                                    'rounded-2xl p-3 shadow-sm',
                                    card.iconClassName,
                                )}
                            >
                                <Icon className="size-5" />
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                        </div>
                        <p className="mt-6 text-lg font-semibold text-foreground">
                            {card.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {card.description}
                        </p>
                        <p className="mt-5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {card.metric}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
}

export function EvacueeAnalyticsPanel({ dashboard }: DashboardPageProps) {
    const maleResidents =
        dashboard.analytics.gender.find((item) => item.key === 'male')?.total ??
        0;
    const femaleResidents =
        dashboard.analytics.gender.find((item) => item.key === 'female')
            ?.total ?? 0;
    const genderTotal = maleResidents + femaleResidents;
    const maleAngle = percentage(maleResidents, genderTotal) * 3.6;
    const maxAgeGroup = Math.max(
        ...dashboard.analytics.ageGroups.map((group) => group.total),
        1,
    );
    const genderRingStyle =
        genderTotal === 0
            ? { background: 'conic-gradient(#e2e8f0 0deg 360deg)' }
            : {
                  background: `conic-gradient(#0ea5e9 0deg ${maleAngle}deg, #f97316 ${maleAngle}deg 360deg)`,
              };

    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <SectionHeader
                badge="Reports & Analytics"
                title="Resident composition and vulnerable groups"
                description="These charts are better placed here so the dashboard stays focused on overview while analytics stay easy to read."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-sm font-semibold text-foreground">
                        Male vs Female
                    </p>
                    <div className="mt-5 flex items-center justify-center">
                        <div
                            className="relative flex size-48 items-center justify-center rounded-full"
                            style={genderRingStyle}
                        >
                            <div className="flex size-32 flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
                                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Recorded Sex
                                </span>
                                <span className="mt-2 text-3xl font-semibold text-foreground">
                                    {formatNumber(genderTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 space-y-3">
                        {dashboard.analytics.gender.map((item) => (
                            <div
                                key={item.key}
                                className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {percentage(item.total, genderTotal)}%
                                            of recorded sex data
                                        </p>
                                    </div>
                                    <span className="text-2xl font-semibold text-foreground">
                                        {formatNumber(item.total)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2">
                            <UsersRound className="size-4 text-orange-600" />
                            <p className="text-sm font-semibold text-foreground">
                                Children / Adults / Seniors
                            </p>
                        </div>
                        <div className="mt-5 space-y-4">
                            {dashboard.analytics.ageGroups.map((group) => (
                                <div key={group.key}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {group.label}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {group.detail}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-semibold text-foreground">
                                            {formatNumber(group.total)}
                                        </span>
                                    </div>
                                    <div className="mt-3 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className={cn(
                                                'h-2.5 rounded-full',
                                                group.key === 'children' &&
                                                    'bg-gradient-to-r from-cyan-500 to-sky-400',
                                                group.key === 'adults' &&
                                                    'bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400',
                                                group.key === 'seniors' &&
                                                    'bg-gradient-to-r from-orange-500 to-amber-400',
                                            )}
                                            style={{
                                                width: `${Math.max(
                                                    percentage(group.total, maxAgeGroup),
                                                    group.total > 0 ? 12 : 0,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="size-4 text-orange-600" />
                            <p className="text-sm font-semibold text-foreground">
                                Vulnerable Groups
                            </p>
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {dashboard.analytics.vulnerableGroups.map((group) => {
                                const Icon = vulnerabilityIcons[group.key];

                                return (
                                    <div
                                        key={group.key}
                                        className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-600">
                                                <Icon className="size-5" />
                                            </div>
                                            <span className="text-2xl font-semibold text-foreground">
                                                {formatNumber(group.total)}
                                            </span>
                                        </div>
                                        <p className="mt-4 font-semibold text-foreground">
                                            {group.label}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {group.detail}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MapMonitoringPanel({ dashboard }: DashboardPageProps) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <SectionHeader
                badge="Map Monitoring"
                title="Hazards, centers, and area density"
                description="The map panel now lives here so location-based monitoring has its own space instead of competing with overview cards."
            />

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,0.18),transparent_22%),radial-gradient(circle_at_80%_22%,rgba(249,115,22,0.18),transparent_22%),radial-gradient(circle_at_40%_72%,rgba(16,185,129,0.18),transparent_22%),linear-gradient(150deg,#e2e8f0_0%,#f8fafc_48%,#eff6ff_100%)] p-5 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,0.18),transparent_22%),radial-gradient(circle_at_80%_22%,rgba(249,115,22,0.18),transparent_22%),radial-gradient(circle_at_40%_72%,rgba(16,185,129,0.18),transparent_22%),linear-gradient(150deg,#0f172a_0%,#111827_48%,#0f172a_100%)]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px]" />

                    <div className="absolute right-5 top-5 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
                        <p className="font-semibold">Hazard & Center Layers</p>
                        <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {dashboard.mapPanel.note}
                        </p>
                    </div>

                    {dashboard.hazardBreakdown.map((zone) => (
                        <div
                            key={zone.key}
                            className={cn(
                                'absolute flex min-w-[138px] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-[22px] border border-white/60 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/75',
                                mapMarkerPositions[zone.key],
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-foreground">
                                    {zone.label}
                                </p>
                                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                                    {formatNumber(zone.total)}
                                </span>
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">
                                {zone.detail}
                            </p>
                        </div>
                    ))}

                    {dashboard.evacuationCenters.centers.map((center, index) => (
                        <div
                            key={center.name}
                            className={cn(
                                'absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200',
                                centerMarkerPositions[
                                    index % centerMarkerPositions.length
                                ],
                            )}
                        >
                            <span
                                className={cn(
                                    'size-2.5 rounded-full',
                                    center.status === 'Available' &&
                                        'bg-emerald-500',
                                    center.status === 'Near Full' &&
                                        'bg-amber-500',
                                    center.status === 'Full' && 'bg-rose-500',
                                    center.status === 'Inactive' &&
                                        'bg-slate-400',
                                )}
                            />
                            {center.barangay}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2">
                            <TriangleAlert className="size-4 text-orange-600" />
                            <p className="font-semibold text-foreground">
                                Density Leaders
                            </p>
                        </div>
                        <div className="mt-4 space-y-3">
                            {dashboard.mapPanel.densityLeaders.map((barangay) => (
                                <div
                                    key={barangay.name}
                                    className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {barangay.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatNumber(barangay.atRiskResidents)} at-risk residents
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-1 text-xs font-semibold',
                                                statusClassNames[barangay.status],
                                            )}
                                        >
                                            {barangay.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BarangayMonitoringPanel({ dashboard }: DashboardPageProps) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <SectionHeader
                badge="Barangay Management"
                title="All 27 barangays in one response view"
                description="The detailed barangay table has been moved out of the dashboard so this page can focus fully on community-level monitoring."
            />

            <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800">
                <div className="grid grid-cols-[1.35fr_0.8fr_0.8fr_0.85fr_1fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase dark:bg-slate-900">
                    <span>Barangay</span>
                    <span>Evacuees</span>
                    <span>Residents</span>
                    <span>Risk</span>
                    <span>Status</span>
                </div>

                <div className="max-h-[680px] divide-y divide-slate-200/80 overflow-y-auto dark:divide-slate-800">
                    {dashboard.barangayMonitoring.map((barangay) => (
                        <div
                            key={barangay.name}
                            className="grid grid-cols-[1.35fr_0.8fr_0.8fr_0.85fr_1fr] gap-3 px-4 py-4"
                        >
                            <div>
                                <p className="font-semibold text-foreground">
                                    {barangay.name}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {formatNumber(barangay.households)} household
                                    {barangay.households === 1 ? '' : 's'}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    {formatNumber(barangay.checkedInEvacuees)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Scanner feed pending
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    {formatNumber(barangay.registeredResidents)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {formatNumber(barangay.atRiskResidents)} at risk
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    {barangay.riskLabel}
                                </p>
                                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                                    <div
                                        className={cn(
                                            'h-2 rounded-full',
                                            barangay.riskLabel === 'High' &&
                                                'bg-rose-500',
                                            barangay.riskLabel === 'Moderate' &&
                                                'bg-amber-500',
                                            barangay.riskLabel === 'Low' &&
                                                'bg-sky-500',
                                            barangay.riskLabel === 'Clear' &&
                                                'bg-emerald-500',
                                        )}
                                        style={{
                                            width: `${barangay.coveragePercent}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-semibold',
                                        statusClassNames[barangay.status],
                                    )}
                                >
                                    {barangay.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AlertsPanel({ dashboard }: DashboardPageProps) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
                <SectionHeader
                    badge="Alerts & Announcements"
                    title="Operational signals for command staff"
                    description="Alerts have been moved here so warnings, announcements, and response updates are easy to track in one place."
                />
                <Siren className="size-5 text-orange-600" />
            </div>
            <div className="mt-6 space-y-3">
                {dashboard.alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={cn(
                            'rounded-[24px] border p-4',
                            alertToneClassNames[alert.tone],
                        )}
                    >
                        <p className="text-sm font-semibold tracking-[0.16em] uppercase">
                            {alert.label}
                        </p>
                        <p className="mt-3 text-sm leading-6">
                            {alert.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function UserManagementPanel({
    dashboard,
    showManageButton = true,
}: DashboardPageProps & { showManageButton?: boolean }) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
                <SectionHeader
                    badge="User Management"
                    title="Current access and role summary"
                    description="The user summary now lives here with resident activity so account administration is no longer mixed into the dashboard."
                />
                <UserCog className="size-5 text-orange-600" />
            </div>

            <div className="mt-6 rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-sm text-muted-foreground">
                    Total authenticated users
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                    {formatNumber(dashboard.userSummary.totalUsers)}
                </p>
            </div>

            <div className="mt-4 space-y-3">
                {dashboard.userSummary.roles.map((role) => (
                    <div
                        key={role.key}
                        className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-foreground">
                                {role.label}
                            </p>
                            <span className="text-xl font-semibold text-foreground">
                                {formatNumber(role.total)}
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {role.detail}
                        </p>
                    </div>
                ))}
            </div>

            {showManageButton ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                    Role-specific add and edit actions will be enabled here once
                    barangay admin and operator account modules are added.
                </div>
            ) : null}
        </div>
    );
}

export function RecentHouseholdsPanel({ dashboard }: DashboardPageProps) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <SectionHeader
                badge="Resident Activity"
                title="Latest registry activity"
                description="Recent household registrations fit better under user management because they reflect resident onboarding and validation work."
            />

            <div className="mt-6 space-y-3">
                {dashboard.recentHouseholds.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                        No household registrations yet. Once families register,
                        their barangay, hazard zone, and household size will
                        appear here.
                    </div>
                ) : (
                    dashboard.recentHouseholds.map((household) => (
                        <div
                            key={household.id}
                            className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-foreground">
                                            {household.name}
                                        </p>
                                        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                                            {household.household_code}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Head of household: {household.head_name}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                        {household.barangay}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                        {niceValue(household.hazard_zone)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Household Size
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatNumber(household.total_members)} residents
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Registered
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {formatDate(household.created_at)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Command Note
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        Ready for QR validation
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function EvacuationCentersPanel({ dashboard }: DashboardPageProps) {
    return (
        <div className="rounded-[30px] border border-slate-200/70 bg-card p-6 shadow-sm dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    badge="Evacuation Centers"
                    title="Capacity, occupancy, and site readiness"
                    description="The center roster has been moved here so capacity monitoring is easier to focus on and manage."
                />
                {dashboard.evacuationCenters.prototype ? (
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-orange-700 uppercase dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                        Prototype
                    </span>
                ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-sm text-muted-foreground">Active centers</p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                        {formatNumber(dashboard.evacuationCenters.summary.active)}
                    </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-sm text-muted-foreground">Available capacity</p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                        {formatNumber(dashboard.evacuationCenters.summary.available)}
                    </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-sm text-muted-foreground">Occupied capacity</p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                        {formatNumber(dashboard.evacuationCenters.summary.occupied)}
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {dashboard.evacuationCenters.centers.map((center) => (
                    <div
                        key={center.name}
                        className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-lg font-semibold text-foreground">
                                        {center.name}
                                    </p>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-semibold',
                                            centerStatusClassNames[center.status],
                                        )}
                                    >
                                        {center.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {center.barangay}
                                </p>
                            </div>
                            <div className="text-left lg:text-right">
                                <p className="text-sm text-muted-foreground">
                                    Capacity
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-foreground">
                                    {formatNumber(center.occupied)} / {formatNumber(center.capacity)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                                className={cn(
                                    'h-2.5 rounded-full',
                                    center.status === 'Available' &&
                                        'bg-emerald-500',
                                    center.status === 'Near Full' &&
                                        'bg-amber-500',
                                    center.status === 'Full' && 'bg-rose-500',
                                    center.status === 'Inactive' &&
                                        'bg-slate-400',
                                )}
                                style={{
                                    width: `${percentage(center.occupied, center.capacity)}%`,
                                }}
                            />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            {center.detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
