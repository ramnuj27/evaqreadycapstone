import 'mapbox-gl/dist/mapbox-gl.css';
import {
    Layers3,
    LocateFixed,
    LoaderCircle,
    Minus,
    Move,
    MousePointer2,
    Plus,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import {
    clampLatitude,
    fitMapViewport,
    MapboxStaticMap,
    type MapboxOverlayMarker,
    type MapboxPoint,
    wrapLongitude,
} from '@/components/mapbox-static-map';
import { Button } from '@/components/ui/button';
import type {
    BarangayBoundaryCollection,
    BarangayBoundaryFeature,
} from '@/lib/mati-barangay-boundaries';
import { cn } from '@/lib/utils';

type InteractiveMapMarker = MapboxOverlayMarker & {
    barangay?: string;
    id?: string;
    label?: string;
    selected?: boolean;
};

type InteractiveMapboxStaticMapProps = {
    ariaLabel: string;
    boundaries?: BarangayBoundaryCollection | null;
    className?: string;
    hint?: string;
    markers?: InteractiveMapMarker[];
    points: MapboxPoint[];
    selectedBarangay?: string | null;
};

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const mapboxStyle = 'mapbox://styles/mapbox/satellite-streets-v12';
const minimumZoom = 0;
const maximumZoom = 22;
const threeDimensionalPitch = 58;
const threeDimensionalBearing = -18;
const terrainSourceId = 'monitoring-mapbox-terrain';
const buildingLayerId = 'monitoring-3d-buildings';
const boundarySourceId = 'monitoring-barangay-boundaries';
const boundaryFillLayerId = 'monitoring-barangay-boundary-fill';
const boundaryOutlineLayerId = 'monitoring-barangay-boundary-outline';
const boundaryAccentLayerId = 'monitoring-barangay-boundary-accent';
const backupPreviewMessage =
    'Backup preview is active while the live map finishes loading.';

type MapboxGeoJson = Parameters<mapboxgl.GeoJSONSource['setData']>[0];

type MapBoundaryFeature = BarangayBoundaryFeature & {
    properties: BarangayBoundaryFeature['properties'] & {
        isSelected: boolean;
    };
};

type MapBoundaryCollection = {
    features: MapBoundaryFeature[];
    type: 'FeatureCollection';
};

type CameraPerspective = {
    bearing: number;
    pitch: number;
};

type FallbackMapTile = {
    key: string;
    url: string;
};

type FallbackMapMarker = InteractiveMapMarker & {
    offsetX: number;
    offsetY: number;
};

const fallbackTileOffsets = [-2, -1, 0, 1, 2] as const;
const fallbackTileSize = 256;
const fallbackTileCenterIndex = Math.floor(fallbackTileOffsets.length / 2);

function markerPixelSize(size: MapboxOverlayMarker['size'] = 'small'): number {
    switch (size) {
        case 'large':
            return 22;
        case 'medium':
            return 18;
        default:
            return 14;
    }
}

function createMarkerElement(marker: InteractiveMapMarker): HTMLDivElement {
    const element = document.createElement('div');
    const size = markerPixelSize(marker.size);

    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.borderRadius = '9999px';
    element.style.border = '2px solid rgba(255, 255, 255, 0.95)';
    element.style.backgroundColor = marker.color ?? '#2563eb';
    element.style.boxShadow = marker.selected
        ? '0 0 0 5px rgba(255, 255, 255, 0.28), 0 14px 32px rgba(15, 23, 42, 0.34)'
        : '0 10px 24px rgba(15, 23, 42, 0.26)';
    element.style.cursor = 'grab';
    element.style.transform = marker.selected ? 'scale(1.18)' : 'scale(1)';
    element.style.transition =
        'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease';

    if (marker.symbol) {
        element.textContent = marker.symbol;
        element.style.alignItems = 'center';
        element.style.color = '#ffffff';
        element.style.display = 'flex';
        element.style.fontSize = '10px';
        element.style.fontWeight = '700';
        element.style.justifyContent = 'center';
    }

    if (marker.label) {
        element.setAttribute('aria-label', marker.label);
        element.title = marker.label;
    }

    return element;
}

function validPoints(points: MapboxPoint[]): MapboxPoint[] {
    return points.filter(
        (point) =>
            Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
    );
}

function normalizedLongitude(longitude: number): number {
    return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function longitudeToTileX(longitude: number, zoom: number): number {
    return ((normalizedLongitude(longitude) + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude: number, zoom: number): number {
    const latitudeRadians = (clampLatitude(latitude) * Math.PI) / 180;

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
    const clampedY = Math.min(Math.max(y, 0), tileCount - 1);

    return `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${clampedY}.png`;
}

function fallbackTileZoom(
    viewport: NonNullable<ReturnType<typeof fitMapViewport>>,
): number {
    return Math.min(Math.max(Math.round(viewport.zoom + 1), 10), 16);
}

function fallbackMapTiles(
    viewport: NonNullable<ReturnType<typeof fitMapViewport>>,
): {
    offsetX: number;
    offsetY: number;
    tiles: FallbackMapTile[];
    zoom: number;
} {
    const zoom = fallbackTileZoom(viewport);
    const tileX = longitudeToTileX(viewport.longitude, zoom);
    const tileY = latitudeToTileY(viewport.latitude, zoom);
    const centerTileX = Math.floor(tileX);
    const centerTileY = Math.floor(tileY);

    return {
        offsetX: (tileX - centerTileX) * fallbackTileSize,
        offsetY: (tileY - centerTileY) * fallbackTileSize,
        tiles: fallbackTileOffsets.flatMap((yOffset) =>
            fallbackTileOffsets.map((xOffset) => {
                const x = centerTileX + xOffset;
                const y = centerTileY + yOffset;

                return {
                    key: `${zoom}-${x}-${y}`,
                    url: openStreetMapTileUrl(x, y, zoom),
                };
            }),
        ),
        zoom,
    };
}

function fallbackMarkerPositions(
    markers: InteractiveMapMarker[],
    viewport: NonNullable<ReturnType<typeof fitMapViewport>>,
    zoom: number,
): FallbackMapMarker[] {
    const centerX = longitudeToTileX(viewport.longitude, zoom);
    const centerY = latitudeToTileY(viewport.latitude, zoom);

    return markers
        .filter(
            (marker) =>
                Number.isFinite(marker.latitude) &&
                Number.isFinite(marker.longitude),
        )
        .map((marker) => ({
            ...marker,
            offsetX:
                (longitudeToTileX(marker.longitude, zoom) - centerX) *
                fallbackTileSize,
            offsetY:
                (latitudeToTileY(marker.latitude, zoom) - centerY) *
                fallbackTileSize,
        }));
}

function pointsBounds(points: MapboxPoint[]): mapboxgl.LngLatBounds | null {
    const sanitizedPoints = validPoints(points);

    if (sanitizedPoints.length === 0) {
        return null;
    }

    const [firstPoint, ...remainingPoints] = sanitizedPoints;
    const bounds = new mapboxgl.LngLatBounds(
        [
            wrapLongitude(firstPoint.longitude),
            clampLatitude(firstPoint.latitude),
        ],
        [
            wrapLongitude(firstPoint.longitude),
            clampLatitude(firstPoint.latitude),
        ],
    );

    for (const point of remainingPoints) {
        bounds.extend([
            wrapLongitude(point.longitude),
            clampLatitude(point.latitude),
        ]);
    }

    return bounds;
}

function mapBoundaryCollection(
    boundaries: BarangayBoundaryCollection | null | undefined,
    selectedBarangay: string | null | undefined,
): MapBoundaryCollection {
    return {
        type: 'FeatureCollection',
        features: (boundaries?.features ?? []).map((feature) => ({
            ...feature,
            properties: {
                ...feature.properties,
                isSelected: feature.properties.barangay === selectedBarangay,
            },
        })),
    };
}

function boundaryBounds(
    feature: BarangayBoundaryFeature | null | undefined,
): mapboxgl.LngLatBounds | null {
    if (feature === null || feature === undefined) {
        return null;
    }

    let bounds: mapboxgl.LngLatBounds | null = null;
    const extendBounds = (longitude: number, latitude: number): void => {
        const point: [number, number] = [
            wrapLongitude(longitude),
            clampLatitude(latitude),
        ];

        bounds =
            bounds === null
                ? new mapboxgl.LngLatBounds(point, point)
                : bounds.extend(point);
    };

    if (feature.geometry.type === 'Polygon') {
        for (const ring of feature.geometry.coordinates) {
            for (const [longitude, latitude] of ring) {
                extendBounds(longitude, latitude);
            }
        }

        return bounds;
    }

    for (const polygon of feature.geometry.coordinates) {
        for (const ring of polygon) {
            for (const [longitude, latitude] of ring) {
                extendBounds(longitude, latitude);
            }
        }
    }

    return bounds;
}

function locationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was blocked in the browser.';
        case error.POSITION_UNAVAILABLE:
            return 'The browser could not determine your location.';
        case error.TIMEOUT:
            return 'The location request timed out.';
        default:
            return 'Unable to load your current location.';
    }
}

function cameraPerspective(isThreeDimensional: boolean): CameraPerspective {
    if (isThreeDimensional) {
        return {
            bearing: threeDimensionalBearing,
            pitch: threeDimensionalPitch,
        };
    }

    return {
        bearing: 0,
        pitch: 0,
    };
}

function focusMapOnBounds(
    map: mapboxgl.Map,
    bounds: mapboxgl.LngLatBounds,
    fallbackZoom: number,
    isThreeDimensional: boolean,
    options: {
        maxZoom: number;
        padding: number;
    },
): void {
    const perspective = cameraPerspective(isThreeDimensional);
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    if (southWest.lng === northEast.lng && southWest.lat === northEast.lat) {
        map.easeTo({
            center: bounds.getCenter(),
            duration: 700,
            zoom: fallbackZoom,
            ...perspective,
        });

        return;
    }

    map.fitBounds(bounds, {
        duration: 700,
        maxZoom: options.maxZoom,
        padding: options.padding,
        ...perspective,
    });
}

function firstSymbolLayerId(map: mapboxgl.Map): string | undefined {
    return map
        .getStyle()
        .layers?.find(
            (layer) => layer.type === 'symbol' && layer.layout?.['text-field'],
        )?.id;
}

function enableThreeDimensionalMapLayers(map: mapboxgl.Map): void {
    if (map.getSource(terrainSourceId) === undefined) {
        map.addSource(terrainSourceId, {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
        });
    }

    map.setTerrain({
        source: terrainSourceId,
        exaggeration: 1.25,
    });

    if (
        map.getLayer(buildingLayerId) !== undefined ||
        map.getSource('composite') === undefined
    ) {
        return;
    }

    const buildingsLayer: mapboxgl.FillExtrusionLayer = {
        id: buildingLayerId,
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                14.2,
                ['get', 'min_height'],
            ],
            'fill-extrusion-color': '#dbeafe',
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                14.2,
                ['get', 'height'],
            ],
            'fill-extrusion-opacity': 0.72,
        },
    };
    const labelLayerId = firstSymbolLayerId(map);

    if (labelLayerId === undefined) {
        map.addLayer(buildingsLayer);

        return;
    }

    map.addLayer(buildingsLayer, labelLayerId);
}

