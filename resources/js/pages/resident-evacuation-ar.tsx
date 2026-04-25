import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUp,
    Camera,
    ChevronRight,
    Compass,
    LocateFixed,
    MapPinned,
    Navigation,
    Phone,
    RotateCcw,
    ShieldCheck,
    TriangleAlert,
    Volume2,
} from 'lucide-react';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
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
import resident from '@/routes/resident';

type ResidentCenter = {
    address: string;
    availableSlots: number;
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

type GuideLocation = {
    address: string;
    label: string;
    latitude: number;
    longitude: number;
    x: number;
    y: number;
};

type ResidentEvacuationArProps = {
    arGuide: {
        centers: ResidentCenter[];
        currentLocation: GuideLocation | null;
        hazardZone: string;
        nearestCenter: ResidentCenter | null;
        residentName: string;
    };
};

type UserPosition = {
    accuracy: number | null;
    latitude: number;
    longitude: number;
    recordedAt: number;
};

type GeoPoint = {
    latitude: number;
    longitude: number;
};

type MiniMapTile = {
    key: string;
    url: string;
};

type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
    webkitCompassAccuracy?: number;
    webkitCompassHeading?: number;
};

type DeviceOrientationPermissionRequester = typeof DeviceOrientationEvent & {
    requestPermission?: (absolute?: boolean) => Promise<'denied' | 'granted'>;
};
type CameraLensMode = 'fallback' | 'rear' | 'unknown';
type OrientationPose = {
    heading: number | null;
    pitch: number | null;
    roll: number | null;
};

const numberFormatter = new Intl.NumberFormat('en-PH');
const arChevronSteps = [0, 1, 2] as const;
const defaultMiniMapCenter = {
    latitude: 6.9548,
    longitude: 126.2282,
};
const depthGridLines = [0, 1, 2, 3, 4] as const;
const depthVerticalLines = [0, 1, 2] as const;
const maxWebMercatorLatitude = 85.05112878;
const miniMapRouteDots = [0, 1, 2, 3, 4, 5, 6, 7] as const;
const miniMapTileOffsets = [-1, 0, 1] as const;
const miniMapTileSize = 256;
const miniMapTileZoom = 15;
const miniMapBlocks = [
    'left-[5%] top-[9%] h-20 w-36 rotate-[-18deg] rounded-[18px] bg-emerald-100/78',
    'left-[32%] top-[4%] h-24 w-44 rotate-[10deg] rounded-[22px] bg-lime-100/72',
    'right-[8%] top-[9%] h-20 w-40 rotate-[-8deg] rounded-[18px] bg-slate-50/86',
    'left-[10%] top-[47%] h-20 w-48 rotate-[12deg] rounded-[20px] bg-white/78',
    'right-[18%] top-[48%] h-24 w-44 rotate-[-14deg] rounded-[22px] bg-emerald-100/72',
] as const;
const miniMapRoadLines = [
    'left-[-8%] top-[28%] h-3 w-[76%] rotate-[-18deg]',
    'left-[22%] top-[56%] h-3 w-[76%] rotate-[8deg]',
    'left-[58%] top-[15%] h-3 w-[50%] rotate-[63deg]',
    'left-[2%] top-[76%] h-2 w-[70%] rotate-[-4deg]',
] as const;
const miniMapMinorRoadLines = [
    'left-[4%] top-[12%] h-1.5 w-[48%] rotate-[-28deg]',
    'left-[28%] top-[36%] h-1.5 w-[46%] rotate-[9deg]',
    'left-[66%] top-[34%] h-1.5 w-[38%] rotate-[-15deg]',
    'left-[22%] top-[10%] h-1.5 w-[55%] rotate-[64deg]',
] as const;
const miniMapWaterShapes = [
    'right-[-5%] top-[32%] h-24 w-48 rotate-[-10deg] rounded-[60%] bg-sky-200/78',
    'left-[-7%] top-[62%] h-20 w-36 rotate-[12deg] rounded-[55%] bg-cyan-100/72',
] as const;
const miniMapRoadLabels = [
    {
        className: 'left-[34%] top-[23%] rotate-[-18deg]',
        label: 'Dahican Road',
    },
    {
        className: 'right-[13%] top-[47%] rotate-[63deg]',
        label: 'Barangay Access',
    },
    {
        className: 'left-[17%] top-[66%] rotate-[-4deg]',
        label: 'Coastal Route',
    },
] as const;

