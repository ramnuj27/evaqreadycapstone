import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Layers3,
    LocateFixed,
    MapPinned,
    ShieldAlert,
} from 'lucide-react';
import { formatNumber } from '@/components/console-panels';
import type {
    DashboardPageProps,
    MapCenterStatus,
} from '@/components/console-panels';
import { InteractiveMapboxStaticMap } from '@/components/interactive-mapbox-static-map';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    matiBarangayBoundaries,
    matiBarangayNames,
} from '@/lib/mati-barangay-boundaries';
import { cn } from '@/lib/utils';
import {
    mapMonitoring as mapMonitoringRoute,
} from '@/routes';
import type { Auth } from '@/types';

type MapMarker =
    DashboardPageProps['dashboard']['mapMonitoring']['markers'][number];
type HazardArea =
    DashboardPageProps['dashboard']['mapMonitoring']['hazardAreas'][number];
type SummaryCardItem = {
    description: string;
    label: string;
    surfaceClassName: string;
    value: string;
    valueClassName?: string;
};

const statusClassNames: Record<MapCenterStatus, string> = {
    Available:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
    Full: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    'Near Full':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
};

const hazardToneClassNames: Record<HazardArea['tone'], string> = {
    amber: 'border-amber-200/70 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30',
    blue: 'border-blue-200/70 bg-blue-50/80 dark:border-blue-900/60 dark:bg-blue-950/30',
    sky: 'border-sky-200/70 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/30',
};

function toStatusLabel(status: MapCenterStatus): string {
    return status === 'Available' ? 'Open' : status;
}

