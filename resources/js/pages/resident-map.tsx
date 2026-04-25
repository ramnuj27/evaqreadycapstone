import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Layers3,
    LocateFixed,
    MapPinned,
    Navigation,
    Phone,
    Route,
    ShieldAlert,
} from 'lucide-react';
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
import resident from '@/routes/resident';

type ResidentCenter = {
    address: string;
    availableSlots: number;
    barangay: string;
    capacity: number;
    contact: string;
    distanceKm: string;
    etaMinutes: number;
    isNearest: boolean;
    latitude: number;
    longitude: number;
    name: string;
    occupied: number;
    status: string;
    x: number;
    y: number;
};

type ResidentLocation = {
    address: string;
    barangay: string;
    label: string;
    latitude: number;
    longitude: number;
    x: number;
    y: number;
};

type ResidentRoute = {
    distance: string;
    steps: string[];
    travelTime: string;
};

type ResidentMapProps = {
    mapData: {
        centers: ResidentCenter[];
        currentLocation: ResidentLocation | null;
        hazardZone: string;
        nearestCenter: ResidentCenter | null;
        route: ResidentRoute | null;
    };
};

type SummaryCardItem = {
    description: string;
    label: string;
    surfaceClassName: string;
    value: string;
};

const numberFormatter = new Intl.NumberFormat('en-PH');

const statusClassNames: Record<string, string> = {
    Full: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
    'Near Full':
        'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300',
    Open: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300',
};

function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

function statusClassName(status: string): string {
    return statusClassNames[status] ?? statusClassNames.Open;
}

