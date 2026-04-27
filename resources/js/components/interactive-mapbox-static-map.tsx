import 'mapbox-gl/dist/mapbox-gl.css';
import {
    Layers3,
    LocateFixed,
    LoaderCircle,
    Mic,
    Minus,
    Move,
    MousePointer2,
    Navigation,
    Plus,
    Search,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import {
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
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
    variant?: 'default' | 'user-location';
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
const minimumZoom = 0;
const maximumZoom = 22;
const terrainSourceId = 'monitoring-mapbox-terrain';
const defaultTerrainMode: TerrainMode = 'city-3d';
const buildingLayerId = 'monitoring-3d-buildings';
const localBuildingSourceId = 'monitoring-local-building-blocks';
const localBuildingShadowLayerId = 'monitoring-local-building-shadows';
const localBuildingLayerId = 'monitoring-local-3d-building-blocks';
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

type TerrainMode = 'city-3d' | 'terrain-3d' | 'satellite-3d' | 'flat';

type TerrainOption = {
    bearing: number;
    buildings: boolean;
    exaggeration: number;
    helper: string;
    label: string;
    pitch: number;
    styleUrl: string;
    terrain: boolean;
};

const terrainOptions: Record<TerrainMode, TerrainOption> = {
    'city-3d': {
        bearing: -20,
        buildings: true,
        exaggeration: 1.35,
        helper: 'Pale 3D city map',
        label: 'City 3D',
        pitch: 72,
        styleUrl: 'mapbox://styles/mapbox/light-v11',
        terrain: true,
    },
    'terrain-3d': {
        bearing: -32,
        buildings: true,
        exaggeration: 2.8,
        helper: 'Bukid terrain, higher elevation',
        label: 'Bukid Terrain',
        pitch: 76,
        styleUrl: 'mapbox://styles/mapbox/outdoors-v12',
        terrain: true,
    },
    'satellite-3d': {
        bearing: -28,
        buildings: true,
        exaggeration: 2.2,
        helper: 'Satellite with raised terrain',
        label: 'Satellite Terrain',
        pitch: 70,
        styleUrl: 'mapbox://styles/mapbox/satellite-streets-v12',
        terrain: true,
    },
    flat: {
        bearing: 0,
        buildings: false,
        exaggeration: 0,
        helper: 'Top-down standard map',
        label: 'Flat Map',
        pitch: 0,
        styleUrl: 'mapbox://styles/mapbox/light-v11',
        terrain: false,
    },
};

function createUserLocationElement(): HTMLDivElement {
    const element = document.createElement('div');
    const arrow = document.createElement('span');
    const dot = document.createElement('span');

    element.className = 'operator-map-user-location';
    element.style.alignItems = 'center';
    element.style.display = 'flex';
    element.style.height = '42px';
    element.style.justifyContent = 'center';
    element.style.position = 'relative';
    element.style.width = '42px';

    arrow.style.borderRight = '7px solid transparent';
    arrow.style.borderLeft = '7px solid transparent';
    arrow.style.borderBottom = '18px solid #38a8ff';
    arrow.style.filter = 'drop-shadow(0 5px 8px rgba(37, 99, 235, 0.24))';
    arrow.style.left = '3px';
    arrow.style.position = 'absolute';
    arrow.style.top = '5px';
    arrow.style.transform = 'rotate(-58deg)';
    arrow.style.transformOrigin = '50% 100%';

    dot.style.backgroundColor = '#1d9bf0';
    dot.style.border = '5px solid #ffffff';
    dot.style.borderRadius = '9999px';
    dot.style.boxShadow =
        '0 9px 20px rgba(37, 99, 235, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9)';
    dot.style.height = '30px';
    dot.style.position = 'relative';
    dot.style.width = '30px';
    dot.style.zIndex = '1';

    element.append(arrow, dot);

    return element;
}

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
    if (marker.variant === 'user-location') {
        const element = createUserLocationElement();

        element.setAttribute('aria-label', marker.label ?? 'My location');
        element.title = marker.label ?? 'My location';

        return element;
    }

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

function localBuildingBlockCollection(points: MapboxPoint[]): MapboxGeoJson {
    const anchors = validPoints(points).slice(0, 12);
    const blockOffsets = [
        { depth: 22, east: -132, height: 30, north: -92, width: 42 },
        { depth: 20, east: -92, height: 24, north: -54, width: 30 },
        { depth: 24, east: -48, height: 42, north: -86, width: 34 },
        { depth: 22, east: -8, height: 28, north: -50, width: 30 },
        { depth: 26, east: 44, height: 50, north: -88, width: 44 },
        { depth: 20, east: 96, height: 26, north: -50, width: 32 },
        { depth: 22, east: -114, height: 22, north: 0, width: 32 },
        { depth: 24, east: -62, height: 38, north: 28, width: 40 },
        { depth: 22, east: -8, height: 32, north: 12, width: 34 },
        { depth: 20, east: 44, height: 28, north: 36, width: 30 },
        { depth: 24, east: 96, height: 36, north: 12, width: 38 },
        { depth: 20, east: -94, height: 44, north: 78, width: 34 },
        { depth: 24, east: -30, height: 26, north: 92, width: 42 },
        { depth: 22, east: 34, height: 48, north: 82, width: 36 },
        { depth: 20, east: 92, height: 24, north: 78, width: 30 },
    ];

    return {
        type: 'FeatureCollection',
        features: anchors.flatMap((point, anchorIndex) => {
            const latitude = clampLatitude(point.latitude);
            const longitude = wrapLongitude(point.longitude);
            const metersPerLatitudeDegree = 111_320;
            const metersPerLongitudeDegree =
                Math.cos((latitude * Math.PI) / 180) * metersPerLatitudeDegree;

            return blockOffsets.map((block, blockIndex) => {
                const centerLongitude =
                    longitude + block.east / metersPerLongitudeDegree;
                const centerLatitude =
                    latitude + block.north / metersPerLatitudeDegree;
                const halfWidth = block.width / 2 / metersPerLongitudeDegree;
                const halfDepth = block.depth / 2 / metersPerLatitudeDegree;

                return {
                    type: 'Feature',
                    properties: {
                        base: 0,
                        color:
                            blockIndex % 4 === 0
                                ? '#f7f2de'
                                : blockIndex % 4 === 1
                                  ? '#eee6cf'
                                  : blockIndex % 4 === 2
                                    ? '#e1d8bf'
                                    : '#d7ceb8',
                        height: block.height + anchorIndex * 2.5,
                        shadowColor: '#857864',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    centerLongitude - halfWidth,
                                    centerLatitude - halfDepth,
                                ],
                                [
                                    centerLongitude + halfWidth,
                                    centerLatitude - halfDepth,
                                ],
                                [
                                    centerLongitude + halfWidth,
                                    centerLatitude + halfDepth,
                                ],
                                [
                                    centerLongitude - halfWidth,
                                    centerLatitude + halfDepth,
                                ],
                                [
                                    centerLongitude - halfWidth,
                                    centerLatitude - halfDepth,
                                ],
                            ],
                        ],
                    },
                };
            });
        }),
    } as MapboxGeoJson;
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

