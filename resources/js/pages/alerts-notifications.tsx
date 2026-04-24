import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BellRing,
    Edit3,
    Eye,
    Megaphone,
    Play,
    Plus,
    Search,
    Siren,
    Trash2,
    TriangleAlert,
    Volume2,
} from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import {
    destroy as destroyAlertBroadcast,
    store as storeAlertBroadcast,
    update as updateAlertBroadcast,
} from '@/actions/App/Http/Controllers/AlertBroadcastController';
import { formatNumber } from '@/components/console-panels';
import type { DashboardPageProps } from '@/components/console-panels';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { alertsNotifications as alertsNotificationsRoute } from '@/routes';
import type { Auth } from '@/types';

type AlertPageType = 'Alert' | 'Announcement';
type AlertPageSeverity = 'High' | 'Low' | 'Medium';
type AlertPageStatus = 'Active' | 'Scheduled';

type AlertRecord = {
    audioEnabled: boolean;
    audioUrl: string | null;
    id: number;
    issuedAt: string | null;
    message: string;
    scheduledFor: string | null;
    senderName: string;
    senderRole: string;
    severity: AlertPageSeverity;
    status: AlertPageStatus;
    target: string;
    title: string;
    type: AlertPageType;
};

type AlertsCenterProps = {
    alerts: AlertRecord[];
    canManageBroadcasts: boolean;
    composerTargets: string[];
};

type AlertsNotificationsProps = DashboardPageProps & {
    alertsCenter: AlertsCenterProps;
};

type ComposerFormData = {
    audio_enabled: boolean;
    dispatch_action: 'schedule' | 'send_now';
    message: string;
    scheduled_for: string;
    severity: AlertPageSeverity;
    target: string;
    title: string;
    type: AlertPageType;
};

const severityCardClassNames: Record<AlertPageSeverity, string> = {
    High: 'border-rose-200/80 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/30',
    Low: 'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/30',
    Medium: 'border-amber-200/80 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30',
};

