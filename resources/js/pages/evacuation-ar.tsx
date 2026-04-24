import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUp,
    Camera,
    Compass,
    LocateFixed,
    MapPinned,
    Navigation,
    RotateCcw,
    ShieldCheck,
    TriangleAlert,
} from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { formatNumber } from '@/components/console-panels';
import type { DashboardPageProps } from '@/components/console-panels';
import { Button } from '@/components/ui/button';
import {
    bearingBetween,
    compassDirectionLabel,
    distanceKmBetween,
    distanceLabel,
    estimateTravelMinutes,
    normalizeDegrees,
    shortestAngleDelta,
    turnInstruction,
} from '@/lib/evacuation-navigation';
import { cn } from '@/lib/utils';
import {
    mapMonitoring as mapMonitoringRoute,
} from '@/routes';

type MapMarker =
    DashboardPageProps['dashboard']['mapMonitoring']['markers'][number];
type UserPosition = {
    accuracy: number | null;
    latitude: number;
    longitude: number;
    recordedAt: number;
};
type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
    webkitCompassAccuracy?: number;
    webkitCompassHeading?: number;
};
type DeviceOrientationPermissionRequester = typeof DeviceOrientationEvent & {
    requestPermission?: (absolute?: boolean) => Promise<'denied' | 'granted'>;
};

function toCenterStatusLabel(status: MapMarker['status']): string {
    return status === 'Available' ? 'Open' : status;
}

function compassAccuracyLabel(accuracy: number | null): string {
    if (accuracy === null) {
        return 'Standard';
    }

    if (accuracy <= 10) {
        return 'High';
    }

    if (accuracy <= 20) {
        return 'Medium';
    }

    return 'Low';
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was denied. Turn it on so the arrow can point to the nearest center.';
        case error.POSITION_UNAVAILABLE:
            return 'Current position is unavailable. Move to a clearer outdoor spot and try again.';
        case error.TIMEOUT:
            return 'Location lookup timed out. Restart the guidance to try again.';
        default:
            return 'Unable to capture your current position right now.';
    }
}

function headingFromOrientationEvent(
    event: DeviceOrientationEventWithCompass,
): { accuracy: number | null; heading: number | null } {
    if (typeof event.webkitCompassHeading === 'number') {
        return {
            accuracy:
                typeof event.webkitCompassAccuracy === 'number'
                    ? event.webkitCompassAccuracy
                    : null,
            heading: normalizeDegrees(event.webkitCompassHeading),
        };
    }

    if (typeof event.alpha === 'number') {
        return {
            accuracy: null,
            heading: normalizeDegrees(360 - event.alpha),
        };
    }

    return {
        accuracy: null,
        heading: null,
    };
}

async function requestOrientationPermission(): Promise<boolean> {
    const orientationRequester =
        window.DeviceOrientationEvent as DeviceOrientationPermissionRequester;

    if (typeof orientationRequester.requestPermission !== 'function') {
        return true;
    }

    const permissionState = await orientationRequester.requestPermission(true);

    return permissionState === 'granted';
}