function cameraPerspective(terrainMode: TerrainMode): CameraPerspective {
    const terrainOption = terrainOptions[terrainMode];

    return {
        bearing: terrainOption.bearing,
        pitch: terrainOption.pitch,
    };
}

function focusMapOnBounds(
    map: mapboxgl.Map,
    bounds: mapboxgl.LngLatBounds,
    fallbackZoom: number,
    terrainMode: TerrainMode,
    options: {
        maxZoom: number;
        padding: number;
    },
): void {
    const perspective = cameraPerspective(terrainMode);
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

function safelySetPaintProperty(
    map: mapboxgl.Map,
    layerId: string,
    property: string,
    value: unknown,
): void {
    try {
        map.setPaintProperty(
            layerId,
            property as Parameters<mapboxgl.Map['setPaintProperty']>[1],
            value as Parameters<mapboxgl.Map['setPaintProperty']>[2],
        );
    } catch {
        // Some Mapbox style layers do not expose every paint property.
    }
}

function applyPaleCityMapTreatment(map: mapboxgl.Map): void {
    const layers = map.getStyle().layers ?? [];

    for (const layer of layers) {
        const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : '';

        if (layer.type === 'background') {
            safelySetPaintProperty(
                map,
                layer.id,
                'background-color',
                '#f6f2ed',
            );
        }

        if (layer.type === 'fill') {
            if (sourceLayer === 'landuse' || sourceLayer === 'landcover') {
                safelySetPaintProperty(map, layer.id, 'fill-color', '#f4f0ea');
                safelySetPaintProperty(map, layer.id, 'fill-opacity', 0.82);
            }

            if (sourceLayer === 'water') {
                safelySetPaintProperty(map, layer.id, 'fill-color', '#dbe6ee');
            }
        }

        if (
            layer.type === 'line' &&
            (sourceLayer === 'road' || layer.id.includes('road'))
        ) {
            safelySetPaintProperty(map, layer.id, 'line-color', '#aebfd3');
            safelySetPaintProperty(map, layer.id, 'line-opacity', 0.92);
        }

        if (layer.type === 'symbol') {
            safelySetPaintProperty(map, layer.id, 'text-color', '#98652b');
            safelySetPaintProperty(map, layer.id, 'text-halo-color', '#fffaf2');
            safelySetPaintProperty(map, layer.id, 'text-halo-width', 1.35);
            safelySetPaintProperty(map, layer.id, 'icon-opacity', 0.72);
        }
    }
}

function enableThreeDimensionalMapLayers(
    map: mapboxgl.Map,
    terrainMode: TerrainMode,
): void {
    if (!map.isStyleLoaded()) {
        return;
    }

    const terrainOption = terrainOptions[terrainMode];

    if (terrainMode === 'city-3d' || terrainMode === 'flat') {
        applyPaleCityMapTreatment(map);
    }

    map.setFog({
        color: 'rgb(246, 242, 236)',
        'horizon-blend': 0.08,
        'high-color': 'rgb(232, 239, 248)',
        'space-color': 'rgb(218, 227, 240)',
        'star-intensity': 0,
    });

    if (terrainOption.terrain) {
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
            exaggeration: terrainOption.exaggeration,
        });
    } else {
        map.setTerrain(null);
    }

    if (
        !terrainOption.buildings ||
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
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'height'], 12],
                0,
                '#f5f1df',
                18,
                '#ece6d4',
                45,
                '#ddd6c6',
                90,
                '#cbc4b6',
            ],
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                14.2,
                ['get', 'height'],
            ],
            'fill-extrusion-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0.68,
                16,
                0.9,
            ],
            'fill-extrusion-vertical-gradient': true,
        },
    };
    const labelLayerId = firstSymbolLayerId(map);

    if (labelLayerId === undefined) {
        map.addLayer(buildingsLayer);

        return;
    }

    map.addLayer(buildingsLayer, labelLayerId);
}

