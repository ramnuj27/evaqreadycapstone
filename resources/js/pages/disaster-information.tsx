import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeAlert,
    BellRing,
    ChartColumnBig,
    ChevronDown,
    CircleCheckBig,
    CirclePlay,
    Menu,
    Package,
    Pause,
    Play,
    RadioTower,
    ShieldCheck,
    Siren,
    TriangleAlert,
    Volume2,
    VolumeX,
    Waves,
    Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    startTransition,
    useDeferredValue,
    useEffect,
    useRef,
    useState,
} from 'react';
import GeneratedDisasterVideo from '@/components/generated-disaster-video';
import LandingLoginDialog from '@/components/landing-login-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    disasterLinks,
    getDisasterHref,
    type DisasterGuideId,
} from '@/lib/disaster-links';
import { cn } from '@/lib/utils';
import {
    contact as contactRoute,
    dashboard,
    features as featuresRoute,
    home,
    howItWorks as howItWorksRoute,
    register,
} from '@/routes';

type Props = {
    canRegister?: boolean;
    canResetPassword?: boolean;
    initialDisasterId?: DisasterGuideId;
    pageMode?: 'hub' | 'detail';
};

type DisasterGuide = {
    id: DisasterGuideId;
    title: string;
    icon: LucideIcon;
    shortDescription: string;
    overview: string;
    warningSigns: string[];
    before: string[];
    during: string[];
    after: string[];
    safetyTip: string;
    emergencyKit: string[];
    audioGuide: string;
    mediaTitle: string;
    mediaDescription: string;
    duration: string;
    accentClassName: string;
};

type AmbientNodes = {
    context: AudioContext;
    lowOscillator: OscillatorNode;
    highOscillator: OscillatorNode;
    pulseOscillator: OscillatorNode;
    masterGain: GainNode;
    pulseGain: GainNode;
    lowGain: GainNode;
    highGain: GainNode;
};

const displayFont = {
    fontFamily: '"Outfit", "Instrument Sans", sans-serif',
} as const;

const surfaceClassName =
    'public-adaptive-glass rounded-[28px] backdrop-blur-xl';