export default function ResidentMap({ mapData }: ResidentMapProps) {
    const initialBarangay =
        mapData.currentLocation?.barangay ??
        mapData.nearestCenter?.barangay ??
        null;
    const [selectedBarangay, setSelectedBarangay] = useState<string | null>(
        initialBarangay,
    );
    const routePreviewPoints = [
        ...(mapData.currentLocation === null
            ? []
            : [
                  {
                      latitude: mapData.currentLocation.latitude,
                      longitude: mapData.currentLocation.longitude,
                  },
              ]),
        ...mapData.centers.map((center) => ({
            latitude: center.latitude,
            longitude: center.longitude,
        })),
    ];
    const routePreviewMarkers = [
        ...(mapData.currentLocation === null
            ? []
            : [
                  {
                      color: '#2563eb',
                      label: mapData.currentLocation.label,
                      latitude: mapData.currentLocation.latitude,
                      longitude: mapData.currentLocation.longitude,
                      selected: true,
                      size: 'medium' as const,
                      symbol: 'H',
                  },
              ]),
        ...mapData.centers.map((center) => ({
            barangay: center.barangay,
            color:
                center.status === 'Near Full'
                    ? '#f59e0b'
                    : center.isNearest
                      ? '#ef4444'
                      : '#10b981',
            label: `${center.name} (${center.barangay})`,
            latitude: center.latitude,
            longitude: center.longitude,
            selected:
                center.barangay === selectedBarangay ||
                (selectedBarangay === null && center.isNearest),
            size:
                center.barangay === selectedBarangay || center.isNearest
                    ? ('medium' as const)
                    : ('small' as const),
            symbol: center.isNearest ? 'E' : undefined,
        })),
    ];
    const selectedCenter =
        selectedBarangay === null
            ? mapData.nearestCenter
            : (mapData.centers.find(
                  (center) => center.barangay === selectedBarangay,
              ) ?? mapData.nearestCenter);
    const totalAvailableSlots = mapData.centers.reduce(
        (total, center) => total + center.availableSlots,
        0,
    );
    const summaryCards: SummaryCardItem[] = [
        {
            description:
                'Closest mapped center based on your household or default resident map view.',
            label: 'Nearest Center',
            surfaceClassName:
                'border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70',
            value: mapData.nearestCenter?.name ?? 'Pending',
        },
        {
            description:
                'Estimated travel time from your saved household pin when available.',
            label: 'Travel Time',
            surfaceClassName:
                'border-sky-200/60 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/25',
            value:
                mapData.route?.travelTime ??
                (mapData.nearestCenter === null
                    ? 'Pending'
                    : `${mapData.nearestCenter.etaMinutes} min`),
        },
        {
            description:
                'Remaining capacity across the resident map centers currently shown.',
            label: 'Open Slots',
            surfaceClassName:
                'border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/25',
            value: formatNumber(totalAvailableSlots),
        },
        {
            description:
                'Hazard classification tied to your resident profile or household setup.',
            label: 'Hazard Zone',
            surfaceClassName:
                'border-amber-200/60 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/25',
            value: mapData.hazardZone,
        },
    ];

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
            <Head title="Map / Nearest Center" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                Resident Route Map
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Map / Nearest Center
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review the same shared monitoring map style used
                                by the command dashboard, focused on your
                                household route and nearest evacuation center.
                            </p>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Drag the map to inspect nearby centers, reveal a
                                barangay border, then start AR guidance only
                                when you are ready to move.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-2xl"
                            >
                                <Link href={resident.evacuationCenters()}>
                                    <MapPinned className="size-4" />
                                    All Centers
                                </Link>
                            </Button>
                            <Button asChild className="rounded-2xl">
                                <Link href={resident.evacuationAr()}>
                                    <Navigation className="size-4" />
                                    Start AR Guide
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
                            <p className="mt-3 text-2xl font-semibold text-foreground">
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
                                    Route Map
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Center markers, barangay border focus, 3D
                                    terrain, zoom, and My location controls
                                    match the CDRRMO monitoring map.
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
                                    <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                                        Household
                                    </span>
                                    <span className="inline-flex rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300">
                                        Nearest
                                    </span>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                            statusClassName('Open'),
                                        )}
                                    >
                                        Open
                                    </span>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                                            statusClassName('Near Full'),
                                        )}
                                    >
                                        Near Full
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <InteractiveMapboxStaticMap
                                ariaLabel="Resident route map preview"
                                boundaries={matiBarangayBoundaries}
                                className="min-h-[420px] rounded-[28px] border border-slate-200/80 md:min-h-[560px] dark:border-slate-800"
                                hint="Drag to explore your route"
                                markers={routePreviewMarkers}
                                points={routePreviewPoints}
                                selectedBarangay={selectedBarangay}
                            />

                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
                                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Evacuation Center Markers
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-foreground">
                                        {formatNumber(mapData.centers.length)}{' '}
                                        centers visible on the resident map
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        {selectedBarangay
                                            ? `${selectedBarangay} is the active border focus.`
                                            : 'Use the dropdown to reveal one Mati City barangay border.'}
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                    <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <LocateFixed className="size-4 text-sky-600" />
                                            Household Pin
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                            {mapData.currentLocation?.address ??
                                                'No saved household pin yet. Centers still remain visible for map review.'}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Layers3 className="size-4 text-emerald-600" />
                                            Map Controls
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                            Drag, zoom, switch 3D terrain, or
                                            use My location just like the admin
                                            map.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800">
                            <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase dark:text-sky-300">
                                Nearest Center
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
                                                    statusClassName(
                                                        selectedCenter.status,
                                                    ),
                                                )}
                                            >
                                                {selectedCenter.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {selectedCenter.address}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
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
                                        <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                Occupancy
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                                {formatNumber(
                                                    selectedCenter.occupied,
                                                )}{' '}
                                                /{' '}
                                                {formatNumber(
                                                    selectedCenter.capacity,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                        <p className="font-semibold text-foreground">
                                            Resident Route Snapshot
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {mapData.route === null
                                                ? `${selectedCenter.distanceKm} away / ${selectedCenter.etaMinutes} min estimate`
                                                : `${mapData.route.distance} / ${mapData.route.travelTime}`}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-2xl"
                                        >
                                            <a
                                                href={`tel:${selectedCenter.contact}`}
                                            >
                                                <Phone className="size-4" />
                                                Call Center
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-2xl"
                                        >
                                            <Link
                                                href={resident.evacuationCenters()}
                                            >
                                                View More Centers
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                    No evacuation center is available in the
                                    resident map payload yet.
                                </div>
                            )}
                        </div>

                        <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800">
                            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300">
                                Household Route
                            </p>

                            {mapData.route === null ? (
                                <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-6 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                    Complete the household profile to show
                                    turn-by-turn route steps. The map still
                                    shows evacuation centers while setup is
                                    pending.
                                </div>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {mapData.route.steps.map((step, index) => (
                                        <div
                                            key={step}
                                            className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70"
                                        >
                                            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                Step {index + 1}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-foreground">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm dark:border-slate-800">
                            <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-300">
                                Route Safety
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-[22px] border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                                        <p>
                                            Confirm advisories before leaving
                                            and follow barangay responders when
                                            roads are blocked.
                                        </p>
                                    </div>
                                </div>
                                <Button asChild className="w-full rounded-2xl">
                                    <Link href={resident.evacuationAr()}>
                                        <Navigation className="size-4" />
                                        Start AR Guide
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

ResidentMap.layout = {
    breadcrumbs: [
        {
            title: 'Map / Nearest Center',
            href: resident.map(),
        },
    ],
};