function syncLocalBuildingBlocks(
    map: mapboxgl.Map,
    points: MapboxPoint[],
    terrainMode: TerrainMode,
): void {
    if (!map.isStyleLoaded()) {
        return;
    }

    const terrainOption = terrainOptions[terrainMode];

    if (!terrainOption.buildings) {
        if (map.getLayer(localBuildingShadowLayerId) !== undefined) {
            map.removeLayer(localBuildingShadowLayerId);
        }

        if (map.getLayer(localBuildingLayerId) !== undefined) {
            map.removeLayer(localBuildingLayerId);
        }

        if (map.getSource(localBuildingSourceId) !== undefined) {
            map.removeSource(localBuildingSourceId);
        }

        return;
    }

    const buildingData = localBuildingBlockCollection(points);
    const existingSource = map.getSource(localBuildingSourceId);

    if (existingSource && 'setData' in existingSource) {
        (existingSource as mapboxgl.GeoJSONSource).setData(buildingData);
    } else {
        map.addSource(localBuildingSourceId, {
            type: 'geojson',
            data: buildingData,
        });
    }

    if (map.getLayer(localBuildingLayerId) !== undefined) {
        return;
    }

    const labelLayerId = firstSymbolLayerId(map);
    const shadowLayer: mapboxgl.FillLayer = {
        id: localBuildingShadowLayerId,
        type: 'fill',
        source: localBuildingSourceId,
        minzoom: 13,
        paint: {
            'fill-color': ['get', 'shadowColor'],
            'fill-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0.08,
                15,
                0.18,
            ],
            'fill-translate': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                ['literal', [1, 1]],
                16,
                ['literal', [5, 7]],
            ],
            'fill-translate-anchor': 'viewport',
        },
    };
    const localBuildingsLayer: mapboxgl.FillExtrusionLayer = {
        id: localBuildingLayerId,
        type: 'fill-extrusion',
        source: localBuildingSourceId,
        minzoom: 13,
        paint: {
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0,
                13.7,
                ['get', 'height'],
            ],
            'fill-extrusion-opacity': 0.96,
            'fill-extrusion-vertical-gradient': true,
        },
    };

    if (labelLayerId === undefined) {
        map.addLayer(shadowLayer);
        map.addLayer(localBuildingsLayer);

        return;
    }

    map.addLayer(shadowLayer, labelLayerId);
    map.addLayer(localBuildingsLayer, labelLayerId);
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
    const appliedTerrainModeRef = useRef<TerrainMode | null>(null);
    const terrainModeRef = useRef<TerrainMode>(defaultTerrainMode);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocationMarker, setUserLocationMarker] =
        useState<InteractiveMapMarker | null>(null);
    const [terrainMode, setTerrainMode] =
        useState<TerrainMode>(defaultTerrainMode);
    const [styleRevision, setStyleRevision] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(defaultViewport?.zoom ?? 13);
    const [bearing, setBearing] = useState(
        terrainOptions[defaultTerrainMode].bearing,
    );
    const selectedTerrainOption = terrainOptions[terrainMode];
    const isThreeDimensional = selectedTerrainOption.terrain;
    const activeMarkers =
        userLocationMarker === null
            ? markers
            : [...markers, userLocationMarker];

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
        terrainModeRef.current = terrainMode;
    }, [terrainMode]);

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
                'Mapbox access token is missing. Add VITE_MAPBOX_ACCESS_TOKEN to load the live map.',
            );

            return;
        }

        setIsMapReady(false);
        setMapError(null);
        mapboxgl.accessToken = mapboxAccessToken;
        const initialPerspective = cameraPerspective(terrainMode);

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
            style: selectedTerrainOption.styleUrl,
            touchPitch: true,
            zoom: defaultViewport.zoom,
        });

        mapRef.current = map;

        const syncZoomLevel = (): void => {
            setZoomLevel(Number(map.getZoom().toFixed(1)));
        };
        const syncBearing = (): void => {
            setBearing(Number(map.getBearing().toFixed(1)));
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

            focusMapOnBounds(
                map,
                bounds,
                defaultViewport.zoom,
                terrainModeRef.current,
                {
                    maxZoom: isThreeDimensional ? 16.4 : 15,
                    padding: isThreeDimensional ? 42 : 64,
                },
            );
        };

        const handleStyleLoad = (): void => {
            enableThreeDimensionalMapLayers(map, terrainModeRef.current);
            syncLocalBuildingBlocks(map, points, terrainModeRef.current);
            appliedTerrainModeRef.current = terrainModeRef.current;
            setStyleRevision((currentRevision) => currentRevision + 1);
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
        map.on('rotate', syncBearing);
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
    }, [activeBoundaryCollection, isMapLoaded, styleRevision]);

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
            terrainMode,
            {
                maxZoom: isThreeDimensional ? 16.4 : 15,
                padding: isThreeDimensional ? 42 : 64,
            },
        );
    }, [
        defaultViewport?.latitude,
        defaultViewport?.longitude,
        defaultViewport?.zoom,
        isMapLoaded,
        points,
        terrainMode,
    ]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded) {
            return;
        }

        const perspective = cameraPerspective(terrainMode);

        if (appliedTerrainModeRef.current !== terrainMode) {
            setIsMapReady(false);
            map.setStyle(selectedTerrainOption.styleUrl);
        } else {
            enableThreeDimensionalMapLayers(map, terrainMode);
            syncLocalBuildingBlocks(map, points, terrainMode);
            appliedTerrainModeRef.current = terrainMode;
            setStyleRevision((currentRevision) => currentRevision + 1);
        }

        map.easeTo({
            bearing: perspective.bearing,
            duration: 650,
            pitch: perspective.pitch,
        });
        setLocationMessage(`${selectedTerrainOption.label} is active.`);
    }, [
        isMapLoaded,
        selectedTerrainOption.label,
        selectedTerrainOption.styleUrl,
        terrainMode,
    ]);

    useEffect(() => {
        const map = mapRef.current;

        if (map === null || !isMapLoaded) {
            return;
        }

        syncLocalBuildingBlocks(map, points, terrainMode);
    }, [isMapLoaded, points, styleRevision, terrainMode]);

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
            terrainMode,
            {
                maxZoom: isThreeDimensional ? 16.4 : 15,
                padding: isThreeDimensional ? 42 : 64,
            },
        );

        setLocationMessage(null);
    }, [
        defaultViewport?.zoom,
        isMapLoaded,
        points,
        selectedBarangay,
        terrainMode,
    ]);

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
            terrainMode,
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
        const nextTerrainMode = isThreeDimensional
            ? 'flat'
            : defaultTerrainMode;

        setTerrainMode(nextTerrainMode);
        setLocationMessage(
            isThreeDimensional
                ? 'Flat monitoring view is active.'
                : 'City 3D view is active.',
        );
    }

    function handleTerrainModeChange(
        event: ChangeEvent<HTMLSelectElement>,
    ): void {
        setTerrainMode(event.target.value as TerrainMode);
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const map = mapRef.current;
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (map === null || normalizedQuery.length === 0) {
            return;
        }

        const matchedMarker = activeMarkers.find((marker) =>
            [marker.label, marker.barangay, marker.id]
                .filter(Boolean)
                .some((value) =>
                    value?.toLowerCase().includes(normalizedQuery),
                ),
        );

        if (matchedMarker === undefined) {
            setLocationMessage(`No mapped location matched "${searchQuery}".`);

            return;
        }

        const perspective = cameraPerspective(terrainMode);

        map.easeTo({
            center: [
                wrapLongitude(matchedMarker.longitude),
                clampLatitude(matchedMarker.latitude),
            ],
            duration: 850,
            zoom: Math.max(map.getZoom(), 15.5),
            ...perspective,
        });
        setLocationMessage(`${matchedMarker.label ?? searchQuery} is centered.`);
    }

    function handleVoiceSearch(): void {
        setLocationMessage('Voice search is ready for the next browser integration.');
    }

    function handleResetCompass(): void {
        const map = mapRef.current;
        const perspective = cameraPerspective(terrainMode);

        if (map === null) {
            return;
        }

        map.easeTo({
            bearing: perspective.bearing,
            duration: 550,
            pitch: perspective.pitch,
        });
        setLocationMessage('Map direction reset.');
    }

    function handleLocate(): void {
        const map = mapRef.current;
        const perspective = cameraPerspective(terrainMode);

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
                    label: 'My location',
                    latitude,
                    longitude,
                    size: 'medium',
                    variant: 'user-location',
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
        const perspective = cameraPerspective(terrainMode);

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

    const hasBlockingMapError =
        mapError !== null && mapError !== backupPreviewMessage;

    return (
        <div
            aria-label={ariaLabel}
            className={cn(
                'interactive-map-shell group relative isolate h-full min-h-[260px] overflow-hidden rounded-[24px] bg-slate-100/80 dark:bg-slate-950/75',
                className,
            )}
            role="region"
        >
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

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent_18%,rgba(255,255,255,0.12)_100%)]" />

            {!isMapLoaded && mapError === null ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur dark:border-slate-800/90 dark:bg-slate-950/88">
                        <LoaderCircle className="size-4 animate-spin" />
                        Loading map...
                    </div>
                </div>
            ) : null}

            {hasBlockingMapError ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 px-6 text-center">
                    <div className="max-w-md space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                            Interactive map unavailable.
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {mapError}
                        </p>
                    </div>
                </div>
            ) : null}

            <form
                aria-label="Search map locations"
                className="absolute top-4 right-4 left-4 z-20 flex h-16 items-center gap-3 rounded-[18px] border border-slate-200/80 bg-white/95 px-4 text-slate-600 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur md:left-6 md:max-w-xl"
                onPointerDown={(event) => event.stopPropagation()}
                onSubmit={handleSearchSubmit}
            >
                <Search className="size-8 shrink-0 text-slate-300" />
                <input
                    className="h-full min-w-0 flex-1 bg-transparent text-xl font-medium text-slate-700 outline-none placeholder:text-slate-300"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search Location"
                    type="search"
                    value={searchQuery}
                />
                <button
                    aria-label="Voice search"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-50 disabled:text-slate-300"
                    disabled={!isMapReady}
                    onClick={handleVoiceSearch}
                    type="button"
                >
                    <Mic className="size-8" />
                </button>
            </form>

            <label
                className="absolute top-24 left-4 z-20 flex w-[min(15rem,calc(100%-6rem))] flex-col gap-1 rounded-[18px] border border-white/80 bg-white/95 px-3 py-2 text-slate-700 shadow-[0_16px_42px_rgba(15,23,42,0.12)] backdrop-blur md:top-[5.5rem] md:left-6"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                    Terrain
                </span>
                <select
                    aria-label="Terrain style"
                    className="h-8 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                    disabled={!isMapReady}
                    onChange={handleTerrainModeChange}
                    value={terrainMode}
                >
                    {Object.entries(terrainOptions).map(([value, option]) => (
                        <option key={value} value={value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="text-[11px] font-medium text-slate-500">
                    {selectedTerrainOption.helper}
                </span>
            </label>

            <div
                className="absolute top-24 right-4 z-20 flex items-start gap-2 md:top-5 md:right-5"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <button
                    aria-label="Reset map direction"
                    className="flex size-16 items-center justify-center rounded-full bg-black text-white shadow-[0_18px_46px_rgba(15,23,42,0.28)] transition hover:scale-105 disabled:opacity-60"
                    disabled={!isMapReady}
                    onClick={handleResetCompass}
                    style={{
                        transform: `rotate(${-bearing}deg)`,
                    }}
                    type="button"
                >
                    <Navigation className="size-8 fill-rose-500 text-rose-500 [clip-path:polygon(50%_0,100%_100%,50%_78%,0_100%)]" />
                </button>
            </div>

            <div
                className="absolute right-4 bottom-5 z-20 flex flex-col items-end gap-3"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <Button
                    className="size-16 rounded-[16px] border-white bg-white text-slate-900 shadow-[0_18px_46px_rgba(15,23,42,0.18)] hover:bg-white"
                    disabled={isLocating || !isMapReady}
                    onClick={handleLocate}
                    size="icon"
                    type="button"
                    variant="outline"
                >
                    {isLocating ? (
                        <LoaderCircle className="size-8 animate-spin" />
                    ) : (
                        <LocateFixed className="size-8" />
                    )}
                    <span className="sr-only">My location</span>
                </Button>
            </div>

            <div
                className="absolute bottom-5 left-4 z-20 flex max-w-[min(20rem,calc(100%-7rem))] flex-col gap-3"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <div className="w-48 text-[11px] font-semibold text-slate-900 drop-shadow">
                    <div className="mb-1 flex justify-between px-0.5">
                        <span>0</span>
                        <span>25 m</span>
                        <span>50 m</span>
                    </div>
                    <div className="grid h-3 grid-cols-2 border-2 border-white bg-white shadow-md">
                        <span className="bg-black" />
                        <span className="bg-white" />
                    </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/92 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
                    <Layers3 className="size-3.5" />
                    {selectedTerrainOption.label}
                </div>
            </div>

            <div
                className="absolute top-44 left-4 z-20 hidden max-w-sm flex-col gap-2 md:top-40 md:left-6 lg:flex"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <Button
                    className="rounded-full border-white/70 bg-white/92 text-slate-700 shadow-lg backdrop-blur hover:bg-white"
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
                className="absolute top-44 left-6 z-20 hidden max-w-sm flex-col gap-2 xl:flex"
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