const severityPillClassNames: Record<AlertPageSeverity, string> = {
    High: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    Low: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Medium: 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const statusPillClassNames: Record<AlertPageStatus, string> = {
    Active: 'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300',
    Scheduled:
        'bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300',
};

function padNumber(value: number): string {
    return value.toString().padStart(2, '0');
}

function toDatetimeLocalValue(value: string | null): string {
    const date = value ? new Date(value) : new Date(Date.now() + 30 * 60 * 1000);

    return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}T${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function createInitialComposerData(): ComposerFormData {
    return {
        audio_enabled: true,
        dispatch_action: 'send_now',
        message: '',
        scheduled_for: toDatetimeLocalValue(null),
        severity: 'Medium',
        target: 'All',
        title: '',
        type: 'Alert',
    };
}

function displayTarget(target: string): string {
    return target === 'All' ? 'All barangays' : target;
}

function formatMoment(value: string | null): string {
    if (value === null) {
        return 'No time set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

function alertTimeLabel(alert: AlertRecord): string {
    if (alert.status === 'Scheduled') {
        return `Scheduled: ${formatMoment(alert.scheduledFor)}`;
    }

    return `Time: ${formatMoment(alert.issuedAt)}`;
}

function truncateText(value: string, limit: number): string {
    if (value.length <= limit) {
        return value;
    }

    return `${value.slice(0, limit).trimEnd()}...`;
}

function cardIcon(type: AlertPageType) {
    return type === 'Alert' ? TriangleAlert : Megaphone;
}

export default function AlertsNotifications({
    alertsCenter,
}: AlertsNotificationsProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const barangayName = auth.user?.barangay ?? null;
    const deskLabel = alertsCenter.canManageBroadcasts
        ? 'CDRRMO Broadcast Desk'
        : barangayName
          ? `${barangayName} Alert Inbox`
          : 'Committee Alert Inbox';
    const deskDescription = alertsCenter.canManageBroadcasts
        ? 'Create broadcasts for every barangay committee, edit scheduled messages, and keep the city-wide alert feed synchronized.'
        : 'Incoming directives from CDRRMO refresh automatically every 10 seconds so your barangay committee can respond quickly.';

    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [typeFilter, setTypeFilter] = useState<'all' | AlertPageType>('all');
    const [targetFilter, setTargetFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | AlertPageStatus>(
        'all',
    );
    const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const [editingAlertId, setEditingAlertId] = useState<number | null>(null);
    const [playingAlertId, setPlayingAlertId] = useState<number | null>(null);

    const {
        data,
        errors,
        post,
        processing,
        put,
        reset,
        setData,
        transform,
    } = useForm<ComposerFormData>(createInitialComposerData());

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
                only: ['dashboard', 'alertsCenter'],
            });
        }, 10000);

        return () => window.clearInterval(refreshInterval);
    }, []);

    const availableTargets = ['All', ...alertsCenter.composerTargets];
    const filterTargets = Array.from(
        new Set(alertsCenter.alerts.map((alert) => alert.target)),
    ).sort((first, second) => first.localeCompare(second));
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const filteredAlerts = alertsCenter.alerts.filter((alert) => {
        const matchesSearch =
            normalizedSearch === ''
            || alert.title.toLowerCase().includes(normalizedSearch)
            || alert.message.toLowerCase().includes(normalizedSearch)
            || displayTarget(alert.target).toLowerCase().includes(normalizedSearch)
            || alert.senderName.toLowerCase().includes(normalizedSearch);
        const matchesType = typeFilter === 'all' || alert.type === typeFilter;
        const matchesTarget =
            targetFilter === 'all' || alert.target === targetFilter;
        const matchesStatus =
            statusFilter === 'all' || alert.status === statusFilter;

        return matchesSearch && matchesType && matchesTarget && matchesStatus;
    });

    const selectedAlert =
        alertsCenter.alerts.find((alert) => alert.id === selectedAlertId) ?? null;
    const summary = {
        activeAlerts: filteredAlerts.filter(
            (alert) => alert.status === 'Active' && alert.type === 'Alert',
        ).length,
        announcements: filteredAlerts.filter(
            (alert) => alert.type === 'Announcement',
        ).length,
        highPriority: filteredAlerts.filter(
            (alert) => alert.severity === 'High',
        ).length,
    };
    const canSubmitComposer =
        data.title.trim() !== '' && data.message.trim() !== '';

    function resetComposer(): void {
        const initialData = createInitialComposerData();

        setEditingAlertId(null);
        reset();
        setData(initialData);
    }

    function closeComposer(): void {
        setComposerOpen(false);
        resetComposer();
    }

    function openCreateComposer(): void {
        resetComposer();
        setComposerOpen(true);
    }

    function openEditComposer(alert: AlertRecord): void {
        setSelectedAlertId(null);
        setEditingAlertId(alert.id);
        setData({
            audio_enabled: alert.audioEnabled,
            dispatch_action: alert.status === 'Scheduled' ? 'schedule' : 'send_now',
            message: alert.message,
            scheduled_for: toDatetimeLocalValue(alert.scheduledFor),
            severity: alert.severity,
            target: alert.target,
            title: alert.title,
            type: alert.type,
        });
        setComposerOpen(true);
    }

    function submitComposer(action: 'schedule' | 'send_now'): void {
        if (!canSubmitComposer) {
            return;
        }

        const submit = editingAlertId === null ? post : put;
        const url =
            editingAlertId === null
                ? storeAlertBroadcast.url()
                : updateAlertBroadcast.url(editingAlertId);

        transform((currentData) => ({
            ...currentData,
            dispatch_action: action,
        }));

        submit(url, {
            onSuccess: () => {
                closeComposer();
            },
            preserveScroll: true,
        });
    }

    function deleteAlert(alert: AlertRecord): void {
        if (
            !window.confirm(
                `Delete "${alert.title}" permanently? This cannot be undone.`,
            )
        ) {
            return;
        }

        router.delete(
            destroyAlertBroadcast.url(alert.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAlertId((currentAlertId) =>
                        currentAlertId === alert.id ? null : currentAlertId,
                    );
                },
            },
        );
    }

    function playAlertAudio(alert: Pick<
        AlertRecord,
        'audioEnabled' | 'audioUrl' | 'id' | 'message' | 'title'
    >): void {
        if (!alert.audioEnabled && alert.audioUrl === null) {
            return;
        }

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
            `${alert.title}. ${alert.message}`,
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
            <Head title="Alerts & Announcements" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_55%,#fff1f2_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_55%,#3f0d19_100%)] md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-rose-700 uppercase dark:text-rose-300">
                                {deskLabel}
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                Alerts & Announcements
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {deskDescription}
                            </p>
                        </div>

                        {alertsCenter.canManageBroadcasts ? (
                            <Button
                                className="h-11 rounded-full bg-rose-600 px-5 text-white shadow-sm hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400"
                                onClick={openCreateComposer}
                            >
                                <Plus className="size-4" />
                                New Alert
                            </Button>
                        ) : (
                            <div className="flex h-11 items-center rounded-full border border-white/70 bg-white/85 px-5 text-sm text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                                Auto-refresh: 10 sec
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-3 rounded-[24px] border border-white/70 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/55 md:grid-cols-[minmax(260px,1fr)_170px_220px_170px]">
                        <div className="relative min-w-0">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-11 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.currentTarget.value)
                                }
                                placeholder="Search alerts..."
                            />
                        </div>

                        <Select
                            value={typeFilter}
                            onValueChange={(value) =>
                                setTypeFilter(value as 'all' | AlertPageType)
                            }
                        >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="Alert">Alert</SelectItem>
                                <SelectItem value="Announcement">
                                    Announcement
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={targetFilter}
                            onValueChange={setTargetFilter}
                        >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Barangay" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All barangays</SelectItem>
                                {filterTargets.map((target) => (
                                    <SelectItem key={target} value={target}>
                                        {displayTarget(target)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                setStatusFilter(
                                    value as 'all' | AlertPageStatus,
                                )
                            }
                        >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All statuses
                                </SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Scheduled">
                                    Scheduled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Active Alerts
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.activeAlerts)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            Announcements
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.announcements)}
                        </p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200/80 bg-card px-5 py-4 shadow-sm dark:border-slate-800">
                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                            High Priority
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {formatNumber(summary.highPriority)}
                        </p>
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                Alerts List
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {alertsCenter.canManageBroadcasts
                                    ? 'Create, review, edit, and delete city-wide or barangay-targeted broadcasts from one command page.'
                                    : 'Review the alerts and announcements currently visible to your barangay committee.'}
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {formatNumber(filteredAlerts.length)} broadcast
                            {filteredAlerts.length === 1 ? '' : 's'} found
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        {filteredAlerts.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                No alert matched the current search or filters.
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => {
                                const Icon = cardIcon(alert.type);

                                return (
                                    <article
                                        key={alert.id}
                                        className={cn(
                                            'rounded-[28px] border p-5 shadow-sm transition',
                                            severityCardClassNames[
                                                alert.severity
                                            ],
                                        )}
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="max-w-3xl">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                                                            severityPillClassNames[
                                                                alert.severity
                                                            ],
                                                        )}
                                                    >
                                                        <Icon className="size-3.5" />
                                                        {alert.severity}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-slate-200/80 dark:bg-slate-950/70 dark:ring-slate-800">
                                                        {alert.type}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                                                            statusPillClassNames[
                                                                alert.status
                                                            ],
                                                        )}
                                                    >
                                                        {alert.status}
                                                    </span>
                                                </div>

                                                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                                                    {alert.title}
                                                    {' - '}
                                                    {displayTarget(alert.target)}
                                                </h3>
                                                <p className="mt-3 text-sm font-medium text-muted-foreground">
                                                    Severity: {alert.severity}{' '}
                                                    | Target:{' '}
                                                    {displayTarget(alert.target)}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Sent by {alert.senderName} (
                                                    {alert.senderRole})
                                                </p>
                                                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/90">
                                                    "{truncateText(alert.message, 140)}"
                                                </p>
                                                <p className="mt-3 text-sm text-muted-foreground">
                                                    {alertTimeLabel(alert)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    variant="ghost"
                                                    className="size-9 rounded-full p-0"
                                                    title="Play Audio"
                                                    aria-label="Play Audio"
                                                    onClick={() =>
                                                        playAlertAudio(alert)
                                                    }
                                                    disabled={
                                                        !alert.audioEnabled
                                                        && alert.audioUrl ===
                                                            null
                                                    }
                                                >
                                                    <Play className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="size-9 rounded-full p-0"
                                                    title="View alert"
                                                    aria-label="View alert"
                                                    onClick={() =>
                                                        setSelectedAlertId(
                                                            alert.id,
                                                        )
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                {alertsCenter.canManageBroadcasts ? (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            className="size-9 rounded-full p-0"
                                                            title="Edit alert"
                                                            aria-label="Edit alert"
                                                            onClick={() =>
                                                                openEditComposer(
                                                                    alert,
                                                                )
                                                            }
                                                        >
                                                            <Edit3 className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="size-9 rounded-full p-0 text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                                            title="Delete alert"
                                                            aria-label="Delete alert"
                                                            onClick={() =>
                                                                deleteAlert(
                                                                    alert,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>

            <Dialog
                open={selectedAlert !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedAlertId(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedAlert?.title ?? 'Alert Details'}
                        </DialogTitle>
                        <DialogDescription>
                            Review the full alert message, target scope, sender,
                            status, and audio playback from one command view.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAlert ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Type
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedAlert.type}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Severity
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                            severityPillClassNames[
                                                selectedAlert.severity
                                            ],
                                        )}
                                    >
                                        {selectedAlert.severity}
                                    </span>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Target
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {displayTarget(selectedAlert.target)}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Status
                                    </p>
                                    <span
                                        className={cn(
                                            'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                            statusPillClassNames[
                                                selectedAlert.status
                                            ],
                                        )}
                                    >
                                        {selectedAlert.status}
                                    </span>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Time
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedAlert.status === 'Scheduled'
                                            ? formatMoment(
                                                  selectedAlert.scheduledFor,
                                              )
                                            : formatMoment(
                                                  selectedAlert.issuedAt,
                                              )}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Sender
                                    </p>
                                    <p className="mt-2 font-semibold text-foreground">
                                        {selectedAlert.senderName}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedAlert.senderRole}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center gap-2">
                                    {selectedAlert.type === 'Alert' ? (
                                        <Siren className="size-4 text-rose-600" />
                                    ) : (
                                        <BellRing className="size-4 text-emerald-600" />
                                    )}
                                    <p className="text-sm font-semibold text-foreground">
                                        Message
                                    </p>
                                </div>
                                <p className="mt-4 text-sm leading-7 text-foreground">
                                    "{selectedAlert.message}"
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            className="size-9 rounded-full p-0"
                            title="Play Audio"
                            aria-label="Play Audio"
                            onClick={() =>
                                selectedAlert && playAlertAudio(selectedAlert)
                            }
                            disabled={
                                selectedAlert === null
                                || (!selectedAlert.audioEnabled
                                    && selectedAlert.audioUrl === null)
                            }
                        >
                            <Volume2 className="size-4" />
                        </Button>
                        {alertsCenter.canManageBroadcasts && selectedAlert ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="size-9 rounded-full p-0"
                                    title="Edit alert"
                                    aria-label="Edit alert"
                                    onClick={() =>
                                        openEditComposer(selectedAlert)
                                    }
                                >
                                    <Edit3 className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="size-9 rounded-full p-0 text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                    title="Delete alert"
                                    aria-label="Delete alert"
                                    onClick={() => deleteAlert(selectedAlert)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </>
                        ) : null}
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedAlertId(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {alertsCenter.canManageBroadcasts ? (
                <Dialog
                    open={composerOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            closeComposer();
                        }
                    }}
                >
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAlertId === null
                                    ? 'Create Alert'
                                    : 'Edit Alert'}
                            </DialogTitle>
                            <DialogDescription>
                                Compose a broadcast message, set the target, and
                                use Send Now or Schedule so barangay committees
                                receive the update in their inbox.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="alert-title">Title</Label>
                                    <Input
                                        id="alert-title"
                                        value={data.title}
                                        onChange={(event) =>
                                            setData(
                                                'title',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Flood Warning"
                                    />
                                    {errors.title ? (
                                        <p className="text-xs text-rose-600">
                                            {errors.title}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData(
                                                'type',
                                                value as AlertPageType,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-2xl">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Alert">
                                                Alert
                                            </SelectItem>
                                            <SelectItem value="Announcement">
                                                Announcement
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type ? (
                                        <p className="text-xs text-rose-600">
                                            {errors.type}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Severity</Label>
                                    <Select
                                        value={data.severity}
                                        onValueChange={(value) =>
                                            setData(
                                                'severity',
                                                value as AlertPageSeverity,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-2xl">
                                            <SelectValue placeholder="Severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="Medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="High">
                                                High
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.severity ? (
                                        <p className="text-xs text-rose-600">
                                            {errors.severity}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label>Target</Label>
                                    <Select
                                        value={data.target}
                                        onValueChange={(value) =>
                                            setData('target', value)
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-2xl">
                                            <SelectValue placeholder="Target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTargets.map((target) => (
                                                <SelectItem
                                                    key={target}
                                                    value={target}
                                                >
                                                    {displayTarget(target)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.target ? (
                                        <p className="text-xs text-rose-600">
                                            {errors.target}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alert-message">Message</Label>
                                <textarea
                                    id="alert-message"
                                    className="min-h-32 w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800"
                                    value={data.message}
                                    onChange={(event) =>
                                        setData(
                                            'message',
                                            event.currentTarget.value,
                                        )
                                    }
                                    placeholder="Possible flooding. Proceed to nearest evacuation center."
                                />
                                {errors.message ? (
                                    <p className="text-xs text-rose-600">
                                        {errors.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-time">
                                        Schedule Time
                                    </Label>
                                    <Input
                                        id="schedule-time"
                                        type="datetime-local"
                                        value={data.scheduled_for}
                                        onChange={(event) =>
                                            setData(
                                                'scheduled_for',
                                                event.currentTarget.value,
                                            )
                                        }
                                    />
                                    {errors.scheduled_for ? (
                                        <p className="text-xs text-rose-600">
                                            {errors.scheduled_for}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="enable-audio-alert"
                                            checked={data.audio_enabled}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'audio_enabled',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="enable-audio-alert">
                                                Enable Audio Alert
                                            </Label>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                Use text-to-speech so operators
                                                can quickly preview the spoken
                                                alert.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            playAlertAudio({
                                                audioEnabled:
                                                    data.audio_enabled,
                                                audioUrl: null,
                                                id: editingAlertId
                                                    ?? -1,
                                                message:
                                                    data.message.trim()
                                                    || 'No message entered yet.',
                                                title:
                                                    data.title.trim()
                                                    || 'Alert preview',
                                            })
                                        }
                                        disabled={!data.audio_enabled}
                                    >
                                        <Play className="size-4" />
                                        Generate Voice
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                onClick={() => submitComposer('send_now')}
                                disabled={!canSubmitComposer || processing}
                            >
                                Send Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => submitComposer('schedule')}
                                disabled={
                                    !canSubmitComposer
                                    || data.scheduled_for.trim() === ''
                                    || processing
                                }
                            >
                                Schedule
                            </Button>
                            <Button variant="ghost" onClick={closeComposer}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
}

AlertsNotifications.layout = {
    breadcrumbs: [
        {
            title: 'Alerts & Announcements',
            href: alertsNotificationsRoute(),
        },
    ],
};