const disasterGuides: DisasterGuide[] = [
    {
        id: 'flood',
        title: 'Flood',
        icon: Waves,
        shortDescription:
            'Track rising waters, safer routes, and contaminated zones before communities become isolated.',
        overview:
            'Flooding happens when water overflows onto land that is usually dry. It may build up slowly after heavy rain or arrive quickly when rivers, drainage systems, or coastal areas can no longer contain the water.',
        warningSigns: [
            'Heavy rain continues for several hours with nearby waterways rising fast.',
            'Drainage channels, roads, or low-lying paths start filling with water.',
            'Official weather bulletins, sirens, or barangay evacuation notices are issued.',
        ],
        before: [
            'Prepare an emergency kit and keep important documents inside waterproof storage.',
            'Know the nearest evacuation center and the fastest route to higher ground.',
            'Charge phones, monitor official updates, and move appliances away from floor level.',
        ],
        during: [
            'Move immediately to higher ground or to the assigned evacuation center.',
            'Avoid walking or driving through floodwater because currents and hidden hazards are dangerous.',
            'Follow responder instructions and keep children, older adults, and medicines close.',
        ],
        after: [
            'Avoid dirty or contaminated water until authorities confirm it is safe.',
            'Inspect the home carefully for structural damage, electrical risks, and mold.',
            'Return only when officials announce that the area is safe for re-entry.',
        ],
        safetyTip:
            'Even shallow floodwater can move vehicles or hide open canals, debris, and live electrical hazards.',
        emergencyKit: [
            'Waterproof pouch for IDs and medical records',
            'Flashlight, batteries, and power bank',
            'Clean drinking water and ready-to-eat food',
            'Whistle, rain gear, and dry clothes',
        ],
        audioGuide:
            'Flood preparedness guide. Watch water levels, secure essential documents, and move early when officials advise evacuation. During flooding, go to higher ground and never cross moving water. After the flood, avoid contaminated areas and wait for clearance before returning home.',
        mediaTitle: 'Flood route and high-ground briefing',
        mediaDescription:
            'A short awareness clip focused on early evacuation, safe routes, and post-flood sanitation.',
        duration: '02:18',
        accentClassName: 'from-sky-400/30 via-blue-500/10 to-slate-950',
    },
    {
        id: 'tsunami',
        title: 'Tsunami',
        icon: RadioTower,
        shortDescription:
            'Coordinate rapid movement away from shorelines when a powerful undersea event threatens coastal communities.',
        overview:
            'A tsunami is a series of large ocean waves usually triggered by undersea earthquakes, landslides, or volcanic activity. These waves can flood coastal zones quickly and repeatedly.',
        warningSigns: [
            'A strong or long earthquake is felt near the coast.',
            'Sea water suddenly recedes or rises in an unusual way.',
            'Authorities issue coastal sirens, radio warnings, or evacuation orders.',
        ],
        before: [
            'Know the fastest route from the coast to higher inland ground.',
            'Practice family evacuation plans and identify a meeting point after relocation.',
            'Prepare grab bags, radios, and first-aid supplies before storm or quake seasons.',
        ],
        during: [
            'Move inland or uphill immediately without waiting to confirm the wave visually.',
            'Stay away from beaches, river mouths, bridges, and low coastal roads.',
            'Remain in the safe zone until authorities say repeated waves are no longer expected.',
        ],
        after: [
            'Expect more than one wave and stay alert to official bulletins.',
            'Avoid floodwater, unstable structures, and damaged roads near the shoreline.',
            'Report missing family members to responders once communications are stable.',
        ],
        safetyTip:
            'If you are near the coast and feel a strong earthquake, self-evacuate immediately. Natural warning signs matter.',
        emergencyKit: [
            'Battery-powered radio and whistle',
            'Emergency contacts written on waterproof paper',
            'Basic first-aid kit and medicines',
            'Lightweight food, water, and protective footwear',
        ],
        audioGuide:
            'Tsunami preparedness guide. If you feel a strong coastal earthquake, move inland at once. Do not wait at the shore to see the wave. Stay in the safe zone until authorities confirm the threat has passed because multiple waves may arrive.',
        mediaTitle: 'Coastal evacuation readiness briefing',
        mediaDescription:
            'A guided clip on self-evacuation, safe uphill movement, and repeated-wave awareness.',
        duration: '01:56',
        accentClassName: 'from-cyan-300/25 via-sky-500/10 to-slate-950',
    },
    {
        id: 'earthquake',
        title: 'Earthquake',
        icon: TriangleAlert,
        shortDescription:
            'Help residents respond quickly to shaking, structural hazards, and safe assembly procedures.',
        overview:
            'Earthquakes happen when energy is suddenly released from faults in the earth. The shaking can damage buildings, roads, utilities, and communication lines without warning.',
        warningSigns: [
            'There is usually little to no warning before the shaking begins.',
            'Aftershocks may follow the first major earthquake and cause additional damage.',
            'Cracks, falling debris, and unstable structures may appear immediately after impact.',
        ],
        before: [
            'Secure shelves, cabinets, and heavy items that may fall during shaking.',
            'Identify safe spots indoors and open areas outdoors for evacuation.',
            'Prepare first-aid supplies, flashlights, and communication plans for the household.',
        ],
        during: [
            'Drop, cover, and hold on until the shaking stops.',
            'Stay away from glass, tall furniture, and objects that may collapse.',
            'If outside, move to an open area away from buildings, poles, and wires.',
        ],
        after: [
            'Check injuries first, then assess for fire, gas leaks, or structural damage.',
            'Expect aftershocks and avoid re-entering unsafe buildings.',
            'Follow official instructions for assembly areas, shelter, and utilities checks.',
        ],
        safetyTip:
            'Running during strong shaking increases injury risk. Protect your head first, then evacuate carefully once movement stops.',
        emergencyKit: [
            'First-aid supplies and extra medicines',
            'Flashlight and spare batteries',
            'Gloves, mask, and sturdy shoes',
            'Portable radio and contact list',
        ],
        audioGuide:
            'Earthquake preparedness guide. During shaking, drop, cover, and hold on. Stay away from windows and falling objects. After the shaking stops, move carefully, expect aftershocks, and avoid damaged buildings until responders inspect them.',
        mediaTitle: 'Drop, cover, and hold awareness clip',
        mediaDescription:
            'A short instructional briefing on immediate response, aftershock readiness, and safe assembly.',
        duration: '02:05',
        accentClassName: 'from-amber-300/30 via-orange-500/12 to-slate-950',
    },
    {
        id: 'typhoon',
        title: 'Typhoon',
        icon: Wind,
        shortDescription:
            'Prepare residents for strong winds, prolonged rain, power interruption, and pre-emptive evacuation orders.',
        overview:
            'A typhoon is a powerful tropical cyclone that can bring destructive wind, intense rainfall, storm surge, and widespread flooding. Its effects may last for many hours or even days.',
        warningSigns: [
            'Weather bulletins show a strong storm entering the local area of responsibility.',
            'Winds intensify, rain bands arrive, and coastal or flood warnings are issued.',
            'Local officials announce suspension, shelter preparation, or pre-emptive evacuation.',
        ],
        before: [
            'Reinforce windows, roofs, and loose outdoor materials before strong winds arrive.',
            'Store water, charge devices, and prepare food and medicines for several days.',
            'Relocate early if your area is prone to flooding, landslides, or storm surge.',
        ],
        during: [
            'Stay indoors and away from windows, light materials, and damaged roofing.',
            'Keep monitoring official announcements using radio or trusted emergency channels.',
            'Do not travel unless ordered to evacuate and use only approved routes.',
        ],
        after: [
            'Watch for downed power lines, debris, floodwater, and unstable structures.',
            'Document damage safely and wait for official re-entry instructions when displaced.',
            'Continue following advisories because flooding and landslides may happen after the storm passes.',
        ],
        safetyTip:
            'Typhoon danger continues even after winds weaken. Flooding, landslides, and live wires remain serious risks.',
        emergencyKit: [
            'Three-day food and water supply',
            'Charged power bank and battery radio',
            'Rain protection, flashlight, and hygiene kit',
            'Medicines, masks, and emergency contacts',
        ],
        audioGuide:
            'Typhoon preparedness guide. Secure the home early, monitor official warnings, and evacuate before roads become unsafe. During the storm, stay indoors and listen for updates. Afterward, avoid floodwater and damaged power lines while waiting for community clearance.',
        mediaTitle: 'Typhoon shelter and monitoring briefing',
        mediaDescription:
            'A preparedness clip covering strong-wind safety, evacuation timing, and post-storm hazards.',
        duration: '02:24',
        accentClassName: 'from-orange-300/28 via-red-500/12 to-slate-950',
    },
];

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
];