export default function EvacuationAr({ dashboard }: DashboardPageProps) {
    const markers = dashboard.mapMonitoring.markers;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const locationWatchIdRef = useRef<number | null>(null);
    const [cameraState, setCameraState] = useState<
        'error' | 'idle' | 'ready' | 'starting'
    >('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [heading, setHeading] = useState<number | null>(null);
    const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
    const [location, setLocation] = useState<UserPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [orientationEnabled, setOrientationEnabled] = useState(false);
    const [orientationError, setOrientationError] = useState<string | null>(
        null,
    );
    const captureNeedsSecureContext =
        typeof window !== 'undefined' ? !window.isSecureContext : false;

    function stopCameraStream(): void {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const video = videoRef.current;

        if (video !== null && video.srcObject !== null) {
            video.srcObject = null;
        }
    }

    function stopLocationWatch(): void {
        if (locationWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
            locationWatchIdRef.current = null;
        }
    }

    const handleOrientationUpdate = useEffectEvent(
        (event: DeviceOrientationEventWithCompass) => {
            const nextHeading = headingFromOrientationEvent(event);

            if (nextHeading.heading === null) {
                return;
            }

            setHeading(nextHeading.heading);
            setHeadingAccuracy(nextHeading.accuracy);
            setOrientationError(null);
        },
    );

    useEffect(() => {
        if (!orientationEnabled) {
            return;
        }

        const listener = (event: Event) => {
            handleOrientationUpdate(event as DeviceOrientationEventWithCompass);
        };

        window.addEventListener(
            'deviceorientationabsolute',
            listener as EventListener,
            true,
        );
        window.addEventListener(
            'deviceorientation',
            listener as EventListener,
            true,
        );

        return () => {
            window.removeEventListener(
                'deviceorientationabsolute',
                listener as EventListener,
                true,
            );
            window.removeEventListener(
                'deviceorientation',
                listener as EventListener,
                true,
            );
        };
    }, [orientationEnabled]);

    useEffect(() => {
        const video = videoRef.current;

        return () => {
            if (locationWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }

            streamRef.current?.getTracks().forEach((track) => track.stop());

            if (video !== null && video.srcObject !== null) {
                video.srcObject = null;
            }
        };
    }, []);

    async function startGuidance(): Promise<void> {
        if (captureNeedsSecureContext) {
            setCameraError(
                'Camera, GPS, and compass access need HTTPS or localhost before this AR guide can start.',
            );
            setCameraState('error');

            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('This browser cannot open the camera stream.');
            setCameraState('error');

            return;
        }

        setCameraState('starting');
        setCameraError(null);
        setLocationError(null);
        setOrientationError(null);
        setHeading(null);
        setHeadingAccuracy(null);

        try {
            stopCameraStream();

            const cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        ideal: 'environment',
                    },
                },
            });

            streamRef.current = cameraStream;

            const video = videoRef.current;

            if (video !== null) {
                video.srcObject = cameraStream;
                await video.play().catch(() => {});
            }
        } catch {
            setCameraError(
                'Camera access was blocked. Allow camera permission to show the live arrow overlay.',
            );
            setCameraState('error');

            return;
        }

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser.');
        } else {
            stopLocationWatch();

            locationWatchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        accuracy: position.coords.accuracy,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        recordedAt: position.timestamp,
                    });
                    setLocationError(null);
                },
                (error) => {
                    setLocationError(geolocationErrorMessage(error));
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 15000,
                },
            );
        }

        if (typeof window.DeviceOrientationEvent === 'undefined') {
            setOrientationEnabled(false);
            setOrientationError(
                'Compass-based heading is not supported on this device or browser.',
            );
        } else {
            try {
                const orientationGranted = await requestOrientationPermission();

                if (orientationGranted) {
                    setOrientationEnabled(true);
                } else {
                    setOrientationEnabled(false);
                    setOrientationError(
                        'Compass access was denied. The camera can stay open, but the arrow will not rotate.',
                    );
                }
            } catch {
                setOrientationEnabled(false);
                setOrientationError(
                    'Compass access could not be enabled on this device.',
                );
            }
        }

        setCameraState('ready');
    }

    function stopGuidance(): void {
        stopLocationWatch();
        stopCameraStream();
        setCameraState('idle');
        setHeading(null);
        setHeadingAccuracy(null);
        setLocation(null);
        setLocationError(null);
        setOrientationEnabled(false);
        setOrientationError(null);
        setCameraError(null);
    }

    const availableMarkers = markers.filter(
        (marker) => marker.status !== 'Full',
    );
    const routeCandidates =
        availableMarkers.length > 0 ? availableMarkers : markers;
    const nearestCenter =
        location === null
            ? (routeCandidates[0] ?? null)
            : routeCandidates.reduce<MapMarker | null>((closest, marker) => {
                  if (closest === null) {
                      return marker;
                  }

                  return distanceKmBetween(
                      location.latitude,
                      location.longitude,
                      marker.latitude,
                      marker.longitude,
                  ) <
                      distanceKmBetween(
                          location.latitude,
                          location.longitude,
                          closest.latitude,
                          closest.longitude,
                      )
                      ? marker
                      : closest;
              }, null);
    const bearingToCenter =
        location !== null && nearestCenter !== null
            ? bearingBetween(
                  location.latitude,
                  location.longitude,
                  nearestCenter.latitude,
                  nearestCenter.longitude,
              )
            : null;
    const arrowRotation =
        heading !== null && bearingToCenter !== null
            ? shortestAngleDelta(heading, bearingToCenter)
            : null;
    const routeDistanceKm =
        location !== null && nearestCenter !== null
            ? distanceKmBetween(
                  location.latitude,
                  location.longitude,
                  nearestCenter.latitude,
                  nearestCenter.longitude,
              )
            : null;
    const routeMinutes =
        routeDistanceKm === null
            ? null
            : estimateTravelMinutes(routeDistanceKm);
    const guidanceInstruction = turnInstruction(arrowRotation);
    const systemReadiness = [
        {
            detail:
                cameraState === 'ready'
                    ? 'Live rear-camera feed is active.'
                    : 'Camera is waiting for permission.',
            isReady: cameraState === 'ready',
            label: 'Camera',
        },
        {
            detail:
                location !== null
                    ? `Accuracy about ${Math.round(location.accuracy ?? 0)} m.`
                    : 'Waiting for a GPS lock.',
            isReady: location !== null,
            label: 'Location',
        },
        {
            detail:
                heading !== null
                    ? `${compassDirectionLabel(heading)} heading with ${compassAccuracyLabel(headingAccuracy)} confidence.`
                    : 'Waiting for compass calibration.',
            isReady: heading !== null,
            label: 'Compass',
        },
    ] as const;

    return (
        <>
            <Head title="AR Evacuation Guide" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <section className="rounded-[30px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(240,249,255,0.98)_100%)] p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.96)_100%)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                Camera Guidance
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                AR arrow toward the nearest evacuation center
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Open the rear camera, lock your GPS, and rotate
                                your phone until the arrow lines up with the
                                nearest available center.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-2xl"
                            >
                                <Link href={mapMonitoringRoute()}>
                                    <ArrowLeft className="size-4" />
                                    Back to Map
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                className="rounded-2xl"
                                onClick={() => {
                                    void startGuidance();
                                }}
                                disabled={cameraState === 'starting'}
                            >
                                <Camera className="size-4" />
                                {cameraState === 'starting'
                                    ? 'Starting...'
                                    : cameraState === 'ready'
                                      ? 'Restart Guidance'
                                      : 'Start Guidance'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-2xl"
                                onClick={stopGuidance}
                                disabled={cameraState === 'idle'}
                            >
                                <RotateCcw className="size-4" />
                                Stop
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_380px]">
                    <div className="relative min-h-[620px] overflow-hidden rounded-[34px] border border-slate-200/70 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.24)] dark:border-slate-800">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={cn(
                                'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                                cameraState === 'ready'
                                    ? 'opacity-100'
                                    : 'opacity-0',
                            )}
                        />

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.08)_24%,rgba(2,6,23,0.42)_100%)]" />

                        {cameraState !== 'ready' ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                <div className="rounded-full border border-white/10 bg-white/8 p-6 text-white shadow-[0_0_40px_rgba(56,189,248,0.24)] backdrop-blur-md">
                                    <Camera className="size-14" />
                                </div>
                                <h2 className="mt-6 text-2xl font-semibold text-white">
                                    Open your camera to start the live arrow
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200">
                                    This page needs camera, location, and
                                    compass access. For the cleanest arrow
                                    guidance, stand outdoors or near an open
                                    doorway and keep the phone upright.
                                </p>
                                {captureNeedsSecureContext ? (
                                    <div className="mt-5 rounded-[22px] border border-amber-400/35 bg-amber-500/12 px-5 py-4 text-sm leading-6 text-amber-100">
                                        Open this app from `https://` or
                                        `localhost` so the browser will allow
                                        camera and GPS permissions.
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
                            {systemReadiness.map((system) => (
                                <div
                                    key={system.label}
                                    className={cn(
                                        'rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur-md',
                                        system.isReady
                                            ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-50'
                                            : 'border-white/12 bg-white/8 text-slate-100',
                                    )}
                                >
                                    {system.label}
                                </div>
                            ))}
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                            <div className="relative flex flex-col items-center gap-4">
                                <div className="absolute inset-[-18px] animate-pulse rounded-full border border-cyan-300/18" />
                                <div className="relative flex size-48 items-center justify-center rounded-full border border-white/12 bg-slate-950/38 shadow-[0_0_50px_rgba(56,189,248,0.24)] backdrop-blur-md">
                                    <div className="absolute inset-5 rounded-full border border-white/10" />
                                    <ArrowUp
                                        className={cn(
                                            'size-28 text-white drop-shadow-[0_0_24px_rgba(125,211,252,0.55)] transition-transform duration-300',
                                            arrowRotation === null &&
                                                'animate-pulse text-amber-200',
                                        )}
                                        style={{
                                            transform: `rotate(${arrowRotation ?? 0}deg)`,
                                        }}
                                    />
                                </div>

                                <div className="max-w-md rounded-[26px] border border-white/10 bg-slate-950/52 px-5 py-4 text-center text-white backdrop-blur-md">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-cyan-100 uppercase">
                                        Direction Cue
                                    </p>
                                    <p className="mt-2 text-xl font-semibold">
                                        {nearestCenter?.name ??
                                            'Waiting for the nearest center'}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-200">
                                        {guidanceInstruction}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-x-4 bottom-4 grid gap-3 lg:grid-cols-3">
                            <div className="rounded-[24px] border border-white/10 bg-slate-950/52 px-4 py-3 text-white backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase">
                                    Heading
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {heading === null
                                        ? 'Awaiting compass'
                                        : `${compassDirectionLabel(heading)} ${Math.round(heading)}°`}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-slate-950/52 px-4 py-3 text-white backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase">
                                    Distance
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {routeDistanceKm === null
                                        ? 'Waiting for GPS'
                                        : distanceLabel(routeDistanceKm)}
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-slate-950/52 px-4 py-3 text-white backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase">
                                    ETA
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {routeMinutes === null
                                        ? 'Pending'
                                        : `${routeMinutes} min`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-[30px] border border-slate-200/70 bg-card p-5 shadow-sm md:p-6 dark:border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-700 dark:text-sky-300">
                                <MapPinned className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                    Guidance Status
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    The route prefers the nearest center that is
                                    not marked full in the monitoring data.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {systemReadiness.map((system) => (
                                <div
                                    key={system.label}
                                    className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-foreground">
                                            {system.label}
                                        </p>
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-1 text-xs font-semibold',
                                                system.isReady
                                                    ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300'
                                                    : 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
                                            )}
                                        >
                                            {system.isReady
                                                ? 'Ready'
                                                : 'Waiting'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {system.detail}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {nearestCenter !== null ? (
                            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] p-5 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(135deg,#0f172a_0%,#111827_100%)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-xl font-semibold text-foreground">
                                                {nearestCenter.name}
                                            </p>
                                            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300">
                                                {toCenterStatusLabel(
                                                    nearestCenter.status,
                                                )}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Barangay {nearestCenter.barangay}
                                        </p>
                                    </div>
                                    <div className="flex size-14 items-center justify-center rounded-[20px] border border-white/60 bg-white/80 text-lg font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
                                        {nearestCenter.imageLabel}
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/75">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Bearing
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {bearingToCenter === null
                                                ? 'Pending'
                                                : `${compassDirectionLabel(bearingToCenter)} ${Math.round(bearingToCenter)}°`}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/75">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Available Slots
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {formatNumber(
                                                nearestCenter.availableSlots,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/75">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            Distance
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {routeDistanceKm === null
                                                ? 'Waiting for GPS'
                                                : distanceLabel(
                                                      routeDistanceKm,
                                                  )}
                                        </p>
                                    </div>
                                    <div className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/75">
                                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                            ETA
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {routeMinutes === null
                                                ? 'Pending'
                                                : `${routeMinutes} min`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                No mapped evacuation center is available in the
                                current dashboard data.
                            </div>
                        )}

                        {cameraError || locationError || orientationError ? (
                            <div className="mt-6 space-y-3">
                                {[cameraError, locationError, orientationError]
                                    .filter(
                                        (message): message is string =>
                                            message !== null,
                                    )
                                    .map((message) => (
                                        <div
                                            key={message}
                                            className="rounded-[22px] border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
                                        >
                                            {message}
                                        </div>
                                    ))}
                            </div>
                        ) : null}

                        <div className="mt-6 space-y-3">
                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <LocateFixed className="size-4" />
                                    <p className="font-semibold">
                                        Position Lock
                                    </p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {location === null
                                        ? 'Waiting for the first location sample.'
                                        : `Last update at ${new Intl.DateTimeFormat(
                                              'en-PH',
                                              {
                                                  hour: 'numeric',
                                                  minute: '2-digit',
                                                  second: '2-digit',
                                              },
                                          ).format(
                                              new Date(location.recordedAt),
                                          )}.`}
                                </p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <Compass className="size-4" />
                                    <p className="font-semibold">
                                        Compass Calibration
                                    </p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {heading === null
                                        ? 'Rotate the phone slowly in a figure-eight motion if the arrow does not respond.'
                                        : `Current heading is ${compassDirectionLabel(heading)} with ${compassAccuracyLabel(headingAccuracy)} accuracy.`}
                                </p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <Navigation className="size-4" />
                                    <p className="font-semibold">Route Logic</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {availableMarkers.length > 0
                                        ? 'Centers already marked Full are skipped so the arrow favors the nearest available destination.'
                                        : 'All mapped centers are currently full, so the arrow falls back to the absolute nearest site.'}
                                </p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center gap-2 text-foreground">
                                    <ShieldCheck className="size-4" />
                                    <p className="font-semibold">
                                        Command Note
                                    </p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {dashboard.mapMonitoring.meta.note}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                            Hold the phone upright, keep the center arrow in
                            front of you, and use the map page for a wider
                            planning view if you need to verify center status.
                        </div>

                        {captureNeedsSecureContext ? (
                            <div className="mt-4 rounded-[22px] border border-rose-300/60 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100">
                                Browser sensors are blocked outside secure
                                contexts. Switch to `https://` or `localhost`
                                before using this page.
                            </div>
                        ) : null}
                    </aside>
                </section>

                <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Operational Centers
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                            {formatNumber(markers.length)}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-sky-200/60 bg-sky-50/70 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/25">
                        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                            <Navigation className="size-4" />
                            <p className="text-xs tracking-[0.18em] uppercase">
                                AR Destination
                            </p>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                            {nearestCenter?.name ?? 'Waiting for GPS'}
                        </p>
                    </div>
                    <div className="rounded-[24px] border border-amber-200/60 bg-amber-50/70 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/25">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <TriangleAlert className="size-4" />
                            <p className="text-xs tracking-[0.18em] uppercase">
                                Guidance Reminder
                            </p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground">
                            This arrow is a live field aid. Use local road
                            awareness and responder instructions while moving to
                            the center.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}

EvacuationAr.layout = {
    breadcrumbs: [
        {
            title: 'Map Monitoring',
            href: mapMonitoringRoute(),
        },
        {
            title: 'AR Guide',
            href: mapMonitoringRoute(),
        },
    ],
};