export default function MapMonitoring({ dashboard }: DashboardPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const mapData = dashboard.mapMonitoring;
    const isBarangayCommittee = auth.user?.role === 'Barangay Committee';
    const barangayName = auth.user?.barangay ?? null;
    const totalHazardLayers = mapData.hazardAreas.length;
    const [selectedBarangay, setSelectedBarangay] = useState<string | null>(
        null,
    );
    const selectedCenter =
        selectedBarangay === null
            ? null
            : (mapData.markers.find(
                  (marker) => marker.barangay === selectedBarangay,
              ) ?? null);
    const mapPoints = mapData.markers.map((marker) => ({
        latitude: marker.latitude,
        longitude: marker.longitude,
    }));
    const mapMarkers = mapData.markers.map((marker) => ({
        barangay: marker.barangay,
        color:
            marker.status === 'Available'
                ? '#10b981'
                : marker.status === 'Near Full'
                  ? '#f59e0b'
                  : '#f43f5e',
        id: marker.id,
        label: `${marker.name} (${marker.barangay})`,
        latitude: marker.latitude,
        longitude: marker.longitude,
        selected: marker.barangay === selectedBarangay,
        size:
            marker.barangay === selectedBarangay
                ? ('medium' as const)
                : ('small' as const),
    }));
    const summaryCards: SummaryCardItem[] =
        isBarangayCommittee && barangayName
            ? [
                  {
                      description:
                          'Only your assigned barangay appears in this shared monitoring map.',
                      label: 'Focused Barangay',
                      surfaceClassName:
                          'border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70',
                      value: barangayName,
                      valueClassName: 'text-2xl md:text-[2rem]',
                  },
                  {
                      description:
                          'Evacuation centers currently mapped inside your local response area.',
                      label: 'Local Centers',
                      surfaceClassName:
                          'border-sky-200/60 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/25',
                      value: formatNumber(mapData.summary.total),
                  },
                  {
                      description:
                          'Centers still ready to receive evacuees in your assigned barangay.',
                      label: 'Open',
                      surfaceClassName:
                          'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/25',
                      value: formatNumber(mapData.summary.open),
                  },
                  {
                      description:
                          'Hazard overlays still affecting the households in this local map view.',
                      label: 'Hazard Layers',
                      surfaceClassName:
                          'border-amber-200/60 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/25',
                      value: formatNumber(totalHazardLayers),
                  },
              ]
            : [
                  {
                      description:
                          'Operational center markers currently visible in the monitoring payload.',
                      label: 'Total Centers',
                      surfaceClassName:
                          'border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70',
                      value: formatNumber(mapData.summary.total),
                  },
                  {
                      description:
                          'Centers ready to receive additional evacuees right now.',
                      label: 'Open',
                      surfaceClassName:
                          'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/25',
                      value: formatNumber(mapData.summary.open),
                  },
                  {
                      description:
                          'Centers nearing the threshold and needing closer load balancing.',
                      label: 'Near Full',
                      surfaceClassName:
                          'border-amber-200/60 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/25',
                      value: formatNumber(mapData.summary.nearFull),
                  },
                  {
                      description:
                          'Centers already marked full in the current monitoring roster.',
                      label: 'Full',
                      surfaceClassName:
                          'border-rose-200/60 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/25',
                      value: formatNumber(mapData.summary.full),
                  },
              ];
    const heroBadge =
        isBarangayCommittee && barangayName
            ? `${barangayName} Committee Map`
            : 'Map Monitoring';
    const heroTitle =
        isBarangayCommittee && barangayName
            ? `${barangayName} center and hazard map`
            : 'Drag-ready monitoring map';
    const heroDescription =
        isBarangayCommittee && barangayName
            ? `Assigned barangay: ${barangayName}. Review center capacity, hazard overlays, and local map positions without leaving your committee workspace.`
            : mapData.meta.note;
    const heroInstruction =
        isBarangayCommittee && barangayName
            ? 'Drag the map to pan around your assigned area, then use the dropdown to reveal the exact barangay border you want to inspect before recentering with My location.'
            : 'Drag the map to pan across center activity, then use the dropdown to reveal one Mati City barangay border at a time.';

    useEffect(() => {
        if (
            selectedBarangay !== null &&
            !matiBarangayNames.some((barangay) => barangay === selectedBarangay)
        ) {
            setSelectedBarangay(null);
        }
    }, [selectedBarangay]);

    return (
        <>
            <Head title="Map Monitoring" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                {heroBadge}
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                {heroTitle}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {heroDescription}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {heroInstruction}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-2xl"
                            >
                                <Link href={mapMonitoringRoute()}>
                                    {isBarangayCommittee
                                        ? 'Refresh Local Map'
                                        : 'Refresh Monitoring Page'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className={cn(
                                'rounded-[24px] border p-4 shadow-sm',
                                card.surfaceClassName,
                            )}
                        >
                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                {card.label}
                            </p>
                            <p
                                className={cn(
                                    'mt-3 text-3xl font-semibold text-foreground',
                                    card.valueClassName,
                                )}
                            >
                                {card.value}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_380px]">
                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? 'Assigned Monitoring Map'
                                        : 'Monitoring Map'}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? `Center markers stay focused on ${barangayName}, while the dropdown can reveal any Mati City barangay border for a cleaner visual check.`
                                        : 'Choose any Mati City barangay from the dropdown to show only that border on the monitoring map.'}
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-3 md:w-[290px]">
                                <Select
                                    value={selectedBarangay ?? 'none'}
                                    onValueChange={(value) =>
                                        setSelectedBarangay(
                                            value === 'none' ? null : value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                        <SelectValue placeholder="Choose barangay border" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No border selected
                                        </SelectItem>
                                        {matiBarangayNames.map((barangay) => (
                                            <SelectItem
                                                key={barangay}
                                                value={barangay}
                                            >
                                                {barangay}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex flex-wrap gap-2">
                                    {mapData.legend.map((item) => (
                                        <span
                                            key={item.label}
                                            className={cn(
                                                'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                                statusClassNames[item.status],
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {mapPoints.length === 0 ? (
                            <div className="mt-6 flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 text-center md:min-h-[560px] dark:border-slate-700 dark:bg-slate-900/60">
                                <div className="max-w-xl space-y-4">
                                    <div className="mx-auto flex size-14 items-center justify-center rounded-[18px] bg-sky-500/10 text-sky-700 dark:text-sky-300">
                                        <MapPinned className="size-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-base font-semibold text-foreground">
                                            {isBarangayCommittee && barangayName
                                                ? `No ${barangayName} monitoring markers yet.`
                                                : 'No monitoring markers yet.'}
                                        </p>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {isBarangayCommittee && barangayName
                                                ? 'Center coordinates need to exist in your assigned barangay data before the shared preview can render.'
                                                : 'Center coordinates need to exist in the monitoring data before the map can render a shared preview.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <InteractiveMapboxStaticMap
                                    ariaLabel="Map monitoring preview"
                                    boundaries={matiBarangayBoundaries}
                                    className="min-h-[420px] rounded-[28px] border border-slate-200/80 md:min-h-[560px] dark:border-slate-800"
                                    hint="Drag to pan the monitoring map"
                                    markers={mapMarkers}
                                    points={mapPoints}
                                    selectedBarangay={selectedBarangay}
                                />

                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
                                    <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Live Center Markers
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">
                                            {formatNumber(
                                                mapData.markers.length,
                                            )}{' '}
                                            {isBarangayCommittee && barangayName
                                                ? 'local monitoring points in view'
                                                : 'monitoring points in view'}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {selectedBarangay
                                                ? `${selectedBarangay} is the active border focus on the map. Open the dropdown again any time you want to switch barangays.`
                                                : 'Open the dropdown to show one Mati City barangay border at a time.'}
                                        </p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <MapPinned className="size-4 text-emerald-600" />
                                                Selected Border
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-foreground">
                                                {selectedBarangay ??
                                                    'No border selected'}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                Use the barangay dropdown above
                                                the map to reveal a border.
                                            </p>
                                        </div>
                                        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <LocateFixed className="size-4 text-sky-600" />
                                                Geolocation data
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                                {mapData.meta
                                                    .supportsGeolocation
                                                    ? isBarangayCommittee &&
                                                      barangayName
                                                        ? 'Use My location to recenter the map around your assigned response area.'
                                                        : 'Use My location to recenter the map.'
                                                    : 'Disabled in the current payload.'}
                                            </p>
                                        </div>
                                        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <Layers3 className="size-4 text-emerald-600" />
                                                Direction support
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                                {mapData.meta.supportsDirections
                                                    ? isBarangayCommittee &&
                                                      barangayName
                                                        ? 'Local route metadata is ready for barangay-level follow-up work.'
                                                        : 'Route metadata is ready for follow-up work.'
                                                    : 'Routing is not enabled in this payload.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800">
                            <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase dark:text-sky-300">
                                {isBarangayCommittee && barangayName
                                    ? `${barangayName} Center Snapshot`
                                    : 'Selected Center Snapshot'}
                            </p>

                            {selectedCenter ? (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-xl font-semibold text-foreground">
                                                {selectedCenter.name}
                                            </p>
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                                    statusClassNames[
                                                        selectedCenter.status
                                                    ],
                                                )}
                                            >
                                                {toStatusLabel(
                                                    selectedCenter.status,
                                                )}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Barangay {selectedCenter.barangay}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                Capacity
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                                {formatNumber(
                                                    selectedCenter.capacity,
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                Available Slots
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                                {formatNumber(
                                                    selectedCenter.availableSlots,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="font-semibold text-foreground">
                                            Command Note
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {selectedCenter.note}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                    {selectedBarangay
                                        ? `No mapped center is tied to ${selectedBarangay} in the current monitoring payload yet.`
                                        : 'Choose a barangay from the dropdown above to preview its border and any mapped center details.'}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800">
                            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300">
                                {isBarangayCommittee && barangayName
                                    ? `${barangayName} Hazard Layers`
                                    : 'Hazard Layers'}
                            </p>
                            <div className="mt-4 space-y-3">
                                {mapData.hazardAreas.map((hazard) => (
                                    <div
                                        key={hazard.id}
                                        className={cn(
                                            'rounded-[22px] border p-4',
                                            hazardToneClassNames[hazard.tone],
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {hazard.label}
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {hazard.description}
                                                </p>
                                            </div>
                                            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            {formatNumber(hazard.total)}{' '}
                                            affected households
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? `${barangayName} Center Monitoring`
                                        : 'Center Monitoring Data'}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? 'The same local center dataset drives both your draggable map and the committee monitoring roster.'
                                        : 'The same center dataset drives both the draggable map and the monitoring roster.'}
                                </p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-slate-800 dark:bg-slate-900">
                                {formatNumber(mapData.markers.length)}{' '}
                                {isBarangayCommittee && barangayName
                                    ? 'local centers'
                                    : 'centers'}
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {mapData.markers.map((marker: MapMarker) => (
                                <div
                                    key={marker.id}
                                    className={cn(
                                        'rounded-[24px] border p-4 transition',
                                        marker.barangay === selectedBarangay
                                            ? 'border-sky-300/90 bg-sky-50/90 shadow-[0_18px_44px_rgba(14,165,233,0.12)] dark:border-sky-800 dark:bg-sky-950/25'
                                            : 'border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70',
                                    )}
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-lg font-semibold text-foreground">
                                                    {marker.name}
                                                </p>
                                                {marker.barangay ===
                                                selectedBarangay ? (
                                                    <span className="inline-flex rounded-full border border-sky-300/80 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-sky-700 uppercase dark:border-sky-800 dark:bg-slate-950/80 dark:text-sky-300">
                                                        Border Focus
                                                    </span>
                                                ) : null}
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                                        statusClassNames[
                                                            marker.status
                                                        ],
                                                    )}
                                                >
                                                    {toStatusLabel(
                                                        marker.status,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Barangay {marker.barangay}
                                            </p>
                                        </div>

                                        <div className="grid gap-2 text-right text-sm text-muted-foreground">
                                            <span>
                                                Capacity:{' '}
                                                <span className="font-semibold text-foreground">
                                                    {formatNumber(
                                                        marker.capacity,
                                                    )}
                                                </span>
                                            </span>
                                            <span>
                                                Current evacuees:{' '}
                                                <span className="font-semibold text-foreground">
                                                    {formatNumber(
                                                        marker.currentEvacuees,
                                                    )}
                                                </span>
                                            </span>
                                            <span>
                                                Available slots:{' '}
                                                <span className="font-semibold text-foreground">
                                                    {formatNumber(
                                                        marker.availableSlots,
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                        {marker.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? 'Committee Map Notes'
                                        : 'Map Notes'}
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {isBarangayCommittee && barangayName
                                        ? 'Keep these local monitoring details in mind while you pan around your assigned map.'
                                        : 'Keep these monitoring details in mind while you pan around the map.'}
                                </p>
                            </div>
                            <MapPinned className="size-5 text-sky-600" />
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-900/70">
                                {isBarangayCommittee && barangayName
                                    ? 'Dragging pans the shared map image across your assigned barangay without bringing back the heavier fullscreen and manual zoom controls from the older prototype.'
                                    : 'Dragging pans the shared map image without bringing back the heavier fullscreen and manual zoom controls from the older prototype.'}
                            </div>
                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-900/70">
                                {isBarangayCommittee && barangayName
                                    ? '`dashboard.mapMonitoring.markers` stays scoped to your assigned barangay and remains the source of truth for local center coordinates and availability.'
                                    : '`dashboard.mapMonitoring.markers` remains the source of truth for center coordinates and availability.'}
                            </div>
                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-900/70">
                                {isBarangayCommittee && barangayName
                                    ? 'Hazard layers still come from `dashboard.mapMonitoring.hazardAreas`, so the side panel stays aligned with your committee map view.'
                                    : 'Hazard layers still come from `dashboard.mapMonitoring.hazardAreas`, so the side panel remains aligned with the map view.'}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

MapMonitoring.layout = {
    breadcrumbs: [
        {
            title: 'Map Monitoring',
            href: mapMonitoringRoute(),
        },
    ],
};