const awarenessClips = [
    {
        title: 'Featured preparedness overview',
        description:
            'A guided multimedia briefing covering alerts, safe movement, and resident accountability.',
        duration: '03:12',
    },
    {
        title: 'Community evacuation drill',
        description:
            'A short practice sequence for barangay teams, center staff, and residents.',
        duration: '01:42',
    },
    {
        title: 'Emergency kit walkthrough',
        description:
            'A quick reminder on what every household should keep ready before impact.',
        duration: '01:18',
    },
];

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
}: {
    eyebrow: string;
    title: string;
    description: string;
    align?: 'left' | 'center';
}) {
    return (
        <div
            className={cn(
                'max-w-3xl',
                align === 'center' && 'mx-auto text-center',
            )}
        >
            <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-orange-300 uppercase">
                {eyebrow}
            </p>
            <h2
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
                style={displayFont}
            >
                {title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                {description}
            </p>
        </div>
    );
}

function GlassPanel({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn(surfaceClassName, className)}>{children}</div>;
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
    return (
        <GlassPanel className="p-6">
            <h3
                className="text-lg font-semibold text-white"
                style={displayFont}
            >
                {title}
            </h3>
            <div className="mt-4 grid gap-3">
                {items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                        <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                        <p className="text-sm leading-6 text-slate-300">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </GlassPanel>
    );
}

function MediaPreviewCard({
    label,
    title,
    description,
    duration,
    accentClassName,
    compact = false,
}: {
    label: string;
    title: string;
    description: string;
    duration: string;
    accentClassName: string;
    compact?: boolean;
}) {
    return (
        <GlassPanel className="public-media-card overflow-hidden">
            <div
                className={cn(
                    'relative overflow-hidden bg-gradient-to-br',
                    accentClassName,
                    compact ? 'aspect-[4/3]' : 'aspect-video',
                )}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),linear-gradient(180deg,rgba(2,10,24,0.12),rgba(2,10,24,0.72))]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.06),transparent)]" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-slate-950/35 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.24em] text-slate-100 uppercase backdrop-blur">
                        <CirclePlay className="size-3.5 text-orange-200" />
                        {label}
                    </div>

                    <div>
                        <button
                            type="button"
                            className="mb-4 inline-flex size-12 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white shadow-[0_14px_35px_rgba(2,10,24,0.35)] transition duration-300 hover:scale-105 hover:bg-white/16"
                        >
                            <Play className="ml-0.5 size-5 fill-current" />
                        </button>
                        <h3
                            className={cn(
                                'font-semibold text-white',
                                compact ? 'text-xl' : 'text-2xl',
                            )}
                            style={displayFont}
                        >
                            {title}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200/90">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                    <div className="h-1.5 rounded-full bg-white/8">
                        <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-orange-300 via-orange-400 to-amber-200" />
                    </div>
                </div>
                <div className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                    {duration}
                </div>
            </div>
        </GlassPanel>
    );
}

