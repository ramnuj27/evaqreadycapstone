import { Head, Link } from '@inertiajs/react';
import {
    LocateFixed,
    MapPinned,
    Navigation,
    Phone,
    Route,
    ShieldAlert,
} from 'lucide-react';
import { InteractiveMapboxStaticMap } from '@/components/interactive-mapbox-static-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { matiBarangayBoundaries } from '@/lib/mati-barangay-boundaries';
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

const statusClassNames: Record<string, string> = {
    'Near Full':
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
    Open: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
};

export default function ResidentMap({ mapData }: ResidentMapProps) {
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
            color:
                center.status === 'Near Full'
                    ? '#f59e0b'
                    : center.isNearest
                      ? '#ef4444'
                      : '#10b981',
            label: center.name,
            latitude: center.latitude,
            longitude: center.longitude,
            selected: center.isNearest,
            size: center.isNearest ? ('medium' as const) : ('small' as const),
            symbol: center.isNearest ? 'E' : undefined,
        })),
    ];
    const selectedBarangay =
        mapData.currentLocation?.barangay ?? mapData.nearestCenter?.barangay ?? null;

    return (
        <>
            <Head title="Map / Nearest Center" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_58%,#eff6ff_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_58%,#082f49_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Route Guidance
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Map / Nearest Center
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review your household route on the live map,
                                switch to the 3D angle when needed, and launch
                                the AR guide once you are ready to move.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full"
                            >
                                <Link href={resident.evacuationCenters()}>
                                    <MapPinned className="size-4" />
                                    All Centers
                                </Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href={resident.evacuationAr()}>
                                    <Navigation className="size-4" />
                                    Start AR Guide
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <MapPinned className="size-5 text-sky-600" />
                                        Map Preview
                                    </CardTitle>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        The same shared map preview now supports
                                        a 3D terrain angle for your route.
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="w-fit rounded-full"
                                >
                                    {mapData.hazardZone}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InteractiveMapboxStaticMap
                                ariaLabel="Resident route map preview"
                                boundaries={matiBarangayBoundaries}
                                className="min-h-[420px] rounded-[28px] border border-slate-200/80 md:min-h-[560px] dark:border-slate-800"
                                hint="Drag to explore your route"
                                markers={routePreviewMarkers}
                                points={routePreviewPoints}
                                selectedBarangay={selectedBarangay}
                            />

                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-[22px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <LocateFixed className="size-4 text-sky-600" />
                                        Household
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {mapData.currentLocation?.address ??
                                            'Household location is not available yet.'}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Route className="size-4 text-emerald-600" />
                                        Travel Snapshot
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {mapData.route === null
                                            ? 'Route instructions will appear once a center is assigned.'
                                            : `${mapData.route.distance} / ${mapData.route.travelTime}`}
                                    </p>
                                </div>
                                <div className="rounded-[22px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <ShieldAlert className="size-4 text-amber-600" />
                                        Hazard Zone
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {mapData.hazardZone}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <aside className="space-y-4">
                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Route className="size-5 text-emerald-600" />
                                    Household Route
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mapData.route === null ? (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        No route preview is available for this
                                        household yet.
                                    </p>
                                ) : (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Distance
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                    {mapData.route.distance}
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Travel Time
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                    {mapData.route.travelTime}
                                                </p>
                                            </div>
                                        </div>

                                        <ol className="space-y-3">
                                            {mapData.route.steps.map(
                                                (step, index) => (
                                                    <li
                                                        key={step}
                                                        className="rounded-[22px] border border-border/70 bg-muted/20 px-4 py-3"
                                                    >
                                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                            Step {index + 1}
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-foreground">
                                                            {step}
                                                        </p>
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    </>
                                )}

                                <Button asChild className="w-full rounded-full">
                                    <Link href={resident.evacuationAr()}>
                                        <Navigation className="size-4" />
                                        Start AR Guide
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[30px] border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <MapPinned className="size-5 text-rose-600" />
                                    Nearest Center
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mapData.nearestCenter === null ? (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        A nearest center will appear here once
                                        the route data is available.
                                    </p>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-lg font-semibold text-foreground">
                                                    {mapData.nearestCenter.name}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                    {mapData.nearestCenter.address}
                                                </p>
                                            </div>

                                            <Badge
                                                className={
                                                    statusClassNames[
                                                        mapData.nearestCenter
                                                            .status
                                                    ] ?? statusClassNames.Open
                                                }
                                                variant="outline"
                                            >
                                                {mapData.nearestCenter.status}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Available Slots
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                    {
                                                        mapData.nearestCenter
                                                            .availableSlots
                                                    }
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Occupancy
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                    {
                                                        mapData.nearestCenter
                                                            .occupied
                                                    }{' '}
                                                    /{' '}
                                                    {
                                                        mapData.nearestCenter
                                                            .capacity
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-full"
                                            >
                                                <a
                                                    href={`tel:${mapData.nearestCenter.contact}`}
                                                >
                                                    <Phone className="size-4" />
                                                    Call Center
                                                </a>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-full"
                                            >
                                                <Link
                                                    href={resident.evacuationCenters()}
                                                >
                                                    View More Centers
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
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
