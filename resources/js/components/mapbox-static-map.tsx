import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type MapboxPoint = {
    latitude: number;
    longitude: number;
};

export type MapboxOverlayMarker = {
    color?: string;
    latitude: number;
    longitude: number;
    size?: 'small' | 'medium' | 'large';
    symbol?: string;
};

export type MapboxViewport = {
    bbox?: [number, number, number, number];
    latitude?: number;
    longitude?: number;
    padding?: string;
    zoom?: number;
};

type MapboxStaticMapProps = {
    className?: string;
    markers?: MapboxOverlayMarker[];
    points: MapboxPoint[];
    viewport?: MapboxViewport;
};

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const maximumLatitude = 85.0511;

function coordinatePoints<T extends MapboxPoint>(points: T[]): T[] {
    return points.filter(
        (point) =>
            Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
    );
}

export function clampLatitude(latitude: number): number {
    return Math.min(Math.max(latitude, -maximumLatitude), maximumLatitude);
}

export function wrapLongitude(longitude: number): number {
    const wrappedLongitude = ((((longitude + 180) % 360) + 360) % 360) - 180;

    return wrappedLongitude === -180 ? 180 : wrappedLongitude;
}

function mapCenter(points: MapboxPoint[]): MapboxPoint {
    const totals = points.reduce(
        (carry, point) => ({
            latitude: carry.latitude + point.latitude,
            longitude: carry.longitude + point.longitude,
        }),
        {
            latitude: 0,
            longitude: 0,
        },
    );

    return {
        latitude: clampLatitude(totals.latitude / points.length),
        longitude: wrapLongitude(totals.longitude / points.length),
    };
}

function mapZoom(points: MapboxPoint[]): number {
    if (points.length <= 1) {
        return 13;
    }

    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);
    const latitudeRange = Math.max(...latitudes) - Math.min(...latitudes);
    const longitudeRange = Math.max(...longitudes) - Math.min(...longitudes);
    const largestRange = Math.max(latitudeRange, longitudeRange);

    if (largestRange > 0.18) {
        return 10;
    }

    if (largestRange > 0.08) {
        return 11;
    }

    if (largestRange > 0.035) {
        return 12;
    }

    return 13;
}

export function fitMapViewport(
    points: MapboxPoint[],
): Required<Pick<MapboxViewport, 'latitude' | 'longitude' | 'zoom'>> | null {
    const validPoints = coordinatePoints(points);

    if (validPoints.length === 0) {
        return null;
    }

    const center = mapCenter(validPoints);

    return {
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: mapZoom(validPoints),
    };
}

function mapboxOverlay(markers: MapboxOverlayMarker[]): string | null {
    const validMarkers = coordinatePoints(markers);

    if (validMarkers.length === 0) {
        return null;
    }

    const featureCollection = {
        type: 'FeatureCollection',
        features: validMarkers.map((marker) => ({
            type: 'Feature',
            properties: {
                'marker-color': marker.color ?? '#2563eb',
                'marker-size': marker.size ?? 'small',
                ...(marker.symbol ? { 'marker-symbol': marker.symbol } : {}),
            },
            geometry: {
                type: 'Point',
                coordinates: [
                    Number(marker.longitude.toFixed(6)),
                    Number(marker.latitude.toFixed(6)),
                ],
            },
        })),
    };

    return `geojson(${encodeURIComponent(JSON.stringify(featureCollection))})`;
}

function mapboxStaticUrl(
    points: MapboxPoint[],
    viewport?: MapboxViewport,
    markers: MapboxOverlayMarker[] = [],
): string | null {
    const validPoints = coordinatePoints([...points, ...markers]);
    const overlay = mapboxOverlay(markers);
    const overlayPath = overlay === null ? '' : `${overlay}/`;

    if (
        !mapboxAccessToken ||
        (validPoints.length === 0 && viewport === undefined)
    ) {
        return null;
    }

    if (viewport?.bbox) {
        const bbox = `[${viewport.bbox.join(',')}]`;
        const padding =
            viewport.padding === undefined
                ? ''
                : `&padding=${encodeURIComponent(viewport.padding)}`;

        return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${overlayPath}${bbox}/1280x860@2x?access_token=${encodeURIComponent(mapboxAccessToken)}${padding}`;
    }

    const center =
        viewport?.latitude !== undefined && viewport.longitude !== undefined
            ? {
                  latitude: viewport.latitude,
                  longitude: viewport.longitude,
              }
            : mapCenter(validPoints);
    const zoom =
        viewport?.zoom !== undefined
            ? viewport.zoom.toFixed(2)
            : mapZoom(validPoints);
    const longitude = center.longitude.toFixed(5);
    const latitude = center.latitude.toFixed(5);

    return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${overlayPath}${longitude},${latitude},${zoom},0/1280x860@2x?access_token=${encodeURIComponent(mapboxAccessToken)}`;
}

export function MapboxStaticMap({
    className,
    markers = [],
    points,
    viewport,
}: MapboxStaticMapProps) {
    const mapUrl = mapboxStaticUrl(points, viewport, markers);
    const [visibleUrl, setVisibleUrl] = useState<string | null>(mapUrl);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    useEffect(() => {
        return () => {
            if (transitionTimerRef.current !== null) {
                clearTimeout(transitionTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (mapUrl === null) {
            setVisibleUrl(null);
            setPendingUrl(null);

            return;
        }

        if (visibleUrl === null) {
            setVisibleUrl(mapUrl);

            return;
        }

        if (mapUrl === visibleUrl || mapUrl === pendingUrl) {
            return;
        }

        let cancelled = false;
        const preloadImage = new Image();

        preloadImage.onload = () => {
            if (cancelled) {
                return;
            }

            setPendingUrl(mapUrl);

            if (transitionTimerRef.current !== null) {
                clearTimeout(transitionTimerRef.current);
            }

            transitionTimerRef.current = setTimeout(() => {
                if (cancelled) {
                    return;
                }

                setVisibleUrl(mapUrl);
                setPendingUrl(null);
                transitionTimerRef.current = null;
            }, 180);
        };

        preloadImage.src = mapUrl;

        return () => {
            cancelled = true;
        };
    }, [mapUrl, pendingUrl, visibleUrl]);

    if (mapUrl === null) {
        return null;
    }

    return (
        <>
            <img
                src={visibleUrl ?? mapUrl}
                alt=""
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out',
                    className,
                )}
            />
            {pendingUrl ? (
                <img
                    src={pendingUrl}
                    alt=""
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute inset-0 h-full w-full animate-in object-cover opacity-0 duration-200 fade-in',
                        className,
                    )}
                />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.36))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.36),rgba(2,6,23,0.68))]" />
        </>
    );
}
