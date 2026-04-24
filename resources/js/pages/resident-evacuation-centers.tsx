import { Head, Link } from '@inertiajs/react';
import { MapPin, Navigation, Phone, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import resident from '@/routes/resident';

type Center = {
    address: string;
    availableSlots: number;
    capacity: number;
    contact: string;
    distanceKm: string;
    etaMinutes: number;
    isNearest: boolean;
    name: string;
    occupied: number;
    status: string;
};

type ResidentEvacuationCentersProps = {
    centers: Center[];
};

const statusClassNames: Record<string, string> = {
    'Near Full':
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
    Open: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
};

export default function ResidentEvacuationCenters({
    centers,
}: ResidentEvacuationCentersProps) {
    return (
        <>
            <Head title="Evacuation Centers" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#fff7ed_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.14),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#431407_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold tracking-[0.24em] text-rose-700 uppercase dark:text-rose-300">
                                Destination Planning
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Evacuation Centers
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Review nearby evacuation centers, their current
                                planning status, and the quickest path from your
                                household.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full"
                            >
                                <Link href={resident.map()}>
                                    <MapPin className="size-4" />
                                    View Map
                                </Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href={resident.evacuationAr()}>
                                    <Navigation className="size-4" />
                                    Open AR Guide
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {centers.length === 0 ? (
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
                            No evacuation center directory is available yet for
                            this resident account.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {centers.map((center) => (
                            <Card
                                key={center.name}
                                className="rounded-[30px] border-border/70 shadow-sm"
                            >
                                <CardHeader>
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                <MapPin className="size-5 text-rose-600" />
                                                {center.name}
                                            </CardTitle>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {center.address}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {center.isNearest ? (
                                                <Badge variant="outline">
                                                    Nearest
                                                </Badge>
                                            ) : null}
                                            <Badge
                                                className={
                                                    statusClassNames[
                                                        center.status
                                                    ]
                                                }
                                                variant="outline"
                                            >
                                                {center.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Distance
                                            </p>
                                            <p className="mt-2 font-semibold text-foreground">
                                                {center.distanceKm}
                                            </p>
                                        </div>
                                        <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                ETA
                                            </p>
                                            <p className="mt-2 font-semibold text-foreground">
                                                {center.etaMinutes} min
                                            </p>
                                        </div>
                                        <div className="rounded-[20px] border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Available Slots
                                            </p>
                                            <p className="mt-2 font-semibold text-foreground">
                                                {center.availableSlots}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-[24px] border border-border/70 bg-muted/20 p-5">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UsersRound className="size-4" />
                                            Capacity: {center.occupied} /{' '}
                                            {center.capacity} occupied
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-border/70">
                                            <div
                                                className="h-full rounded-full bg-rose-500"
                                                style={{
                                                    width: `${Math.round(
                                                        (center.occupied /
                                                            center.capacity) *
                                                            100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            <Link href={resident.map()}>
                                                View on Map
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            <Link
                                                href={resident.evacuationAr()}
                                            >
                                                <Navigation className="size-4" />
                                                AR Guide
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            <a href={`tel:${center.contact}`}>
                                                <Phone className="size-4" />
                                                {center.contact}
                                            </a>
                                        </Button>
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

ResidentEvacuationCenters.layout = {
    breadcrumbs: [
        {
            title: 'Evacuation Centers',
            href: resident.evacuationCenters(),
        },
    ],
};