function formatCount(value: number): string {
    return numberFormatter.format(value);
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

function normalizedLongitude(longitude: number): number {
    return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function longitudeToTileX(longitude: number, zoom: number): number {
    return ((normalizedLongitude(longitude) + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude: number, zoom: number): number {
    const clampedLatitude = clamp(
        latitude,
        -maxWebMercatorLatitude,
        maxWebMercatorLatitude,
    );
    const latitudeRadians = (clampedLatitude * Math.PI) / 180;

    return (
        ((1 -
            Math.log(
                Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians),
            ) /
                Math.PI) /
            2) *
        2 ** zoom
    );
}

function openStreetMapTileUrl(x: number, y: number, zoom: number): string {
    const tileCount = 2 ** zoom;
    const wrappedX = ((x % tileCount) + tileCount) % tileCount;
    const clampedY = clamp(y, 0, tileCount - 1);

    return `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${clampedY}.png`;
}

function miniMapTilesForCenter(center: GeoPoint): {
    offsetX: number;
    offsetY: number;
    tiles: MiniMapTile[];
} {
    const tileX = longitudeToTileX(center.longitude, miniMapTileZoom);
    const tileY = latitudeToTileY(center.latitude, miniMapTileZoom);
    const centerTileX = Math.floor(tileX);
    const centerTileY = Math.floor(tileY);
    const offsetX = (tileX - centerTileX) * miniMapTileSize;
    const offsetY = (tileY - centerTileY) * miniMapTileSize;

    return {
        offsetX,
        offsetY,
        tiles: miniMapTileOffsets.flatMap((yOffset) =>
            miniMapTileOffsets.map((xOffset) => {
                const x = centerTileX + xOffset;
                const y = centerTileY + yOffset;

                return {
                    key: `${miniMapTileZoom}-${x}-${y}`,
                    url: openStreetMapTileUrl(x, y, miniMapTileZoom),
                };
            }),
        ),
    };
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

function metersBetweenPoints(pointA: GeoPoint, pointB: GeoPoint): number {
    return (
        distanceKmBetween(
            pointA.latitude,
            pointA.longitude,
            pointB.latitude,
            pointB.longitude,
        ) * 1000
    );
}

function smoothLinearValue(
    previousValue: number | null,
    nextValue: number,
    weight: number,
): number {
    if (previousValue === null) {
        return nextValue;
    }

    return previousValue + (nextValue - previousValue) * weight;
}

function smoothHeadingValue(
    previousHeading: number | null,
    nextHeading: number,
): number {
    if (previousHeading === null) {
        return nextHeading;
    }

    const headingDelta = shortestAngleDelta(previousHeading, nextHeading);
    const weight = Math.abs(headingDelta) > 70 ? 0.42 : 0.18;

    return normalizeDegrees(previousHeading + headingDelta * weight);
}

function stableLocationFromPosition(
    previousLocation: UserPosition | null,
    position: GeolocationPosition,
): UserPosition {
    const nextLocation = {
        accuracy: position.coords.accuracy,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        recordedAt: position.timestamp,
    };

    if (previousLocation === null) {
        return nextLocation;
    }

    const movementMeters = metersBetweenPoints(previousLocation, nextLocation);
    const accuracyMeters =
        nextLocation.accuracy ?? previousLocation.accuracy ?? 12;
    const jitterThreshold = clamp(accuracyMeters * 0.35, 4, 18);

    if (movementMeters <= jitterThreshold) {
        return {
            ...previousLocation,
            accuracy: nextLocation.accuracy,
            recordedAt: nextLocation.recordedAt,
        };
    }

    return nextLocation;
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was denied. Turn it on so the arrow can point to the nearest center.';
        case error.POSITION_UNAVAILABLE:
            return 'Current position is unavailable. Move to a clearer outdoor spot and try again.';
        case error.TIMEOUT:
            return 'Location lookup timed out. Restart the guide to try again.';
        default:
            return 'Unable to capture your current position right now.';
    }
}

function orientationPoseFromEvent(event: DeviceOrientationEventWithCompass): {
    accuracy: number | null;
    heading: number | null;
    pitch: number | null;
    roll: number | null;
} {
    const pitch =
        typeof event.beta === 'number' ? clamp(event.beta, -80, 80) : null;
    const roll =
        typeof event.gamma === 'number' ? clamp(event.gamma, -80, 80) : null;

    if (typeof event.webkitCompassHeading === 'number') {
        return {
            accuracy:
                typeof event.webkitCompassAccuracy === 'number'
                    ? event.webkitCompassAccuracy
                    : null,
            heading: normalizeDegrees(event.webkitCompassHeading),
            pitch,
            roll,
        };
    }

    if (typeof event.alpha === 'number') {
        return {
            accuracy: null,
            heading: normalizeDegrees(360 - event.alpha),
            pitch,
            roll,
        };
    }

    return {
        accuracy: null,
        heading: null,
        pitch,
        roll,
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

async function requestPreferredCameraStream(): Promise<{
    lensMode: CameraLensMode;
    stream: MediaStream;
}> {
    const attempts = [
        {
            constraints: {
                audio: false,
                video: {
                    facingMode: {
                        exact: 'environment' as const,
                    },
                },
            },
            lensMode: 'rear' as const,
        },
        {
            constraints: {
                audio: false,
                video: {
                    facingMode: 'environment' as const,
                },
            },
            lensMode: 'rear' as const,
        },
        {
            constraints: {
                audio: false,
                video: {
                    facingMode: {
                        ideal: 'environment' as const,
                    },
                },
            },
            lensMode: 'rear' as const,
        },
        {
            constraints: {
                audio: false,
                video: true,
            },
            lensMode: 'fallback' as const,
        },
    ] as const;

    let lastError: unknown = null;

    for (const attempt of attempts) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                attempt.constraints,
            );
            const [videoTrack] = stream.getVideoTracks();
            const facingMode = videoTrack?.getSettings().facingMode;
            const lensMode =
                facingMode === 'environment' ? 'rear' : attempt.lensMode;

            return {
                lensMode,
                stream,
            };
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

function statusClassName(status: string): string {
    if (status === 'Open') {
        return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300';
    }

    if (status === 'Near Full') {
        return 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300';
    }

    return 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300';
}

export default function ResidentEvacuationAr({
    arGuide,
}: ResidentEvacuationArProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const locationWatchIdRef = useRef<number | null>(null);
    const orientationPoseRef = useRef<OrientationPose>({
        heading: null,
        pitch: null,
        roll: null,
    });
    const [cameraState, setCameraState] = useState<
        'error' | 'idle' | 'ready' | 'starting'
    >('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraLensMode, setCameraLensMode] =
        useState<CameraLensMode>('unknown');
    const [heading, setHeading] = useState<number | null>(null);
    const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
    const [devicePitch, setDevicePitch] = useState<number | null>(null);
    const [deviceRoll, setDeviceRoll] = useState<number | null>(null);
    const [location, setLocation] = useState<UserPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [locationState, setLocationState] = useState<
        'error' | 'idle' | 'locating' | 'ready'
    >('idle');
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

    function startLocationTracking(): void {
        if (captureNeedsSecureContext) {
            setLocationError(
                'Location access needs HTTPS or localhost before this AR guide can update your live position.',
            );
            setLocationState('error');

            return;
        }

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser.');
            setLocationState('error');

            return;
        }

        stopLocationWatch();
        setLocationError(null);
        setLocationState('locating');

        locationWatchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation((currentLocation) =>
                    stableLocationFromPosition(currentLocation, position),
                );
                setLocationError(null);
                setLocationState('ready');
            },
            (error) => {
                setLocationError(geolocationErrorMessage(error));
                setLocationState('error');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            },
        );
    }

    const handleOrientationUpdate = useEffectEvent(
        (event: DeviceOrientationEventWithCompass) => {
            const nextPose = orientationPoseFromEvent(event);
            const hasPoseSignal =
                nextPose.heading !== null ||
                nextPose.pitch !== null ||
                nextPose.roll !== null;

            if (nextPose.pitch !== null) {
                const smoothPitch = smoothLinearValue(
                    orientationPoseRef.current.pitch,
                    nextPose.pitch,
                    0.24,
                );

                orientationPoseRef.current.pitch = smoothPitch;
                setDevicePitch(smoothPitch);
            }

            if (nextPose.roll !== null) {
                const smoothRoll = smoothLinearValue(
                    orientationPoseRef.current.roll,
                    nextPose.roll,
                    0.24,
                );

                orientationPoseRef.current.roll = smoothRoll;
                setDeviceRoll(smoothRoll);
            }

            if (hasPoseSignal) {
                setOrientationError(null);
            }

            if (nextPose.heading === null) {
                return;
            }

            const smoothHeading = smoothHeadingValue(
                orientationPoseRef.current.heading,
                nextPose.heading,
            );

            orientationPoseRef.current.heading = smoothHeading;
            setHeading(smoothHeading);
            setHeadingAccuracy(nextPose.accuracy);
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
    }, [handleOrientationUpdate, orientationEnabled]);

    useEffect(() => {
        if (!orientationEnabled) {
            return;
        }

        if (heading !== null || devicePitch !== null || deviceRoll !== null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setOrientationError((currentError) => {
                if (currentError !== null) {
                    return currentError;
                }

                return 'Motion sensors are not sending compass or tilt data yet. Allow motion access, then move the phone gently.';
            });
        }, 2600);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [devicePitch, deviceRoll, heading, orientationEnabled]);

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
        if (location === null) {
            setLocationError(
                'Tap My location first so the guide can lock onto your current position before opening the AR workspace.',
            );

            return;
        }

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
        setCameraLensMode('unknown');
        setOrientationError(null);
        setHeading(null);
        setHeadingAccuracy(null);
        setDevicePitch(null);
        setDeviceRoll(null);
        orientationPoseRef.current = {
            heading: null,
            pitch: null,
            roll: null,
        };

        try {
            stopCameraStream();

            const { stream: cameraStream, lensMode } =
                await requestPreferredCameraStream();

            streamRef.current = cameraStream;
            setCameraLensMode(lensMode);

            const video = videoRef.current;

            if (video !== null) {
                video.srcObject = cameraStream;
                await video.play().catch(() => {});
            }
        } catch {
            setCameraError(
                'Camera access was blocked. Allow camera permission so the resident AR guide can open the rear camera.',
            );
            setCameraState('error');

            return;
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
        stopCameraStream();
        setCameraState('idle');
        setCameraLensMode('unknown');
        setHeading(null);
        setHeadingAccuracy(null);
        setDevicePitch(null);
        setDeviceRoll(null);
        orientationPoseRef.current = {
            heading: null,
            pitch: null,
            roll: null,
        };
        setOrientationEnabled(false);
        setOrientationError(null);
        setCameraError(null);
    }

    const availableCenters = arGuide.centers.filter(
        (center) => center.status !== 'Full' && center.availableSlots > 0,
    );
    const routeCandidates =
        availableCenters.length > 0 ? availableCenters : arGuide.centers;
    const guidancePosition = location ?? arGuide.currentLocation;
    const nearestCenter = useMemo(() => {
        if (routeCandidates.length === 0) {
            return null;
        }

        if (guidancePosition === null) {
            return arGuide.nearestCenter ?? routeCandidates[0] ?? null;
        }

        return routeCandidates.reduce<ResidentCenter | null>(
            (closest, center) => {
                if (closest === null) {
                    return center;
                }

                const centerDistance = distanceKmBetween(
                    guidancePosition.latitude,
                    guidancePosition.longitude,
                    center.latitude,
                    center.longitude,
                );
                const closestDistance = distanceKmBetween(
                    guidancePosition.latitude,
                    guidancePosition.longitude,
                    closest.latitude,
                    closest.longitude,
                );

                return centerDistance < closestDistance ? center : closest;
            },
            null,
        );
    }, [arGuide.nearestCenter, guidancePosition, routeCandidates]);
    const bearingToCenter =
        guidancePosition !== null && nearestCenter !== null
            ? bearingBetween(
                  guidancePosition.latitude,
                  guidancePosition.longitude,
                  nearestCenter.latitude,
                  nearestCenter.longitude,
              )
            : null;
    const arrowRotation =
        heading !== null && bearingToCenter !== null
            ? shortestAngleDelta(heading, bearingToCenter)
            : null;
    const routeDistanceKm =
        guidancePosition !== null && nearestCenter !== null
            ? distanceKmBetween(
                  guidancePosition.latitude,
                  guidancePosition.longitude,
                  nearestCenter.latitude,
                  nearestCenter.longitude,
              )
            : null;
    const routeMinutes =
        routeDistanceKm === null
            ? (nearestCenter?.etaMinutes ?? null)
            : estimateTravelMinutes(routeDistanceKm);
    const guidanceInstruction = turnInstruction(arrowRotation);
    const liveViewInstruction =
        arrowRotation === null ? 'Continue this way' : guidanceInstruction;
    const routeDistanceText =
        routeDistanceKm === null
            ? (nearestCenter?.distanceKm ?? 'Distance pending')
            : distanceLabel(routeDistanceKm);
    const routeEtaText =
        routeMinutes === null ? 'ETA pending' : `${routeMinutes} min`;
    const destinationLabel = nearestCenter?.name ?? 'Evacuation Center';
    const guidanceSource =
        location === null ? 'Waiting for My location' : 'Live GPS lock';
    const hasLiveLocation = location !== null;
    const miniMapCurrentPoint = {
        x: 50,
        y: 64,
    };
    const miniMapTilePoints: GeoPoint[] = [
        ...(guidancePosition === null
            ? []
            : [
                  {
                      latitude: guidancePosition.latitude,
                      longitude: guidancePosition.longitude,
                  },
              ]),
        ...(nearestCenter === null
            ? []
            : [
                  {
                      latitude: nearestCenter.latitude,
                      longitude: nearestCenter.longitude,
                  },
              ]),
    ];
    const miniMapTileCenter =
        miniMapTilePoints[0] ?? miniMapTilePoints[1] ?? defaultMiniMapCenter;
    const miniMapTileLayer = miniMapTilesForCenter(miniMapTileCenter);
    const miniMapTileLayerTransform = `translate(-${(miniMapTileSize + miniMapTileLayer.offsetX).toFixed(1)}px, -${(miniMapTileSize + miniMapTileLayer.offsetY).toFixed(1)}px)`;
    const miniMapSurfaceTransform =
        heading === null
            ? 'scale(1.16)'
            : `rotate(${-heading.toFixed(2)}deg) scale(1.16)`;
    const miniMapSurfaceTransformOrigin = `${miniMapCurrentPoint.x}% ${miniMapCurrentPoint.y}%`;
    const miniMapDestinationBearing =
        heading !== null && bearingToCenter !== null
            ? shortestAngleDelta(heading, bearingToCenter)
            : bearingToCenter;
    const isLocating = locationState === 'locating';
    const hasTiltData = devicePitch !== null || deviceRoll !== null;
    const overlayPitch = clamp(devicePitch ?? 0, -40, 40);
    const overlayRoll = clamp(deviceRoll ?? 0, -35, 35);
    const beaconOffsetX =
        arrowRotation === null ? 0 : clamp(arrowRotation * 1.55, -140, 140);
    const beaconDepth =
        routeDistanceKm === null
            ? 76
            : Math.round(
                  Math.max(34, 126 - Math.min(routeDistanceKm * 22, 88)),
              );
    const overlaySceneTransform = `rotateX(${(overlayPitch * -0.12).toFixed(2)}deg) rotateY(${(overlayRoll * 0.18).toFixed(2)}deg)`;
    const depthHorizonTransform = `translate3d(0, ${(overlayPitch * 1.45).toFixed(1)}px, 44px) rotateX(${(64 - overlayPitch * 0.55).toFixed(2)}deg) rotateZ(${(-overlayRoll * 0.4).toFixed(2)}deg)`;
    const arrowDiscTransform = `${arrowRotation === null ? '' : `rotateZ(${arrowRotation.toFixed(2)}deg) `}translate3d(0, ${(-overlayPitch * 0.75).toFixed(1)}px, 78px) rotateX(${(10 - overlayPitch * 0.28).toFixed(2)}deg) rotateY(${(overlayRoll * 0.45).toFixed(2)}deg)`;
    const destinationBeaconTransform = `translateX(calc(-50% + ${beaconOffsetX.toFixed(1)}px)) translateY(${(-overlayPitch * 0.9).toFixed(1)}px) translateZ(${beaconDepth}px)`;
    const savedCurrentPoint =
        arGuide.currentLocation === null
            ? null
            : {
                  x: arGuide.currentLocation.x,
                  y: arGuide.currentLocation.y,
              };
    const savedDestinationPoint =
        nearestCenter === null
            ? null
            : {
                  x: nearestCenter.x,
                  y: nearestCenter.y,
              };
    const miniMapDestinationPoint = (() => {
        if (miniMapDestinationBearing !== null) {
            const bearingRadians = (miniMapDestinationBearing * Math.PI) / 180;

            return {
                x: clamp(
                    miniMapCurrentPoint.x + Math.sin(bearingRadians) * 31,
                    16,
                    84,
                ),
                y: clamp(
                    miniMapCurrentPoint.y - Math.cos(bearingRadians) * 38,
                    16,
                    88,
                ),
            };
        }

        if (savedCurrentPoint !== null && savedDestinationPoint !== null) {
            return {
                x: clamp(
                    miniMapCurrentPoint.x +
                        (savedDestinationPoint.x - savedCurrentPoint.x) * 0.55,
                    16,
                    84,
                ),
                y: clamp(
                    miniMapCurrentPoint.y +
                        (savedDestinationPoint.y - savedCurrentPoint.y) * 0.55,
                    16,
                    88,
                ),
            };
        }

        return {
            x: 50,
            y: 30,
        };
    })();
    const miniMapRoutePointDenominator = Math.max(
        miniMapRouteDots.length - 1,
        1,
    );
    const miniMapRoutePoints = miniMapRouteDots.map((dot) => {
        const progress = dot / miniMapRoutePointDenominator;

        return {
            x:
                miniMapCurrentPoint.x +
                (miniMapDestinationPoint.x - miniMapCurrentPoint.x) * progress,
            y:
                miniMapCurrentPoint.y +
                (miniMapDestinationPoint.y - miniMapCurrentPoint.y) * progress,
        };
    });
    const cameraLensLabel =
        cameraLensMode === 'rear'
            ? 'Rear camera active'
            : cameraLensMode === 'fallback'
              ? 'Fallback camera active'
              : 'Camera lens pending';
    const tiltStatusLabel = hasTiltData
        ? `Pitch ${Math.round(overlayPitch)} deg / Roll ${Math.round(overlayRoll)} deg`
        : orientationError !== null
          ? 'Tilt unavailable'
          : orientationEnabled
            ? 'Move phone to sync tilt'
            : 'Allow motion access';
    const compassStatusDetail =
        heading !== null
            ? `${compassDirectionLabel(heading)} heading with ${compassAccuracyLabel(headingAccuracy)} confidence.`
            : orientationError !== null
              ? orientationError
              : hasTiltData
                ? 'Tilt is active, but compass heading is still unavailable. Rotate the phone slowly to calibrate.'
                : 'Waiting for compass permission or calibration.';
    const depthStatusDetail = hasTiltData
        ? `3D depth follows phone tilt with pitch ${Math.round(overlayPitch)} deg and roll ${Math.round(overlayRoll)} deg.`
        : orientationError !== null
          ? orientationError
          : '3D depth is waiting for tilt data from your phone sensors.';
    const systemReadiness = [
        {
            detail:
                cameraState === 'ready'
                    ? cameraLensMode === 'fallback'
                        ? 'The device fell back to its available camera because a rear lens was not exposed.'
                        : 'Rear camera feed is active.'
                    : 'Camera is waiting for permission.',
            isReady: cameraState === 'ready',
            label: 'Camera',
        },
        {
            detail:
                location !== null
                    ? `Accuracy about ${Math.round(location.accuracy ?? 0)} m.`
                    : locationError !== null
                      ? locationError
                      : locationState === 'locating'
                        ? 'Capturing a live GPS lock from your current position.'
                        : arGuide.currentLocation !== null
                          ? 'Tap My location to replace the saved household pin with your live GPS position.'
                          : 'Tap My location to request a GPS lock.',
            isReady: location !== null,
            label: 'Location',
        },
        {
            detail: compassStatusDetail,
            isReady: heading !== null,
            label: 'Compass',
        },
    ] as const;
    const errorMessages = [cameraError, locationError, orientationError].filter(
        (message): message is string => message !== null,
    );
    const readySystemCount = systemReadiness.filter(
        (system) => system.isReady,
    ).length;
    const fieldControlMessage = hasLiveLocation
        ? 'Live location locked. You can open or restart the AR camera now.'
        : locationError !== null
          ? locationError
          : isLocating
            ? 'Waiting for a live GPS lock before the AR workspace appears.'
            : 'Tap My location first so the guide follows your current position.';
    const lastLocationMessage =
        location !== null
            ? `Live update captured at ${new Intl.DateTimeFormat('en-PH', {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
              }).format(new Date(location.recordedAt))}.`
            : arGuide.currentLocation !== null
              ? `Saved household pin: ${arGuide.currentLocation.address}. Tap My location to refresh it before opening the AR workspace.`
              : 'Tap My location to capture your current position before opening the AR workspace.';
    const fieldNotes = [
        {
            detail: lastLocationMessage,
            icon: LocateFixed,
            label: 'Position Source',
        },
        {
            detail:
                heading === null
                    ? orientationError !== null
                        ? orientationError
                        : 'Keep the phone upright and rotate slowly if the arrow is waiting for calibration.'
                    : `Current heading is ${compassDirectionLabel(heading)} with ${compassAccuracyLabel(headingAccuracy)} accuracy.`,
            icon: Compass,
            label: 'Compass Status',
        },
        {
            detail: depthStatusDetail,
            icon: ArrowUp,
            label: '3D Depth',
        },
        {
            detail: 'Use the arrow as a field aid and follow barangay responder instructions while moving toward the center.',
            icon: ShieldCheck,
            label: 'Safety Note',
        },
    ] as const;

    return (
        <>
            <Head title="Resident AR Guide" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_26%),linear-gradient(140deg,#f8fbff_0%,#eff4fb_52%,#eef6ff_100%)] p-3 shadow-[0_28px_90px_rgba(148,163,184,0.16)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_26%),linear-gradient(140deg,#0f172a_0%,#111827_52%,#0b1224_100%)]">
                    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#182b68_0%,#1e40af_52%,#16244b_100%)] p-5 text-white shadow-[0_26px_70px_rgba(30,64,175,0.28)] dark:bg-[linear-gradient(180deg,#111c42_0%,#19327f_54%,#0f172a_100%)]">
                            <div className="rounded-[26px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-[0.28em] text-sky-100/80 uppercase">
                                    Guide Workspace
                                </p>
                                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                    Follow the nearest safe evacuation route
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-sky-100/80">
                                    A field-focused routing workspace for your
                                    live camera, compass, and center guidance.
                                </p>
                            </div>

                            <div className="mt-4 grid gap-3">
                                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                                    <p className="text-[11px] tracking-[0.22em] text-sky-100/70 uppercase">
                                        Resident
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {arGuide.residentName}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                                    <div className="flex items-center gap-2 text-sky-100/80">
                                        <Navigation className="size-4" />
                                        <p className="text-[11px] tracking-[0.22em] uppercase">
                                            Routing Target
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-semibold">
                                        {nearestCenter?.name ??
                                            'Waiting for center data'}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                                    <div className="flex items-center gap-2 text-amber-100/85">
                                        <TriangleAlert className="size-4" />
                                        <p className="text-[11px] tracking-[0.22em] uppercase">
                                            Hazard Zone
                                        </p>
                                    </div>
                                    <p className="mt-2 text-lg font-semibold">
                                        {arGuide.hazardZone}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-white/12 bg-white/8 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.24em] text-sky-100/75 uppercase">
                                            Field Controls
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-sky-100/70">
                                            Update your live position first,
                                            then launch or stop the AR route
                                            guide from this command rail.
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100/85">
                                        {cameraState === 'ready'
                                            ? 'Live'
                                            : cameraState === 'starting'
                                              ? 'Starting'
                                              : isLocating
                                                ? 'Locating'
                                                : hasLiveLocation
                                                  ? 'Locked'
                                                  : 'Standby'}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="justify-start rounded-[18px] border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
                                    >
                                        <Link href={resident.map()}>
                                            <ArrowLeft className="size-4" />
                                            Back to Map
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        className="justify-start rounded-[18px] bg-white text-slate-900 shadow-[0_14px_34px_rgba(255,255,255,0.16)] hover:bg-sky-50"
                                        onClick={startLocationTracking}
                                        disabled={isLocating}
                                    >
                                        <LocateFixed className="size-4" />
                                        {isLocating
                                            ? 'Locating...'
                                            : hasLiveLocation
                                              ? 'Refresh My location'
                                              : 'My location'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            hasLiveLocation
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'justify-start rounded-[18px]',
                                            hasLiveLocation
                                                ? 'bg-white text-slate-900 shadow-[0_14px_34px_rgba(255,255,255,0.16)] hover:bg-sky-50'
                                                : 'border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white',
                                        )}
                                        onClick={() => {
                                            void startGuidance();
                                        }}
                                        disabled={
                                            cameraState === 'starting' ||
                                            !hasLiveLocation ||
                                            isLocating
                                        }
                                    >
                                        <Camera className="size-4" />
                                        {cameraState === 'starting'
                                            ? 'Starting...'
                                            : cameraState === 'ready'
                                              ? 'Restart Guide'
                                              : 'Start AR Guide'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-start rounded-[18px] border-white/15 bg-white/8 text-white hover:bg-white/14 hover:text-white"
                                        onClick={stopGuidance}
                                        disabled={cameraState === 'idle'}
                                    >
                                        <RotateCcw className="size-4" />
                                        Stop AR
                                    </Button>
                                </div>
                                <p className="mt-3 text-xs leading-5 text-sky-100/70">
                                    {fieldControlMessage}
                                </p>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-white/12 bg-white/8 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.24em] text-sky-100/75 uppercase">
                                            System Status
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-sky-100/70">
                                            {readySystemCount} of{' '}
                                            {systemReadiness.length} guide
                                            systems are ready.
                                        </p>
                                    </div>
                                    <div className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                        {readySystemCount}/
                                        {systemReadiness.length}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {systemReadiness.map((system) => (
                                        <div
                                            key={system.label}
                                            className="rounded-[20px] border border-white/10 bg-black/10 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-white">
                                                    {system.label}
                                                </p>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-3 py-1 text-xs font-semibold',
                                                        system.isReady
                                                            ? 'bg-emerald-400/14 text-emerald-100 ring-1 ring-emerald-300/20'
                                                            : 'bg-white/10 text-sky-100/70 ring-1 ring-white/10',
                                                    )}
                                                >
                                                    {system.isReady
                                                        ? 'Ready'
                                                        : 'Waiting'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-sky-100/70">
                                                {system.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {captureNeedsSecureContext ? (
                                <div className="mt-4 rounded-[24px] border border-amber-300/26 bg-amber-400/14 px-4 py-3 text-sm leading-6 text-amber-50">
                                    Browser sensors require HTTPS or localhost
                                    before AR guidance can start.
                                </div>
                            ) : null}
                        </aside>

                        <div className="space-y-4">
                            {hasLiveLocation ? (
                                <>
                                    <section className="rounded-[30px] border border-white/55 bg-white/75 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.14)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/52">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                                    Live Guidance Stage
                                                </p>
                                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                                    Real-time route and
                                                    destination tracking
                                                </h2>
                                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                                    Keep the phone upright while
                                                    the workspace tracks camera,
                                                    compass, and your current
                                                    route snapshot.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <div className="rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-sm font-semibold text-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                                                    {nearestCenter?.name ??
                                                        'No center mapped'}
                                                </div>
                                                <div className="rounded-full border border-slate-200/80 bg-slate-50/90 px-4 py-2 text-sm text-muted-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                                                    {guidanceSource}
                                                </div>
                                                <div className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-300">
                                                    {routeMinutes === null
                                                        ? 'ETA pending'
                                                        : `${routeMinutes} min ETA`}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.18fr)_340px]">
                                        <div className="relative min-h-[640px] overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:min-h-[700px] lg:min-h-[720px] dark:border-slate-800">
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

                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.20),transparent_34%),linear-gradient(180deg,rgba(96,165,250,0.24)_0%,rgba(15,23,42,0.04)_36%,rgba(15,23,42,0.30)_100%)]" />
                                            <div
                                                className={cn(
                                                    'absolute inset-0 transition-opacity duration-300',
                                                    cameraState === 'ready'
                                                        ? 'opacity-0'
                                                        : 'opacity-100',
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,#c7e7f7_0%,#d9f2d8_38%,#6b7280_39%,#8b949e_100%)]" />
                                                <div className="absolute top-[34%] left-1/2 h-[72%] w-[54%] -translate-x-1/2 rounded-t-[100%] bg-[linear-gradient(90deg,#757d87_0%,#9aa2ac_50%,#737b86_100%)] shadow-[0_-20px_90px_rgba(15,23,42,0.18)]" />
                                                <div className="absolute top-[22%] left-[3%] h-[30%] w-[36%] rounded-full bg-emerald-500/35 blur-2xl" />
                                                <div className="absolute top-[17%] right-[8%] h-[34%] w-[34%] rounded-full bg-lime-500/30 blur-2xl" />
                                            </div>

                                            {cameraState !== 'ready' ? (
                                                <div className="absolute inset-x-6 top-[22%] z-20 mx-auto flex max-w-xl flex-col items-center rounded-[28px] border border-white/16 bg-slate-950/58 px-6 py-7 text-center text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur-md">
                                                    <div className="rounded-full border border-white/10 bg-white/8 p-5 shadow-[0_0_44px_rgba(56,189,248,0.24)]">
                                                        <Camera className="size-14" />
                                                    </div>
                                                    <h3 className="mt-6 text-2xl font-semibold text-white">
                                                        Start the camera for
                                                        Live View
                                                    </h3>
                                                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200">
                                                        Your live GPS lock is
                                                        ready. Start the camera
                                                        to place the turn card,
                                                        blue arrows, and bottom
                                                        mini-map over your
                                                        surroundings.
                                                    </p>
                                                </div>
                                            ) : null}

                                            <div className="absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="w-fit rounded-full border border-cyan-300/18 bg-slate-950/58 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                                                        3D AR depth overlay
                                                    </div>
                                                    <div className="hidden flex-wrap gap-2 lg:flex">
                                                        <div className="rounded-full border border-white/10 bg-slate-950/54 px-4 py-2 text-sm text-slate-200 backdrop-blur-md">
                                                            {cameraLensLabel}
                                                        </div>
                                                        <div className="rounded-full border border-white/10 bg-slate-950/54 px-4 py-2 text-sm text-slate-200 backdrop-blur-md">
                                                            {tiltStatusLabel}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="flex size-14 items-center justify-center rounded-full border border-white/70 bg-white/92 text-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.24)] backdrop-blur-md"
                                                    aria-label="Play spoken guidance"
                                                >
                                                    <Volume2 className="size-7" />
                                                </button>
                                            </div>

                                            <div className="absolute inset-0 overflow-hidden [perspective:1200px]">
                                                <div
                                                    className="absolute inset-0 [transform-style:preserve-3d]"
                                                    style={{
                                                        transform:
                                                            overlaySceneTransform,
                                                    }}
                                                >
                                                    <div
                                                        className="absolute inset-x-[9%] top-[28%] h-48 [transform-origin:center_center] rounded-[36px] border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.14)_0%,rgba(8,47,73,0.10)_34%,rgba(2,6,23,0.02)_100%)] shadow-[0_0_70px_rgba(8,145,178,0.10)] [transform-style:preserve-3d]"
                                                        style={{
                                                            transform:
                                                                depthHorizonTransform,
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.12),transparent_55%)]" />
                                                        {depthGridLines.map(
                                                            (line) => (
                                                                <div
                                                                    key={`depth-grid-${line}`}
                                                                    className="absolute inset-x-6 border-t border-cyan-200/22"
                                                                    style={{
                                                                        top: `${18 + line * 17}%`,
                                                                    }}
                                                                />
                                                            ),
                                                        )}
                                                        {depthVerticalLines.map(
                                                            (line) => (
                                                                <div
                                                                    key={`depth-vertical-${line}`}
                                                                    className="absolute inset-y-5 border-l border-cyan-100/14"
                                                                    style={{
                                                                        left: `${26 + line * 24}%`,
                                                                    }}
                                                                />
                                                            ),
                                                        )}
                                                        <div className="absolute inset-x-10 top-[44%] h-px bg-cyan-100/52 shadow-[0_0_18px_rgba(125,211,252,0.35)]" />
                                                        <div className="absolute top-[44%] left-1/2 h-8 w-px -translate-x-1/2 bg-cyan-100/45 shadow-[0_0_18px_rgba(125,211,252,0.35)]" />
                                                    </div>

                                                    <div
                                                        className="absolute top-[16%] left-1/2 [transform-style:preserve-3d]"
                                                        style={{
                                                            transform:
                                                                destinationBeaconTransform,
                                                        }}
                                                    >
                                                        <div className="relative flex items-center justify-center">
                                                            <div className="absolute size-28 rounded-full bg-cyan-400/18 blur-2xl" />
                                                            <div className="absolute size-16 rounded-full border border-cyan-200/35 bg-cyan-300/12 blur-sm" />
                                                            <div className="absolute h-24 w-px bg-gradient-to-b from-cyan-100 via-cyan-300/60 to-transparent" />
                                                            <div
                                                                aria-label="Destination beacon"
                                                                className="relative rounded-full border border-cyan-100/40 bg-slate-950/65 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-cyan-50 uppercase shadow-[0_18px_40px_rgba(6,182,212,0.24)] backdrop-blur-md"
                                                            >
                                                                Destination
                                                                beacon
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pointer-events-none absolute inset-x-4 top-[92px] z-20 flex justify-center sm:top-20">
                                                        <div className="max-w-[min(92vw,520px)] rounded-[8px] bg-blue-600 px-5 py-3 text-center text-white shadow-[0_18px_40px_rgba(37,99,235,0.34)] sm:px-7 sm:py-4">
                                                            <p className="text-lg leading-tight font-bold tracking-tight sm:text-2xl">
                                                                {
                                                                    liveViewInstruction
                                                                }
                                                            </p>
                                                            <p className="mt-2 text-sm font-medium text-blue-50 sm:text-base">
                                                                {
                                                                    routeDistanceText
                                                                }{' '}
                                                                away
                                                            </p>
                                                            <p className="mt-1 max-w-64 truncate text-xs font-medium text-blue-100/85">
                                                                {
                                                                    destinationLabel
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="absolute inset-0 flex items-center justify-center px-6 pb-16">
                                                        <div className="flex flex-col items-center [transform-style:preserve-3d]">
                                                            <div
                                                                className={cn(
                                                                    'relative flex items-center justify-center gap-1 text-white transition-transform duration-300 ease-out [transform-style:preserve-3d]',
                                                                    arrowRotation ===
                                                                        null &&
                                                                        'opacity-80',
                                                                )}
                                                                style={{
                                                                    transform:
                                                                        arrowDiscTransform,
                                                                }}
                                                            >
                                                                {arChevronSteps.map(
                                                                    (step) => (
                                                                        <div
                                                                            key={`ar-chevron-${step}`}
                                                                            className="relative size-24 sm:size-32"
                                                                            style={{
                                                                                transform: `translateZ(${28 + step * 8}px)`,
                                                                            }}
                                                                        >
                                                                            <ChevronRight
                                                                                className="absolute inset-0 size-full text-blue-600 drop-shadow-[0_18px_28px_rgba(37,99,235,0.42)]"
                                                                                strokeWidth={
                                                                                    9
                                                                                }
                                                                            />
                                                                            <ChevronRight
                                                                                className="absolute inset-0 size-full text-white"
                                                                                strokeWidth={
                                                                                    6.5
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute inset-x-0 bottom-0 h-[280px] overflow-hidden md:h-[300px]">
                                                <div className="absolute inset-x-[-7%] -bottom-[74px] h-[322px] overflow-hidden rounded-t-[999px] border-[10px] border-white bg-[#dff2e5] shadow-[0_-20px_60px_rgba(15,23,42,0.18)] md:-bottom-[82px] md:h-[340px]">
                                                    <div
                                                        aria-hidden="true"
                                                        className="absolute inset-0 transition-transform duration-300 ease-out"
                                                        style={{
                                                            transform:
                                                                miniMapSurfaceTransform,
                                                            transformOrigin:
                                                                miniMapSurfaceTransformOrigin,
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-[#dff2e5]">
                                                            {miniMapBlocks.map(
                                                                (block) => (
                                                                    <div
                                                                        key={
                                                                            block
                                                                        }
                                                                        className={cn(
                                                                            'absolute shadow-[inset_0_0_0_1px_rgba(16,185,129,0.10)]',
                                                                            block,
                                                                        )}
                                                                    />
                                                                ),
                                                            )}
                                                            {miniMapWaterShapes.map(
                                                                (shape) => (
                                                                    <div
                                                                        key={
                                                                            shape
                                                                        }
                                                                        className={cn(
                                                                            'absolute shadow-[inset_0_0_0_2px_rgba(255,255,255,0.36)]',
                                                                            shape,
                                                                        )}
                                                                    />
                                                                ),
                                                            )}
                                                            {miniMapRoadLines.map(
                                                                (line) => (
                                                                    <div
                                                                        key={
                                                                            line
                                                                        }
                                                                        className={cn(
                                                                            'absolute rounded-full bg-white shadow-[0_1px_5px_rgba(15,23,42,0.14)]',
                                                                            line,
                                                                        )}
                                                                    />
                                                                ),
                                                            )}
                                                            {miniMapMinorRoadLines.map(
                                                                (line) => (
                                                                    <div
                                                                        key={
                                                                            line
                                                                        }
                                                                        className={cn(
                                                                            'absolute rounded-full bg-white/84 shadow-sm',
                                                                            line,
                                                                        )}
                                                                    />
                                                                ),
                                                            )}
                                                            <div className="absolute top-[26%] left-[18%] h-2 w-[76%] rotate-[20deg] rounded-full bg-emerald-800/12" />
                                                            <div className="absolute top-[5%] left-[34%] h-[88%] w-2 rotate-[-8deg] rounded-full bg-emerald-800/12" />
                                                            <div className="absolute right-[10%] bottom-[26%] rounded-full bg-sky-200/90 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-sky-900 uppercase shadow-sm">
                                                                Mayo Bay
                                                            </div>
                                                            {miniMapRoadLabels.map(
                                                                (road) => (
                                                                    <div
                                                                        key={
                                                                            road.label
                                                                        }
                                                                        className={cn(
                                                                            'absolute rounded-full bg-white/72 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm',
                                                                            road.className,
                                                                        )}
                                                                    >
                                                                        {
                                                                            road.label
                                                                        }
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>

                                                        <div
                                                            aria-hidden="true"
                                                            className="absolute inset-0 overflow-hidden bg-transparent"
                                                        >
                                                            <div
                                                                className="absolute grid grid-cols-3 opacity-95 saturate-[1.05]"
                                                                style={{
                                                                    left: `${miniMapCurrentPoint.x}%`,
                                                                    top: `${miniMapCurrentPoint.y}%`,
                                                                    transform:
                                                                        miniMapTileLayerTransform,
                                                                }}
                                                            >
                                                                {miniMapTileLayer.tiles.map(
                                                                    (tile) => (
                                                                        <img
                                                                            key={
                                                                                tile.key
                                                                            }
                                                                            src={
                                                                                tile.url
                                                                            }
                                                                            alt=""
                                                                            className="size-64 max-w-none"
                                                                            loading="eager"
                                                                            referrerPolicy="no-referrer"
                                                                            onError={(
                                                                                event,
                                                                            ) => {
                                                                                event.currentTarget.style.visibility =
                                                                                    'hidden';
                                                                            }}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(240,253,244,0.08)_0%,rgba(240,253,244,0.12)_55%,rgba(255,255,255,0.18)_100%)]" />
                                                        </div>

                                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_45%,rgba(255,255,255,0.22)_100%)]" />
                                                    </div>

                                                    <div
                                                        aria-hidden="true"
                                                        className="absolute top-[14%] left-6 flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white/92 text-blue-600 shadow-[0_8px_22px_rgba(15,23,42,0.16)]"
                                                    >
                                                        <MapPinned className="size-5" />
                                                    </div>

                                                    <div className="absolute top-[9%] right-[10%] rounded-full bg-white/88 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                                                        {heading === null
                                                            ? 'North-up map'
                                                            : 'Heading-up map'}
                                                    </div>

                                                    {miniMapRoutePoints.map(
                                                        (point, index) => (
                                                            <span
                                                                key={`route-dot-${miniMapRouteDots[index]}`}
                                                                className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-[0_2px_8px_rgba(37,99,235,0.42)] transition-[top,left] duration-300 ease-out"
                                                                style={{
                                                                    left: `${point.x}%`,
                                                                    top: `${point.y}%`,
                                                                }}
                                                            />
                                                        ),
                                                    )}

                                                    <div
                                                        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-[top,left] duration-300 ease-out"
                                                        style={{
                                                            left: `${miniMapDestinationPoint.x}%`,
                                                            top: `${miniMapDestinationPoint.y}%`,
                                                        }}
                                                    >
                                                        <div className="flex size-12 items-center justify-center rounded-full border-4 border-white bg-green-600 text-white shadow-[0_12px_24px_rgba(22,163,74,0.34)]">
                                                            <MapPinned className="size-6" />
                                                        </div>
                                                        <div className="max-w-40 rounded-full bg-green-600 px-3 py-1 text-center text-[11px] font-semibold text-white shadow-sm">
                                                            AR destination
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                                                        style={{
                                                            left: `${miniMapCurrentPoint.x}%`,
                                                            top: `${miniMapCurrentPoint.y}%`,
                                                        }}
                                                    >
                                                        <div className="flex size-24 items-center justify-center rounded-full bg-white/90 shadow-[0_16px_35px_rgba(15,23,42,0.16)]">
                                                            <Navigation className="size-16 fill-blue-500 text-blue-600 drop-shadow-[0_10px_18px_rgba(37,99,235,0.36)]" />
                                                        </div>
                                                        <div className="rounded-full bg-white px-4 py-1 text-xs font-bold text-slate-900 shadow-sm">
                                                            You are here
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute inset-x-4 bottom-[214px] flex flex-col items-center gap-3 md:bottom-[248px]">
                                                <div
                                                    aria-label="Be alert while walking"
                                                    className="rounded-full border border-white/86 bg-slate-950/54 px-5 py-3 text-white shadow-[0_12px_34px_rgba(15,23,42,0.28)] backdrop-blur-md"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <TriangleAlert className="size-5" />
                                                        <span className="text-base font-semibold">
                                                            Be alert while
                                                            walking
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid w-full max-w-2xl grid-cols-3 gap-2">
                                                    <div className="rounded-[8px] bg-white/86 px-3 py-2 text-center text-slate-900 shadow-sm backdrop-blur-md">
                                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                                            Heading
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold">
                                                            {heading === null
                                                                ? 'Compass'
                                                                : `${compassDirectionLabel(heading)} ${Math.round(heading)} deg`}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[8px] bg-white/86 px-3 py-2 text-center text-slate-900 shadow-sm backdrop-blur-md">
                                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                                            Distance
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold">
                                                            {routeDistanceText}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[8px] bg-white/86 px-3 py-2 text-center text-slate-900 shadow-sm backdrop-blur-md">
                                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                                            ETA
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold">
                                                            {routeEtaText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <aside className="flex flex-col gap-4 rounded-[30px] border border-white/55 bg-white/80 p-4 shadow-[0_20px_60px_rgba(148,163,184,0.14)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/54">
                                            <div className="rounded-[26px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(145deg,#f8fafc_0%,#ecfeff_100%)] p-5 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(145deg,#0f172a_0%,#111827_100%)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-700 dark:text-cyan-300">
                                                        <MapPinned className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                                                            Destination Brief
                                                        </h3>
                                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                            The arrow skips full
                                                            centers when another
                                                            mapped center still
                                                            has available slots.
                                                        </p>
                                                    </div>
                                                </div>

                                                {nearestCenter !== null ? (
                                                    <div className="mt-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-xl font-semibold text-foreground">
                                                                    {
                                                                        nearestCenter.name
                                                                    }
                                                                </p>
                                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                                    {
                                                                        nearestCenter.address
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-3 py-1 text-xs font-semibold',
                                                                    statusClassName(
                                                                        nearestCenter.status,
                                                                    ),
                                                                )}
                                                            >
                                                                {
                                                                    nearestCenter.status
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Available
                                                                </p>
                                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                                    {formatCount(
                                                                        nearestCenter.availableSlots,
                                                                    )}{' '}
                                                                    slots
                                                                </p>
                                                            </div>
                                                            <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Occupancy
                                                                </p>
                                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                                    {formatCount(
                                                                        nearestCenter.occupied,
                                                                    )}{' '}
                                                                    /{' '}
                                                                    {formatCount(
                                                                        nearestCenter.capacity,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Distance
                                                                </p>
                                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                                    {routeDistanceKm ===
                                                                    null
                                                                        ? nearestCenter.distanceKm
                                                                        : distanceLabel(
                                                                              routeDistanceKm,
                                                                          )}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-[20px] border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                                                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                                                    ETA
                                                                </p>
                                                                <p className="mt-2 text-lg font-semibold text-foreground">
                                                                    {routeMinutes ===
                                                                    null
                                                                        ? `${nearestCenter.etaMinutes} min`
                                                                        : `${routeMinutes} min`}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-5 flex flex-wrap gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                className="rounded-full"
                                                            >
                                                                <a
                                                                    href={`tel:${nearestCenter.contact}`}
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
                                                                    All Centers
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm leading-7 text-muted-foreground dark:border-slate-700 dark:bg-slate-900/60">
                                                        No evacuation center is
                                                        mapped yet for this
                                                        resident account.
                                                    </div>
                                                )}
                                            </div>

                                            {errorMessages.length > 0 ? (
                                                <div className="space-y-3">
                                                    {errorMessages.map(
                                                        (message) => (
                                                            <div
                                                                key={message}
                                                                className="rounded-[22px] border border-amber-300/60 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
                                                            >
                                                                {message}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}

                                            <div className="grid gap-3">
                                                {fieldNotes.map((note) => (
                                                    <div
                                                        key={note.label}
                                                        className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                                                    >
                                                        <div className="flex items-center gap-2 text-foreground">
                                                            <note.icon className="size-4" />
                                                            <p className="font-semibold">
                                                                {note.label}
                                                            </p>
                                                        </div>
                                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                            {note.detail}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </aside>
                                    </section>
                                </>
                            ) : (
                                <section className="rounded-[30px] border border-white/55 bg-white/75 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.14)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/52">
                                    <p className="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-300">
                                        Live Guidance Stage
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                        Update your current location first
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        Tap My location so the guide refreshes
                                        from your exact GPS position before the
                                        AR workspace appears.
                                    </p>

                                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                                        <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Saved Pin
                                            </p>
                                            <p className="mt-3 text-lg font-semibold text-foreground">
                                                {arGuide.currentLocation
                                                    ?.label ??
                                                    'No saved household pin'}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {arGuide.currentLocation
                                                    ?.address ??
                                                    'Update your resident details so the guide keeps a backup home location.'}
                                            </p>
                                        </div>
                                        <div className="rounded-[24px] border border-cyan-200/70 bg-cyan-50/80 p-5 shadow-sm dark:border-cyan-900/50 dark:bg-cyan-950/28">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 uppercase dark:text-cyan-300">
                                                Next Step
                                            </p>
                                            <p className="mt-3 text-lg font-semibold text-foreground">
                                                Tap My location
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                Once a live GPS lock is
                                                captured, the route map and
                                                camera-based AR workspace will
                                                unlock.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-[24px] border border-white/65 bg-white/78 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/55">
                                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                                        Resident
                                    </p>
                                    <p className="mt-3 text-lg font-semibold text-foreground">
                                        {arGuide.residentName}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-cyan-200/70 bg-cyan-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-cyan-900/50 dark:bg-cyan-950/28">
                                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                                        <Navigation className="size-4" />
                                        <p className="text-xs tracking-[0.18em] uppercase">
                                            Routing Snapshot
                                        </p>
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-foreground">
                                        {routeDistanceKm === null
                                            ? (nearestCenter?.distanceKm ??
                                              'Waiting')
                                            : distanceLabel(routeDistanceKm)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {routeMinutes === null
                                            ? 'ETA pending'
                                            : `${routeMinutes} min estimated travel`}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-amber-200/70 bg-amber-50/78 p-4 shadow-sm backdrop-blur-xl dark:border-amber-900/50 dark:bg-amber-950/28">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <TriangleAlert className="size-4" />
                                        <p className="text-xs tracking-[0.18em] uppercase">
                                            Hazard Zone
                                        </p>
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-foreground">
                                        {arGuide.hazardZone}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Keep monitoring barangay instructions
                                        while moving to safety.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

ResidentEvacuationAr.layout = {
    breadcrumbs: [
        {
            title: 'Map / Nearest Center',
            href: resident.map(),
        },
        {
            title: 'AR Guide',
            href: resident.evacuationAr(),
        },
    ],
};