export default function DisasterInformation({
    canRegister = true,
    canResetPassword = true,
    initialDisasterId,
    pageMode = 'hub',
}: Props) {
    const { auth } = usePage().props;
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeDisasterId, setActiveDisasterId] =
        useState<DisasterGuideId>(initialDisasterId ?? 'flood');
    const [isAmbientEnabled, setIsAmbientEnabled] = useState(false);
    const [speakingGuideId, setSpeakingGuideId] = useState<
        DisasterGuide['id'] | null
    >(null);
    const ambientNodesRef = useRef<AmbientNodes | null>(null);
    const isDetailPage = pageMode === 'detail';

    const displayedDisasterId = useDeferredValue(activeDisasterId);
    const activeDisaster =
        disasterGuides.find(
            (disaster) => disaster.id === displayedDisasterId,
        ) ?? disasterGuides[0];
    const pageTitle = isDetailPage
        ? `${activeDisaster.title} Preparedness Guide`
        : 'Disaster Awareness & Preparedness';
    const heroTitle = isDetailPage
        ? `${activeDisaster.title} Preparedness Guide`
        : 'Disaster Awareness & Preparedness';
    const heroDescription = isDetailPage
        ? `Focus on ${activeDisaster.title.toLowerCase()}-specific warning signs, response actions, and safety reminders for residents and responders.`
        : 'Learn how to stay safe during different types of disasters with guided information, alerts, and preparedness tips.';
    const primaryGuideHref = isDetailPage
        ? '#preparedness-guide'
        : '#disaster-guides';
    const primaryGuideLabel = isDetailPage
        ? `Review ${activeDisaster.title} Checklist`
        : 'Explore Disaster Guides';

    const landingLinks = [
        { label: 'Home', href: `${home.url()}#home` },
        { label: 'How It Works', href: howItWorksRoute.url() },
        { label: 'Features', href: `${featuresRoute.url()}#features` },
        { label: 'Contact', href: contactRoute.url() },
    ];

    const stopGuideNarration = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setSpeakingGuideId(null);
    };

    const ensureAmbientAudio = () => {
        if (ambientNodesRef.current || typeof window === 'undefined') {
            return ambientNodesRef.current;
        }

        const AudioConstructor =
            window.AudioContext ??
            (
                window as Window & {
                    webkitAudioContext?: typeof AudioContext;
                }
            ).webkitAudioContext;

        if (!AudioConstructor) {
            return null;
        }

        const context = new AudioConstructor();
        const masterGain = context.createGain();
        const lowGain = context.createGain();
        const highGain = context.createGain();
        const pulseGain = context.createGain();
        const lowOscillator = context.createOscillator();
        const highOscillator = context.createOscillator();
        const pulseOscillator = context.createOscillator();

        lowOscillator.type = 'sine';
        highOscillator.type = 'triangle';
        pulseOscillator.type = 'sine';

        lowOscillator.frequency.value = 164.81;
        highOscillator.frequency.value = 246.94;
        pulseOscillator.frequency.value = 0.18;

        masterGain.gain.value = 0.014;
        lowGain.gain.value = 0.7;
        highGain.gain.value = 0.24;
        pulseGain.gain.value = 0.008;

        lowOscillator.connect(lowGain);
        highOscillator.connect(highGain);
        lowGain.connect(masterGain);
        highGain.connect(masterGain);
        pulseOscillator.connect(pulseGain);
        pulseGain.connect(masterGain.gain);
        masterGain.connect(context.destination);

        lowOscillator.start();
        highOscillator.start();
        pulseOscillator.start();

        ambientNodesRef.current = {
            context,
            lowOscillator,
            highOscillator,
            pulseOscillator,
            masterGain,
            pulseGain,
            lowGain,
            highGain,
        };

        return ambientNodesRef.current;
    };

    const toggleAmbientAudio = async () => {
        const ambientNodes = ensureAmbientAudio();

        if (!ambientNodes) {
            return;
        }

        if (ambientNodes.context.state === 'running') {
            await ambientNodes.context.suspend();
            setIsAmbientEnabled(false);

            return;
        }

        await ambientNodes.context.resume();
        setIsAmbientEnabled(true);
    };

    const playGuide = (guide: DisasterGuide) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }

        if (speakingGuideId === guide.id) {
            stopGuideNarration();

            return;
        }

        window.speechSynthesis.cancel();

        const narration = new SpeechSynthesisUtterance(guide.audioGuide);
        narration.lang = 'en-US';
        narration.rate = 0.96;
        narration.pitch = 1;
        narration.onend = () => {
            setSpeakingGuideId((current) =>
                current === guide.id ? null : current,
            );
        };
        narration.onerror = () => {
            setSpeakingGuideId((current) =>
                current === guide.id ? null : current,
            );
        };

        setSpeakingGuideId(guide.id);
        window.speechSynthesis.speak(narration);
    };

    const activateDisaster = (
        disasterId: DisasterGuide['id'],
        options?: {
            scroll?: boolean;
            speak?: boolean;
            updateHash?: boolean;
            visitPage?: boolean;
        },
    ) => {
        const selectedGuide =
            disasterGuides.find((disaster) => disaster.id === disasterId) ??
            disasterGuides[0];

        if (
            options?.visitPage &&
            isDetailPage &&
            selectedGuide.id !== initialDisasterId
        ) {
            router.visit(getDisasterHref(selectedGuide.id));

            return;
        }

        startTransition(() => {
            setActiveDisasterId(selectedGuide.id);
        });

        if (
            options?.updateHash !== false &&
            pageMode === 'hub' &&
            typeof window !== 'undefined'
        ) {
            window.history.replaceState(null, '', `#${selectedGuide.id}`);
        }

        if (options?.scroll) {
            document
                .getElementById('preparedness-guide')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (options?.speak) {
            playGuide(selectedGuide);
        }
    };

    useEffect(() => {
        if (
            initialDisasterId &&
            disasterGuides.some((guide) => guide.id === initialDisasterId)
        ) {
            startTransition(() => {
                setActiveDisasterId(initialDisasterId);
            });

            return;
        }

        if (pageMode === 'hub' && typeof window !== 'undefined') {
            const hashId = window.location.hash.replace(
                '#',
                '',
            ) as DisasterGuideId;

            if (disasterGuides.some((guide) => guide.id === hashId)) {
                startTransition(() => {
                    setActiveDisasterId(hashId);
                });

                return;
            }
        }

        startTransition(() => {
            setActiveDisasterId('flood');
        });
    }, [initialDisasterId, pageMode]);

    useEffect(() => {
        if (pageMode !== 'hub' || typeof window === 'undefined') {
            return;
        }

        const syncFromHash = () => {
            const hashId = window.location.hash.replace(
                '#',
                '',
            ) as DisasterGuideId;

            if (disasterGuides.some((guide) => guide.id === hashId)) {
                startTransition(() => {
                    setActiveDisasterId(hashId);
                });
            }
        };

        window.addEventListener('hashchange', syncFromHash);

        return () => {
            window.removeEventListener('hashchange', syncFromHash);
        };
    }, [pageMode]);

    useEffect(() => {
        return () => {
            const ambientNodes = ambientNodesRef.current;

            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            if (!ambientNodes) {
                return;
            }

            ambientNodes.lowOscillator.stop();
            ambientNodes.highOscillator.stop();
            ambientNodes.pulseOscillator.stop();
            ambientNodes.lowOscillator.disconnect();
            ambientNodes.highOscillator.disconnect();
            ambientNodes.pulseOscillator.disconnect();
            ambientNodes.lowGain.disconnect();
            ambientNodes.highGain.disconnect();
            ambientNodes.pulseGain.disconnect();
            ambientNodes.masterGain.disconnect();
            ambientNodesRef.current = null;
            void ambientNodes.context.close().catch(() => {});
        };
    }, []);

    useEffect(() => {
        const rootElement = document.documentElement;
        const previousScrollBehavior = rootElement.style.scrollBehavior;

        rootElement.style.scrollBehavior = 'smooth';

        return () => {
            rootElement.style.scrollBehavior = previousScrollBehavior;
        };
    }, []);

    return (
        <>
            <Head title={pageTitle}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|outfit:500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <LandingLoginDialog
                open={isLoginOpen}
                onOpenChange={setIsLoginOpen}
                canRegister={canRegister}
                canResetPassword={canResetPassword}
            />

            <div className="public-page min-h-screen text-white">
                <header className="fixed inset-x-0 top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="public-header-shell flex items-center justify-between gap-4 rounded-full px-5 py-3 backdrop-blur-xl">
                            <Link
                                href={home()}
                                className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white uppercase"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-slate-950 shadow-[0_10px_25px_rgba(251,146,60,0.4)]">
                                    EQ
                                </span>
                                <span className="text-base tracking-[0.22em]">
                                    EvaQReady
                                </span>
                            </Link>

                            <nav className="hidden items-center gap-2 lg:flex">
                                {landingLinks.slice(0, 3).map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="rounded-full px-4 py-2 text-sm text-slate-300 transition duration-300 hover:bg-white/6 hover:text-white"
                                    >
                                        {item.label}
                                    </a>
                                ))}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:bg-white/12"
                                        >
                                            Disaster Info
                                            <ChevronDown className="size-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="center"
                                        className="public-dropdown-shell w-56 rounded-2xl p-2 backdrop-blur-xl"
                                    >
                                        {disasterLinks.map((guide) => (
                                            <DropdownMenuItem
                                                key={guide.id}
                                                asChild
                                                className="cursor-pointer rounded-xl px-3 py-2 text-slate-200 focus:bg-white/8 focus:text-white"
                                            >
                                                <Link href={guide.href}>
                                                    {guide.label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <a
                                    href={landingLinks[3].href}
                                    className="rounded-full px-4 py-2 text-sm text-slate-300 transition duration-300 hover:bg-white/6 hover:text-white"
                                >
                                    {landingLinks[3].label}
                                </a>
                            </nav>

                            <div className="hidden items-center gap-3 lg:flex">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                    >
                                        <Link href={dashboard()}>
                                            Open Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsLoginOpen(true)}
                                            className="rounded-full border border-white/12 bg-white/[0.03] px-5 text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white/8"
                                        >
                                            Login
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                asChild
                                                className="rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-5 text-slate-950 shadow-[0_16px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Link href={register()}>
                                                    Sign Up
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full border border-white/12 bg-white/[0.03] text-white hover:bg-white/8"
                                        >
                                            <Menu className="size-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="public-mobile-sheet backdrop-blur-xl">
                                        <SheetHeader className="border-b border-white/10 px-6 pt-6 pb-4 text-left">
                                            <SheetTitle
                                                className="text-left text-xl text-white"
                                                style={displayFont}
                                            >
                                                EvaQReady
                                            </SheetTitle>
                                        </SheetHeader>

                                        <div className="flex h-full flex-col justify-between px-6 pt-4 pb-6">
                                            <div className="space-y-2">
                                                {landingLinks.map((item) => (
                                                    <SheetClose
                                                        key={item.label}
                                                        asChild
                                                    >
                                                        <a
                                                            href={item.href}
                                                            className="block rounded-2xl border border-transparent px-4 py-3 text-base text-slate-200 transition duration-300 hover:border-white/10 hover:bg-white/6 hover:text-white"
                                                        >
                                                            {item.label}
                                                        </a>
                                                    </SheetClose>
                                                ))}

                                                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                                                    <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-orange-300 uppercase">
                                                        Disaster Info
                                                    </p>
                                                    <div className="grid gap-2">
                                                        {disasterLinks.map(
                                                            (guide) => (
                                                                <SheetClose
                                                                    key={
                                                                        guide.id
                                                                    }
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={
                                                                            guide.href
                                                                        }
                                                                        className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-white"
                                                                    >
                                                                        {
                                                                            guide.label
                                                                        }
                                                                    </Link>
                                                                </SheetClose>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 pt-6">
                                                {auth.user ? (
                                                    <SheetClose asChild>
                                                        <Button
                                                            asChild
                                                            className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-slate-950"
                                                        >
                                                            <Link
                                                                href={dashboard()}
                                                            >
                                                                Open Dashboard
                                                            </Link>
                                                        </Button>
                                                    </SheetClose>
                                                ) : (
                                                    <>
                                                        <SheetClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setIsLoginOpen(
                                                                        true,
                                                                    )
                                                                }
                                                                className="h-11 rounded-full border border-white/12 bg-white/[0.03] text-white hover:bg-white/8"
                                                            >
                                                                Login
                                                            </Button>
                                                        </SheetClose>
                                                        {canRegister && (
                                                            <SheetClose asChild>
                                                                <Button
                                                                    asChild
                                                                    className="h-11 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-slate-950"
                                                                >
                                                                    <Link
                                                                        href={register()}
                                                                    >
                                                                        Sign Up
                                                                    </Link>
                                                                </Button>
                                                            </SheetClose>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </header>

                <main>
                    <section className="public-hero-dark relative isolate min-h-screen overflow-hidden">
                        <GeneratedDisasterVideo className="absolute inset-0 h-full w-full opacity-70" />
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,10,24,0.9)_15%,rgba(4,28,50,0.68)_55%,rgba(2,10,24,0.9)_100%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,125,64,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(84,177,255,0.18),transparent_28%)]" />

                        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,420px)] lg:items-center">
                                <div className="duration-700 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-semibold tracking-[0.24em] text-slate-200 uppercase shadow-[0_10px_30px_rgba(2,10,24,0.28)] backdrop-blur-xl">
                                        <Siren className="size-3.5 text-orange-300" />
                                        Resident Preparedness Network
                                    </div>

                                    <h1
                                        className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
                                        style={displayFont}
                                    >
                                        {heroTitle}
                                    </h1>

                                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                                        {heroDescription}
                                    </p>

                                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                        >
                                            <a href={primaryGuideHref}>
                                                {primaryGuideLabel}
                                            </a>
                                        </Button>

                                        {canRegister ? (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                                            >
                                                <Link href={register()}>
                                                    Create Account
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="lg"
                                                variant="outline"
                                                onClick={() =>
                                                    setIsLoginOpen(true)
                                                }
                                                className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                                            >
                                                Create Account
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {[
                                            'Preparedness briefings for residents',
                                            'QR-ready evacuation awareness',
                                            'Guided actions before, during, and after impact',
                                        ].map((highlight) => (
                                            <div
                                                key={highlight}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 backdrop-blur-xl"
                                            >
                                                <CircleCheckBig className="size-4 text-emerald-300" />
                                                {highlight}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <GlassPanel className="public-media-shell overflow-hidden">
                                    <div className="border-b border-white/10 px-6 py-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-200 uppercase">
                                                <Volume2 className="size-3.5 text-orange-300" />
                                                Ambient Audio
                                            </div>
                                            <button
                                                type="button"
                                                onClick={toggleAmbientAudio}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition duration-300 hover:bg-white/[0.08]"
                                            >
                                                {isAmbientEnabled ? (
                                                    <>
                                                        <Pause className="size-4" />
                                                        Pause audio
                                                    </>
                                                ) : (
                                                    <>
                                                        <VolumeX className="size-4" />
                                                        Enable audio
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <h2
                                            className="mt-5 text-3xl font-semibold text-white"
                                            style={displayFont}
                                        >
                                            Live awareness feed
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            A multimedia-ready interface for
                                            evacuation awareness, guided
                                            reminders, and resident-focused
                                            safety education.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 px-6 py-6">
                                        <MediaPreviewCard
                                            label="Featured video"
                                            title="Community readiness broadcast"
                                            description="An animated preparedness feed highlighting alerts, evacuation movement, and QR-based resident accountability."
                                            duration="Live loop"
                                            accentClassName="from-blue-400/28 via-sky-500/10 to-slate-950"
                                        />

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <GlassPanel className="p-5">
                                                <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                    Audio Guides
                                                </p>
                                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                                    Disaster-specific voice
                                                    reminders can be played at
                                                    any time while reviewing the
                                                    preparedness steps below.
                                                </p>
                                            </GlassPanel>

                                            <GlassPanel className="p-5">
                                                <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                    Media Controls
                                                </p>
                                                <div className="mt-4 flex items-center gap-3">
                                                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white">
                                                        <Play className="ml-0.5 size-4 fill-current" />
                                                    </span>
                                                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white">
                                                        <Volume2 className="size-4" />
                                                    </span>
                                                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white">
                                                        <ChartColumnBig className="size-4" />
                                                    </span>
                                                </div>
                                            </GlassPanel>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </div>
                        </div>
                    </section>

                    <section
                        id="disaster-guides"
                        className="public-light-section-alt border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Disaster Guides"
                                title="Interactive awareness cards for the hazards communities face most"
                                description="Select a disaster to open its guided overview, warning signs, response actions, and multimedia reminders."
                            />

                            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                {disasterGuides.map((guide) => {
                                    const isActive =
                                        activeDisaster.id === guide.id;

                                    return (
                                        <button
                                            key={guide.id}
                                            type="button"
                                            onClick={() =>
                                                activateDisaster(guide.id, {
                                                    scroll: true,
                                                    visitPage: true,
                                                })
                                            }
                                            className={cn(
                                                surfaceClassName,
                                                'group overflow-hidden p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-white/[0.08]',
                                                isActive &&
                                                    'border-orange-300/30 bg-white/[0.08] shadow-[0_24px_70px_rgba(251,146,60,0.14)]',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-orange-300 transition duration-300 group-hover:bg-orange-400/10">
                                                    <guide.icon className="size-5" />
                                                </div>
                                                {isActive && (
                                                    <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.22em] text-orange-200 uppercase">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            <h3
                                                className="mt-5 text-2xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                {guide.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                                {guide.shortDescription}
                                            </p>

                                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-xs font-medium text-slate-200">
                                                    <ArrowRight className="size-3.5" />
                                                    View Details
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        activateDisaster(
                                                            guide.id,
                                                            {
                                                                speak: true,
                                                            },
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 transition duration-300 hover:bg-white/[0.08]"
                                                >
                                                    {speakingGuideId ===
                                                    guide.id ? (
                                                        <Pause className="size-3.5" />
                                                    ) : (
                                                        <Volume2 className="size-3.5" />
                                                    )}
                                                    Listen to Guide
                                                </button>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div
                                id="preparedness-guide"
                                className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_380px]"
                            >
                                <div className="grid gap-6">
                                    <GlassPanel className="p-6 sm:p-8">
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="max-w-2xl">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200 uppercase">
                                                    <activeDisaster.icon className="size-3.5 text-orange-300" />
                                                    Active Disaster Guide
                                                </div>
                                                <h2
                                                    className="mt-5 text-4xl font-semibold text-white"
                                                    style={displayFont}
                                                >
                                                    {activeDisaster.title}
                                                </h2>
                                                <p className="mt-4 text-base leading-7 text-slate-300">
                                                    {activeDisaster.overview}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {disasterGuides.map((guide) => (
                                                    <button
                                                        key={guide.id}
                                                        type="button"
                                                    onClick={() =>
                                                        activateDisaster(
                                                            guide.id,
                                                            {
                                                                visitPage:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                        className={cn(
                                                            'rounded-full border px-4 py-2 text-sm transition duration-300',
                                                            guide.id ===
                                                                activeDisaster.id
                                                                ? 'border-orange-300/30 bg-orange-400/10 text-white'
                                                                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white',
                                                        )}
                                                    >
                                                        {guide.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-8 grid gap-3 md:grid-cols-5">
                                            {[
                                                'Overview',
                                                'Warning Signs',
                                                'Before',
                                                'During',
                                                'After',
                                            ].map((marker, index) => (
                                                <div
                                                    key={marker}
                                                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                                                >
                                                    <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                                                        0{index + 1}
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-white">
                                                        {marker}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassPanel>

                                    <GlassPanel className="p-6 sm:p-8">
                                        <div className="flex items-center gap-3">
                                            <BadgeAlert className="size-5 text-orange-300" />
                                            <h3
                                                className="text-2xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Warning Signs
                                            </h3>
                                        </div>

                                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                                            {activeDisaster.warningSigns.map(
                                                (warning) => (
                                                    <div
                                                        key={warning}
                                                        className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                                                    >
                                                        <BellRing className="size-4 text-orange-300" />
                                                        <p className="mt-4 text-sm leading-7 text-slate-300">
                                                            {warning}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </GlassPanel>

                                    <div className="grid gap-6 xl:grid-cols-3">
                                        <ChecklistCard
                                            title="What To Do Before"
                                            items={activeDisaster.before}
                                        />
                                        <ChecklistCard
                                            title="What To Do During"
                                            items={activeDisaster.during}
                                        />
                                        <ChecklistCard
                                            title="What To Do After"
                                            items={activeDisaster.after}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <MediaPreviewCard
                                        label="Preparedness Video"
                                        title={activeDisaster.mediaTitle}
                                        description={
                                            activeDisaster.mediaDescription
                                        }
                                        duration={activeDisaster.duration}
                                        accentClassName={
                                            activeDisaster.accentClassName
                                        }
                                    />

                                    <GlassPanel className="p-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                                                    Audio Guide
                                                </p>
                                                <h3
                                                    className="mt-3 text-xl font-semibold text-white"
                                                    style={displayFont}
                                                >
                                                    Listen to the{' '}
                                                    {activeDisaster.title}{' '}
                                                    response reminder
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    playGuide(activeDisaster)
                                                }
                                                className="inline-flex size-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white transition duration-300 hover:scale-105 hover:bg-white/[0.1]"
                                            >
                                                {speakingGuideId ===
                                                activeDisaster.id ? (
                                                    <Pause className="size-5" />
                                                ) : (
                                                    <Volume2 className="size-5" />
                                                )}
                                            </button>
                                        </div>

                                        <p className="mt-4 text-sm leading-7 text-slate-300">
                                            Use the built-in voice guide for a
                                            quick spoken reminder while
                                            reviewing the response checklist.
                                        </p>

                                        <div className="mt-5 h-1.5 rounded-full bg-white/8">
                                            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-300 via-orange-400 to-amber-200" />
                                        </div>
                                    </GlassPanel>

                                    <GlassPanel className="p-6">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="size-5 text-emerald-300" />
                                            <h3
                                                className="text-xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Safety Tip
                                            </h3>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-slate-300">
                                            {activeDisaster.safetyTip}
                                        </p>
                                    </GlassPanel>

                                    <GlassPanel className="p-6">
                                        <div className="flex items-center gap-3">
                                            <Package className="size-5 text-orange-300" />
                                            <h3
                                                className="text-xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Recommended Emergency Kit
                                            </h3>
                                        </div>

                                        <div className="mt-5 grid gap-3">
                                            {activeDisaster.emergencyKit.map(
                                                (item) => (
                                                    <div
                                                        key={item}
                                                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                                                    >
                                                        <CircleCheckBig className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                                                        <span className="text-sm leading-6 text-slate-300">
                                                            {item}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </GlassPanel>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="public-light-section border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <SectionHeading
                                eyebrow="Disaster Awareness Media"
                                title="Watch, listen, and learn before disaster strikes"
                                description="Preparedness is easier to retain when residents can explore short visual briefings, reminder guides, and practical media built around real evacuation actions."
                            />

                            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,380px)]">
                                <div className="grid gap-6">
                                    <MediaPreviewCard
                                        label="Featured preparedness video"
                                        title="Resident awareness command briefing"
                                        description="A highlighted overview connecting alerts, disaster education, barangay response, and QR-based evacuation accountability."
                                        duration={awarenessClips[0].duration}
                                        accentClassName="from-blue-400/28 via-orange-400/10 to-slate-950"
                                    />

                                    <div className="grid gap-5 md:grid-cols-2">
                                        {awarenessClips.slice(1).map((clip) => (
                                            <MediaPreviewCard
                                                key={clip.title}
                                                label="Awareness clip"
                                                title={clip.title}
                                                description={clip.description}
                                                duration={clip.duration}
                                                accentClassName="from-orange-300/24 via-red-500/10 to-slate-950"
                                                compact
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <GlassPanel className="p-6">
                                        <div className="flex items-center gap-3">
                                            <Volume2 className="size-5 text-orange-300" />
                                            <h3
                                                className="text-2xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Audio Reminder Guides
                                            </h3>
                                        </div>
                                        <div className="mt-5 grid gap-3">
                                            {disasterGuides.map((guide) => (
                                                <button
                                                    key={guide.id}
                                                    type="button"
                                                    onClick={() =>
                                                        activateDisaster(
                                                            guide.id,
                                                            {
                                                                speak: true,
                                                                scroll: true,
                                                            },
                                                        )
                                                    }
                                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition duration-300 hover:bg-white/[0.08]"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-white">
                                                            {guide.title}{' '}
                                                            reminder guide
                                                        </p>
                                                        <p className="mt-1 text-xs tracking-[0.2em] text-slate-400 uppercase">
                                                            Voice briefing
                                                        </p>
                                                    </div>
                                                    {speakingGuideId ===
                                                    guide.id ? (
                                                        <Pause className="size-4 text-orange-200" />
                                                    ) : (
                                                        <Volume2 className="size-4 text-slate-300" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </GlassPanel>

                                    <GlassPanel className="p-6">
                                        <div className="flex items-center gap-3">
                                            <BadgeAlert className="size-5 text-orange-300" />
                                            <h3
                                                className="text-xl font-semibold text-white"
                                                style={displayFont}
                                            >
                                                Learn More Before Disaster
                                                Strikes
                                            </h3>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-slate-300">
                                            EvaQReady supports community
                                            awareness by combining disaster
                                            education, multimedia reminders, and
                                            evacuation-ready guidance in one
                                            place for residents and local
                                            responders.
                                        </p>
                                    </GlassPanel>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="public-light-section-alt border-t border-white/8 px-4 py-24 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-6xl">
                            <GlassPanel className="overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
                                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.28em] text-orange-300 uppercase">
                                            Call To Action
                                        </p>
                                        <h2
                                            className="mt-4 text-3xl font-semibold text-white sm:text-4xl"
                                            style={displayFont}
                                        >
                                            Be Prepared. Register in EvaQReady
                                            Today.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                                            Keep residents informed, improve
                                            evacuation readiness, and stay
                                            connected to real-time safety
                                            guidance before emergencies
                                            escalate.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {canRegister ? (
                                            <Button
                                                asChild
                                                size="lg"
                                                className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                <Link href={register()}>
                                                    Create Account
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="lg"
                                                onClick={() =>
                                                    setIsLoginOpen(true)
                                                }
                                                className="h-12 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 text-base font-semibold text-slate-950 shadow-[0_18px_35px_rgba(251,146,60,0.35)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-200"
                                            >
                                                Create Account
                                            </Button>
                                        )}

                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-base text-white shadow-none transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={home()}>
                                                Back to Home
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </GlassPanel>
                        </div>
                    </section>
                </main>

                <footer className="public-footer-shell border-t border-white/8 px-4 py-14 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-slate-950 shadow-[0_10px_25px_rgba(251,146,60,0.4)]">
                                    EQ
                                </span>
                                <div>
                                    <p
                                        className="text-xl font-semibold text-white"
                                        style={displayFont}
                                    >
                                        EvaQReady
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Smart evacuation awareness for residents
                                        and communities
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                                A community-focused preparedness platform that
                                combines guided awareness, multimedia safety
                                reminders, and QR-ready evacuation education in
                                one modern interface.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                Quick Links
                            </p>
                            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                                <a
                                    href={home.url()}
                                    className="hover:text-white"
                                >
                                    Home
                                </a>
                                <a
                                    href="#disaster-guides"
                                    className="hover:text-white"
                                >
                                    Disaster Guides
                                </a>
                                <a
                                    href={contactRoute.url()}
                                    className="hover:text-white"
                                >
                                    Contact
                                </a>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold tracking-[0.22em] text-orange-300 uppercase">
                                Social Links
                            </p>
                            <div className="mt-4 grid gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-300 hover:text-white"
                                    >
                                        {link.label}
                                        <ArrowRight className="size-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 max-w-7xl border-t border-white/8 pt-6 text-sm text-slate-500">
                        Copyright 2026 EvaQReady. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