export function InteractiveMapboxStaticMap({
    ariaLabel,
    boundaries = null,
    className,
    hint = 'Drag to pan',
    markers = [],
    points,
    selectedBarangay = null,
}: InteractiveMapboxStaticMapProps) {
    const defaultViewport = fitMapViewport(points);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const activeBoundaryCollection = mapBoundaryCollection(
        boundaries,
        selectedBarangay,
    );
    const selectedBoundary =
        boundaries?.features.find(
            (feature) => feature.properties.barangay === selectedBarangay,
        ) ?? null;
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationMessage, setLocationMessage] = useState<string | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [userLocationMarker, setUserLocationMarker] =
        useState<InteractiveMapMarker | null>(null);
    const [isThreeDimensional, setIsThreeDimensional] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(defaultViewport?.zoom ?? 13);
    const activeMarkers =
        userLocationMarker === null
            ? markers
            : [...markers, userLocationMarker];
    const fallbackLayer =
        defaultViewport === null ? null : fallbackMapTiles(defaultViewport);
    const fallbackLayerTransform =
        fallbackLayer === null
            ? ''
            : `translate(-${(fallbackTileCenterIndex * fallbackTileSize + fallbackLayer.offsetX).toFixed(1)}px, -${(fallbackTileCenterIndex * fallbackTileSize + fallbackLayer.offsetY).toFixed(1)}px)`;
    const fallbackMarkers =
        defaultViewport === null || fallbackLayer === null
            ? []
            : fallbackMarkerPositions(
                  activeMarkers,
                  defaultViewport,
                  fallbackLayer.zoom,
              );

    useEffect(() => {
        if (defaultViewport === null) {
            return;
        }

        setZoomLevel(defaultViewport.zoom);
    }, [
        defaultViewport?.latitude,
        defaultViewport?.longitude,
        defaultViewport?.zoom,
    ]);

    useEffect(() => {
        if (
            containerRef.current === null ||
            defaultViewport === null ||
            mapRef.current !== null
        ) {
            return;
        }

        if (!mapboxAccessToken) {
            setMapError(
                'OpenStreetMap backup preview is active because the Mapbox token is missing.',
            );

            return;
        }

        setIsMapReady(false);
        setMapError(null);
        mapboxgl.accessToken = mapboxAccessToken;
        const initialPerspective = cameraPerspective(true);

        const map = new mapboxgl.Map({
            antialias: true,
            bearing: initialPerspective.bearing,
            center: [
                wrapLongitude(defaultViewport.longitude),
                clampLatitude(defaultViewport.latitude),
            ],
            container: containerRef.current,
            dragRotate: true,
            pitch: initialPerspective.pitch,
            pitchWithRotate: true,
            style: mapboxStyle,
            touchPitch: true,
            zoom: defaultViewport.zoom,
        });

        mapRef.current = map;

        const syncZoomLevel = (): void => {
            setZoomLevel(Number(map.getZoom().toFixed(1)));
        };

        const markMapReady = (): void => {
            if (!map.isStyleLoaded() || !map.areTilesLoaded()) {
                return;
            }

            setIsMapReady(true);
            setMapError(null);
        };

        const fitVisiblePoints = (): void => {
            const bounds = pointsBounds(points);

            if (bounds === null || bounds.isEmpty()) {
                return;
            }

            focusMapOnBounds(map, bounds, defaultViewport.zoom, true, {
                maxZoom: 15,
                padding: 64,
            });
        };

        const handleStyleLoad = (): void => {
            enableThreeDimensionalMapLayers(map);
        };

        const handleLoad = (): void => {
            map.resize();
            syncZoomLevel();
            fitVisiblePoints();
            setIsMapLoaded(true);
            markMapReady();
        };

        const handleIdle = (): void => {
            markMapReady();
        };

        const handleError = (): void => {
            setMapError(backupPreviewMessage);
        };

        map.on('load', handleLoad);
        map.on('style.load', handleStyleLoad);
        map.on('idle', handleIdle);
        map.on('zoom', syncZoomLevel);
        map.on('error', handleError);
        map.dragPan.enable();
        map.dragRotate.enable();
        map.scrollZoom.enable();
        map.touchZoomRotate.enableRotation();

        requestAnimationFrame(() => {
            map.resize();
            requestAnimationFrame(() => {
                map.resize();
            });
        });

        if (
            typeof window !== 'undefined' &&
            'ResizeObserver' in window &&
            containerRef.current !== null
        ) {
            resizeObserverRef.current = new ResizeObserver(() => {
                map.resize();
            });
            resizeObserverRef.current.observe(containerRef.current);
        }

        const readyTimeout = window.setTimeout(() => {
            if (!map.isStyleLoaded() || !map.areTilesLoaded()) {
                setMapError(backupPreviewMessage);
            }
        }, 3200);

        return () => {
            window.clearTimeout(readyTimeout);
            resizeObserverRef.current?.disconnect();
            resizeObserverRef.current = null;

            for (const marker of markersRef.current) {
                marker.remove();
            }

            markersRef.current = [];
            map.remove();
            mapRef.current = null;
        };
    }, [defaultViewport, points]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded) {
            return;
        }

        const boundaryData = activeBoundaryCollection as MapboxGeoJson;
        const existingSource = map.getSource(boundarySourceId);

        if (existingSource && 'setData' in existingSource) {
            (existingSource as mapboxgl.GeoJSONSource).setData(boundaryData);
        } else {
            map.addSource(boundarySourceId, {
                type: 'geojson',
                data: boundaryData,
            });

            map.addLayer({
                id: boundaryFillLayerId,
                type: 'fill',
                source: boundarySourceId,
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        '#f97316',
                        '#0f172a',
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        0.16,
                        0,
                    ],
                },
            });

            map.addLayer({
                id: boundaryOutlineLayerId,
                type: 'line',
                source: boundarySourceId,
                paint: {
                    'line-color': '#ffffff',
                    'line-opacity': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        0.98,
                        0,
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        6,
                        0.5,
                    ],
                },
            });

            map.addLayer({
                id: boundaryAccentLayerId,
                type: 'line',
                source: boundarySourceId,
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        '#fb923c',
                        '#38bdf8',
                    ],
                    'line-dasharray': [1, 1.2],
                    'line-opacity': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        0.98,
                        0,
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['get', 'isSelected'], false],
                        3.5,
                        0.5,
                    ],
                },
            });
        }
    }, [activeBoundaryCollection, isMapLoaded]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded || defaultViewport === null) {
            return;
        }

        const bounds = pointsBounds(points);

        if (bounds === null || bounds.isEmpty()) {
            return;
        }

        focusMapOnBounds(
            map,
            bounds,
            defaultViewport.zoom,
            isThreeDimensional,
            {
                maxZoom: 15,
                padding: 64,
            },
        );
    }, [
        defaultViewport?.latitude,
        defaultViewport?.longitude,
        defaultViewport?.zoom,
        isMapLoaded,
        points,
    ]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded) {
            return;
        }

        const perspective = cameraPerspective(isThreeDimensional);

        map.easeTo({
            bearing: perspective.bearing,
            duration: 650,
            pitch: perspective.pitch,
        });
    }, [isMapLoaded, isThreeDimensional]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded) {
            return;
        }

        for (const marker of markersRef.current) {
            marker.remove();
        }

        markersRef.current = activeMarkers
            .filter(
                (marker) =>
                    Number.isFinite(marker.latitude) &&
                    Number.isFinite(marker.longitude),
            )
            .map((marker) => {
                const element = createMarkerElement(marker);

                return new mapboxgl.Marker({
                    element,
                })
                    .setLngLat([
                        wrapLongitude(marker.longitude),
                        clampLatitude(marker.latitude),
                    ])
                    .addTo(map);
            });

        return () => {
            for (const marker of markersRef.current) {
                marker.remove();
            }

            markersRef.current = [];
        };
    }, [activeMarkers, isMapLoaded]);

    useEffect(() => {
        const map = mapRef.current;

        if (
            map === null ||
            !isMapLoaded ||
            defaultViewport === null ||
            selectedBarangay !== null
        ) {
            return;
        }

        const bounds = pointsBounds(points);

        if (bounds === null || bounds.isEmpty()) {
            return;
        }

        focusMapOnBounds(
            map,
            bounds,
            defaultViewport.zoom,
            isThreeDimensional,
            {
                maxZoom: 15,
                padding: 64,
            },
        );

        setLocationMessage(null);
    }, [defaultViewport?.zoom, isMapLoaded, points, selectedBarangay]);

    useEffect(() => {
        const map = mapRef.current;
        const bounds = boundaryBounds(selectedBoundary);

        if (
            map === null ||
            !isMapLoaded ||
            selectedBarangay === null ||
            bounds === null ||
            bounds.isEmpty()
        ) {
            return;
        }

        focusMapOnBounds(
            map,
            bounds,
            defaultViewport?.zoom ?? 14,
            isThreeDimensional,
            {
                maxZoom: 14,
                padding: 72,
            },
        );
        setLocationMessage(
            isThreeDimensional
                ? `${selectedBarangay} border is visible on the 3D map.`
                : `${selectedBarangay} border is visible on the map.`,
        );
    }, [
        defaultViewport?.zoom,
        isMapLoaded,
        isThreeDimensional,
        selectedBarangay,
        selectedBoundary,
    ]);

    function handlePerspectiveToggle(): void {
        setIsThreeDimensional((currentView) => !currentView);
        setLocationMessage(
            isThreeDimensional
                ? 'Flat monitoring view is active.'
                : '3D terrain view is active.',
        );
    }

    function handleLocate(): void {
        const map = mapRef.current;
        const perspective = cameraPerspective(isThreeDimensional);

        if (map === null) {
            return;
        }

        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            setLocationMessage('My location is not available in this browser.');

            return;
        }

        if (!window.isSecureContext) {
            setLocationMessage('My location needs HTTPS or localhost.');

            return;
        }

        setIsLocating(true);
        setLocationMessage('Checking your location...');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const latitude = clampLatitude(coords.latitude);
                const longitude = wrapLongitude(coords.longitude);

                setUserLocationMarker({
                    color: '#2563eb',
                    latitude,
                    longitude,
                    size: 'medium',
                });
                map.easeTo({
                    center: [longitude, latitude],
                    duration: 900,
                    zoom: Math.max(map.getZoom(), 14),
                    ...perspective,
                });
                setLocationMessage('My location centered on the map.');
                setIsLocating(false);
            },
            (error) => {
                setLocationMessage(locationErrorMessage(error));
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 60_000,
                timeout: 10_000,
            },
        );
    }

    function handleZoom(delta: number): void {
        const map = mapRef.current;
        const perspective = cameraPerspective(isThreeDimensional);

        if (map === null) {
            return;
        }

        map.easeTo({
            duration: 250,
            zoom: Math.min(
                Math.max(map.getZoom() + delta, minimumZoom),
                maximumZoom,
            ),
            ...perspective,
        });
        setLocationMessage(null);
    }

    if (defaultViewport === null) {
        return (
            <div
                className={cn(
                    'flex h-full min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-6 text-center',
                    className,
                )}
            >
                <div className="max-w-sm space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                        No map coordinates available.
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                        Add marker coordinates first so the shared map preview
                        can render.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            aria-label={ariaLabel}
            className={cn(
                'interactive-map-shell group relative isolate h-full min-h-[260px] overflow-hidden rounded-[24px] bg-slate-100/80 dark:bg-slate-950/75',
                className,
            )}
            role="region"
        >
            {fallbackLayer ? (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden bg-slate-100 dark:bg-slate-900"
                >
                    <div
                        className="absolute top-1/2 left-1/2 grid grid-cols-5 opacity-95 saturate-[1.04] dark:opacity-80"
                        style={{
                            transform: fallbackLayerTransform,
                        }}
                    >
                        {fallbackLayer.tiles.map((tile) => (
                            <img
                                key={tile.key}
                                alt=""
                                className="size-64 max-w-none"
                                loading="eager"
                                referrerPolicy="no-referrer"
                                src={tile.url}
                            />
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.04),rgba(15,23,42,0.10))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.32))]" />

                    {fallbackMarkers.map((marker, index) => {
                        const size = markerPixelSize(marker.size);

                        return (
                            <div
                                key={`${marker.label ?? marker.id ?? 'marker'}-${index}`}
                                aria-label={marker.label}
                                className={cn(
                                    'absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)]',
                                    marker.selected && 'ring-4 ring-white/40',
                                )}
                                style={{
                                    backgroundColor: marker.color ?? '#2563eb',
                                    height: size,
                                    left: `calc(50% + ${marker.offsetX.toFixed(1)}px)`,
                                    top: `calc(50% + ${marker.offsetY.toFixed(1)}px)`,
                                    width: size,
                                }}
                                title={marker.label}
                            >
                                {marker.symbol}
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <div className="absolute inset-0">
                <MapboxStaticMap markers={activeMarkers} points={points} />
            </div>

            <div
                ref={containerRef}
                className={cn(
                    'absolute inset-0 z-[2] transition-opacity duration-500',
                    isMapReady ? 'opacity-100' : 'opacity-0',
                )}
            />

            <div
                className={cn(
                    'pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500',
                    isMapReady ? 'opacity-0' : 'opacity-100',
                )}
            >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.14))]" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_26%)]" />

            {!isMapLoaded && mapError === null ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                        <LoaderCircle className="size-4 animate-spin" />
                        Loading map...
                    </div>
                </div>
            ) : null}

            <div
                className="absolute top-4 right-4 z-20 flex items-start gap-2"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <Button
                    className="rounded-full border-white/70 bg-white/92 text-foreground shadow-lg backdrop-blur hover:bg-white dark:border-slate-800/90 dark:bg-slate-950/88 dark:hover:bg-slate-950"
                    disabled={isLocating || !isMapReady}
                    onClick={handleLocate}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    {isLocating ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <LocateFixed />
                    )}
                    My location
                </Button>

                <Button
                    className="rounded-full border-white/70 bg-white/92 text-foreground shadow-lg backdrop-blur hover:bg-white dark:border-slate-800/90 dark:bg-slate-950/88 dark:hover:bg-slate-950"
                    disabled={!isMapReady}
                    onClick={handlePerspectiveToggle}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Layers3 className="size-4" />
                    {isThreeDimensional ? 'Flat view' : '3D view'}
                </Button>

                <div className="flex flex-col gap-2">
                    <Button
                        className="rounded-full border-white/70 bg-white/92 text-foreground shadow-lg backdrop-blur hover:bg-white dark:border-slate-800/90 dark:bg-slate-950/88 dark:hover:bg-slate-950"
                        disabled={!isMapReady || zoomLevel >= maximumZoom}
                        onClick={() => handleZoom(1)}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <Plus />
                        <span className="sr-only">Zoom in</span>
                    </Button>
                    <Button
                        className="rounded-full border-white/70 bg-white/92 text-foreground shadow-lg backdrop-blur hover:bg-white dark:border-slate-800/90 dark:bg-slate-950/88 dark:hover:bg-slate-950"
                        disabled={!isMapReady || zoomLevel <= minimumZoom}
                        onClick={() => handleZoom(-1)}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <Minus />
                        <span className="sr-only">Zoom out</span>
                    </Button>
                </div>
            </div>

            <div
                className="absolute top-4 left-4 z-20 flex max-w-sm flex-col gap-2"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                    <Move className="size-3.5" />
                    {hint}
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                    <MousePointer2 className="size-3.5" />
                    Use mouse wheel to zoom
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                    <Layers3 className="size-3.5" />
                    {isThreeDimensional
                        ? '3D terrain enabled'
                        : 'Top-down monitoring view'}
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                    Zoom {zoomLevel.toFixed(1)}
                </div>

                {mapError ? (
                    <div className="rounded-[20px] border border-white/70 bg-white/92 px-4 py-3 text-xs leading-5 text-muted-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                        {mapError}
                    </div>
                ) : null}

                {locationMessage ? (
                    <div className="rounded-[20px] border border-white/70 bg-white/92 px-4 py-3 text-xs leading-5 text-muted-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                        {locationMessage}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
