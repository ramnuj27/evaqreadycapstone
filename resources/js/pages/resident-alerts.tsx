import { Head } from '@inertiajs/react';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { residentDateTime, residentLabel } from '@/lib/resident';
import resident from '@/routes/resident';

type AlertBroadcast = {
    audioEnabled: boolean;
    audioUrl?: string | null;
    id: number;
    message: string;
    severity: string;
    targetBarangay?: string | null;
    time?: string | null;
    title: string;
    type: string;
};

type ResidentAlertsProps = {
    alerts: AlertBroadcast[];
};

const toneClassNames: Record<string, string> = {
    critical:
        'border-rose-200/80 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30',
    high: 'border-orange-200/80 bg-orange-50/80 dark:border-orange-900/60 dark:bg-orange-950/30',
    low: 'border-sky-200/80 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30',
    medium:
        'border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30',
};

export default function ResidentAlerts({ alerts }: ResidentAlertsProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingAlertId, setPlayingAlertId] = useState<number | null>(null);

    const handlePlayAudio = (alert: AlertBroadcast) => {
        if (!alert.audioUrl) {
            return;
        }

        audioRef.current?.pause();

        const audio = new Audio(alert.audioUrl);
        audioRef.current = audio;
        setPlayingAlertId(alert.id);
        audio.play();
        audio.onended = () => setPlayingAlertId(null);
    };

    return (
        <>
            <Head title="Alerts & Announcements" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.15),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#fff7ed_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#431407_100%)] md:p-6">
                    <p className="text-xs font-semibold tracking-[0.24em] text-orange-700 uppercase dark:text-orange-300">
                        Resident Alerts
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        Alerts & Announcements
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Stay updated with the latest warnings, notices, and
                        broadcast announcements relevant to your barangay and
                        household.
                    </p>
                </section>

                {alerts.length === 0 ? (
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No active alerts are available at the moment.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {alerts.map((alert) => (
                            <Card
                                key={alert.id}
                                className={`rounded-[30px] border-border/70 shadow-sm ${toneClassNames[alert.severity]}`}
                            >
                                <CardHeader>
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-3xl">
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <AlertTriangle className="size-5 text-orange-600" />
                                                {alert.title}
                                            </CardTitle>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {residentDateTime(alert.time)}
                                                {' · '}
                                                {alert.targetBarangay ?? 'City-wide'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">
                                                {residentLabel(alert.severity)}
                                            </Badge>
                                            <Badge variant="outline">
                                                {residentLabel(alert.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-6 text-foreground/90">
                                        {alert.message}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {alert.audioEnabled && alert.audioUrl ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => handlePlayAudio(alert)}
                                                disabled={playingAlertId === alert.id}
                                            >
                                                <Volume2 className="size-4" />
                                                {playingAlertId === alert.id
                                                    ? 'Playing Audio...'
                                                    : 'Play Audio'}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                disabled
                                            >
                                                <VolumeX className="size-4" />
                                                No Audio Available
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ResidentAlerts.layout = {
    breadcrumbs: [
        {
            title: 'Alerts & Announcements',
            href: resident.alerts(),
        },
    ],
};
