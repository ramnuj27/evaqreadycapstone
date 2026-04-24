import { Head, Link } from '@inertiajs/react';
import { BookOpen, Play, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDisasterHref } from '@/lib/disaster-links';
import resident from '@/routes/resident';

type DisasterGuide = {
    after: string[];
    before: string[];
    during: string[];
    id: 'flood' | 'earthquake' | 'typhoon' | 'tsunami';
    name: string;
    summary: string;
};

const disasterGuides: DisasterGuide[] = [
    {
        after: [
            'Return home only when authorities say it is safe.',
            'Clean and disinfect areas touched by flood water.',
            'Document any damage before repairs.',
        ],
        before: [
            'Monitor weather and flood advisories.',
            'Prepare a go-bag with water, medicine, and documents.',
            'Move important belongings to higher shelves.',
        ],
        during: [
            'Move immediately to higher ground.',
            'Avoid walking or driving through flood water.',
            'Follow evacuation orders without delay.',
        ],
        id: 'flood',
        name: 'Flood',
        summary: 'Best for low-lying communities and river-adjacent homes.',
    },
    {
        after: [
            'Check for injuries and provide first aid.',
            'Inspect the home for structural damage.',
            'Expect aftershocks and stay alert.',
        ],
        before: [
            'Secure heavy furniture and appliances.',
            'Identify safe spots inside the house.',
            'Practice family earthquake drills.',
        ],
        during: [
            'Drop, cover, and hold on.',
            'Stay away from windows and falling objects.',
            'Move to an open area if already outdoors.',
        ],
        id: 'earthquake',
        name: 'Earthquake',
        summary: 'Focused on sudden shaking and aftershock awareness.',
    },
    {
        after: [
            'Wait for the official all-clear before leaving shelter.',
            'Watch out for flood water and fallen power lines.',
            'Report dangerous debris in the area.',
        ],
        before: [
            'Secure loose outdoor items.',
            'Charge phones and emergency lights.',
            'Stock enough food, water, and medicine.',
        ],
        during: [
            'Stay indoors and away from windows.',
            'Keep listening to weather bulletins.',
            'Prepare for evacuation if the risk level rises.',
        ],
        id: 'typhoon',
        name: 'Typhoon',
        summary: 'For strong winds, heavy rain, and extended storm events.',
    },
    {
        after: [
            'Stay on high ground until authorities give the all-clear.',
            'Watch out for multiple waves.',
            'Avoid coastal debris and damaged structures.',
        ],
        before: [
            'Know the tsunami warning signs.',
            'Identify the fastest route to higher ground.',
            'Join local drills when available.',
        ],
        during: [
            'Move inland or to higher ground immediately.',
            'Do not wait for repeated warnings.',
            'Stay away from beaches and shorelines.',
        ],
        id: 'tsunami',
        name: 'Tsunami',
        summary: 'Designed for coastal barangays and surge-related hazards.',
    },
];

export default function ResidentDisasterInfo() {
    const [selectedDisaster, setSelectedDisaster] = useState<DisasterGuide>(
        disasterGuides[0],
    );

    return (
        <>
            <Head title="Disaster Information" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),linear-gradient(145deg,#ffffff_0%,#f8fafc_60%,#eff6ff_100%)] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_24%),linear-gradient(145deg,#0f172a_0%,#111827_60%,#082f49_100%)] md:p-6">
                    <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                        Safety Guides
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        Disaster Information
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Review simple guidance for flood, earthquake, typhoon,
                        and tsunami response so your household knows what to do
                        before, during, and after an emergency.
                    </p>
                </section>

                <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <BookOpen className="size-5 text-sky-600" />
                                Disaster Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {disasterGuides.map((guide) => (
                                <button
                                    key={guide.id}
                                    type="button"
                                    onClick={() => setSelectedDisaster(guide)}
                                    className={`w-full rounded-[24px] border px-4 py-4 text-left shadow-sm transition ${
                                        selectedDisaster.id === guide.id
                                            ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100'
                                            : 'border-border/70 bg-card hover:border-primary/40 hover:bg-accent/40'
                                    }`}
                                >
                                    <p className="font-semibold">
                                        {guide.name}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {guide.summary}
                                    </p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[30px] border-border/70 shadow-sm">
                        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    {selectedDisaster.name}
                                </CardTitle>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {selectedDisaster.summary}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    disabled
                                >
                                    <Volume2 className="size-4" />
                                    Audio Guide
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    disabled
                                >
                                    <Play className="size-4" />
                                    Video Guide
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    <Link href={getDisasterHref(selectedDisaster.id)}>
                                        Open Full Guide
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 lg:grid-cols-3">
                            <section className="rounded-[24px] border border-sky-200/80 bg-sky-50/80 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
                                <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase dark:text-sky-200">
                                    Before
                                </p>
                                <div className="mt-4 space-y-3">
                                    {selectedDisaster.before.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-[18px] bg-white/80 px-4 py-3 text-sm leading-6 text-sky-950 shadow-sm dark:bg-slate-950/50 dark:text-sky-50"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-[24px] border border-amber-200/80 bg-amber-50/80 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
                                <p className="text-xs font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-200">
                                    During
                                </p>
                                <div className="mt-4 space-y-3">
                                    {selectedDisaster.during.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-[18px] bg-white/80 px-4 py-3 text-sm leading-6 text-amber-950 shadow-sm dark:bg-slate-950/50 dark:text-amber-50"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/80 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                                <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-200">
                                    After
                                </p>
                                <div className="mt-4 space-y-3">
                                    {selectedDisaster.after.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-[18px] bg-white/80 px-4 py-3 text-sm leading-6 text-emerald-950 shadow-sm dark:bg-slate-950/50 dark:text-emerald-50"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ResidentDisasterInfo.layout = {
    breadcrumbs: [
        {
            title: 'Disaster Information',
            href: resident.disasterInfo(),
        },
    ],
};
