<?php

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('authenticated users can visit map monitoring with summary markers and hazard overlays', function () {
    $admin = User::factory()->create();

    $dahicanHead = User::factory()->create([
        'name' => 'Ariel Lim',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
    ]);

    HouseholdMember::factory()->count(219)->create([
        'household_id' => $dahicanHousehold->id,
    ]);

    $macambolHead = User::factory()->create([
        'name' => 'Mila Ramos',
    ]);

    $macambolHousehold = Household::factory()->create([
        'barangay' => 'Macambol',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'landslide',
        'head_user_id' => $macambolHead->id,
    ]);

    HouseholdMember::factory()->count(139)->create([
        'household_id' => $macambolHousehold->id,
    ]);

    $centralHead = User::factory()->create([
        'name' => 'Nora Diaz',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
    ]);

    HouseholdMember::factory()->count(59)->create([
        'household_id' => $centralHousehold->id,
    ]);

    $this->actingAs($admin);

    $this->get(route('map-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('map-monitoring')
            ->where('dashboard.mapMonitoring.meta.supportsDirections', true)
            ->where('dashboard.mapMonitoring.meta.supportsGeolocation', true)
            ->where('dashboard.mapMonitoring.summary.total', 3)
            ->where('dashboard.mapMonitoring.summary.open', 1)
            ->where('dashboard.mapMonitoring.summary.nearFull', 1)
            ->where('dashboard.mapMonitoring.summary.full', 1)
            ->where('dashboard.mapMonitoring.filters.statuses.0', 'Available')
            ->where('dashboard.mapMonitoring.filters.statuses.1', 'Near Full')
            ->where('dashboard.mapMonitoring.filters.statuses.2', 'Full')
            ->where('dashboard.mapMonitoring.markers.0.barangay', 'Dahican')
            ->where('dashboard.mapMonitoring.markers.0.status', 'Full')
            ->where('dashboard.mapMonitoring.markers.1.barangay', 'Macambol')
            ->where('dashboard.mapMonitoring.markers.1.status', 'Near Full')
            ->where('dashboard.mapMonitoring.markers.2.barangay', 'Central')
            ->where('dashboard.mapMonitoring.markers.2.status', 'Available')
            ->has('dashboard.mapMonitoring.filters.barangays', 3)
            ->has('dashboard.mapMonitoring.legend', 3)
            ->has('dashboard.mapMonitoring.hazardAreas', 3)
            ->has('dashboard.mapMonitoring.markers', 3),
        );
});

test('barangay committee map monitoring is scoped to the assigned barangay', function () {
    $committee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $centralHead = User::factory()->create([
        'name' => 'Ana Central',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
        'name' => 'Central Household',
    ]);

    HouseholdMember::factory()->count(4)->create([
        'household_id' => $centralHousehold->id,
    ]);

    $dahicanHead = User::factory()->create([
        'name' => 'Ella Dahican',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
        'name' => 'Dahican Household',
    ]);

    HouseholdMember::factory()->count(3)->create([
        'household_id' => $dahicanHousehold->id,
    ]);

    $this->actingAs($committee)
        ->get(route('map-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('map-monitoring')
            ->where('dashboard.command.status', 'Central barangay monitoring is active.')
            ->has('dashboard.mapMonitoring.filters.barangays', 1)
            ->where('dashboard.mapMonitoring.filters.barangays.0', 'Central')
            ->has('dashboard.mapMonitoring.markers', 1)
            ->where('dashboard.mapMonitoring.markers.0.barangay', 'Central')
            ->where('dashboard.mapMonitoring.markers.0.name', 'Central Evacuation Center')
            ->has('dashboard.mapMonitoring.hazardAreas', 1)
            ->where('dashboard.mapMonitoring.hazardAreas.0.label', 'Flood-prone')
            ->where('dashboard.mapMonitoring.hazardAreas.0.barangays.0', 'Central')
            ->where('dashboard.mapMonitoring.summary.total', 1));
});

test('map monitoring page restores the interactive monitoring map preview', function () {
    $page = file_get_contents(resource_path('js/pages/map-monitoring.tsx'));

    expect($page)
        ->toContain('Drag-ready monitoring map')
        ->toContain('Focused Barangay')
        ->toContain('Assigned Monitoring Map')
        ->toContain('Committee Map Notes')
        ->toContain('Monitoring Map')
        ->toContain('InteractiveMapboxStaticMap')
        ->toContain('Live Center Markers')
        ->toContain('Selected Border')
        ->toContain('Selected Center Snapshot')
        ->toContain('Choose barangay border')
        ->toContain('No border selected')
        ->toContain('matiBarangayNames.map')
        ->toContain('Border Focus')
        ->toContain('Use the barangay dropdown above')
        ->toContain('Center Monitoring Data')
        ->not->toContain('Expand Map')
        ->not->toContain('Reset View')
        ->not->toContain('handleFindMyLocation')
        ->not->toContain('toggleMapFullscreen')
        ->not->toContain('changeMapZoom')
        ->not->toContain('handleMapPointerDown')
        ->not->toContain('handleMapPointerMove')
        ->not->toContain('handleMapPointerEnd')
        ->not->toContain('projectUserLocation');
});

test('interactive map component uses live mapbox controls and browser location', function () {
    $component = file_get_contents(
        resource_path('js/components/interactive-mapbox-static-map.tsx'),
    );
    $styles = file_get_contents(resource_path('css/app.css'));

    expect($component)
        ->not->toBeFalse()
        ->and($component)
        ->toContain(
            "import 'mapbox-gl/dist/mapbox-gl.css'",
            'new mapboxgl.Map(',
            'MapboxStaticMap',
            'Layers3',
            'My location',
            '3D view',
            'Flat view',
            '3D terrain enabled',
            'Use mouse wheel to zoom',
            'Zoom in',
            'Zoom out',
            'pointsBounds',
            'boundarySourceId',
            'buildingLayerId',
            'monitoring-barangay-boundaries',
            'monitoring-3d-buildings',
            'boundaryFillLayerId',
            'boundaryAccentLayerId',
            'enableThreeDimensionalMapLayers',
            'mapbox://mapbox.mapbox-terrain-dem-v1',
            'map.setTerrain({',
            'antialias: true',
            'pitchWithRotate: true',
            'touchPitch: true',
            'map.addSource(boundarySourceId',
            'map.getSource(',
            "'line-dasharray': [1, 1.2]",
            'isSelected',
            'border is visible on the 3D map.',
            'border is visible on the map.',
            'map.areTilesLoaded()',
            'ResizeObserver',
            'map.resize()',
            'map.dragPan.enable()',
            'map.dragRotate.enable()',
            'map.scrollZoom.enable()',
            'map.touchZoomRotate.enableRotation()',
            'map.fitBounds(',
            'map.easeTo(',
            'Backup preview is active while the live map finishes loading.',
            'navigator.geolocation.getCurrentPosition',
            'handlePerspectiveToggle',
            'handleZoom',
            'Drag to pan',
        )
        ->not->toContain(
            'dragOffset',
            'translate3d(',
            'onWheel={handleWheel}',
            "map.on('click', boundaryFillLayerId",
            "element.addEventListener('click'",
        );

    expect($styles)
        ->not->toBeFalse()
        ->and($styles)
        ->toContain(
            '.interactive-map-shell .mapboxgl-map',
            '.interactive-map-shell .mapboxgl-canvas-container',
            '.interactive-map-shell .mapboxgl-canvas',
        );
});

test('mati barangay boundary data is available for map highlighting', function () {
    $boundaries = file_get_contents(
        resource_path('js/lib/mati-barangay-boundaries.ts'),
    );

    expect($boundaries)
        ->not->toBeFalse()
        ->and($boundaries)
        ->toContain(
            'export const matiBarangayNames',
            '"barangay": "Badas"',
            '"barangay": "Bobon"',
            '"barangay": "Buso"',
            '"barangay": "Central"',
            '"barangay": "Dahican"',
            '"barangay": "Don Salvador Lopez, Sr."',
            '"barangay": "Macambol"',
            '"barangay": "Tamisan"',
            '"type": "MultiPolygon"',
            'getMatiBarangayBoundaryCollection',
        );
});

test('mati boundaries stay within the public PSGC barangay footprints', function () {
    $boundaries = file_get_contents(
        resource_path('js/lib/mati-barangay-boundaries.ts'),
    );
    $expectedBoundaries = [
        'Badas' => ['bbox' => [126.165871, 6.876281, 126.198209, 6.956872], 'points' => 674, 'type' => 'Polygon'],
        'Bobon' => ['bbox' => [126.280027, 6.834413, 126.346704, 6.909068], 'points' => 304, 'type' => 'Polygon'],
        'Buso' => ['bbox' => [126.214327, 6.990471, 126.263503, 7.03258], 'points' => 32, 'type' => 'Polygon'],
        'Cabuaya' => ['bbox' => [126.17099, 6.472877, 126.231916, 6.615495], 'points' => 598, 'type' => 'Polygon'],
        'Central' => ['bbox' => [126.186013, 6.942202, 126.228638, 6.998551], 'points' => 210, 'type' => 'Polygon'],
        'Culian' => ['bbox' => [126.147354, 6.943094, 126.197082, 6.999361], 'points' => 19, 'type' => 'Polygon'],
        'Dahican' => ['bbox' => [126.239835, 6.881713, 126.311599, 6.966029], 'points' => 985, 'type' => 'Polygon'],
        'Danao' => ['bbox' => [126.106254, 6.910445, 126.145608, 6.935741], 'points' => 14, 'type' => 'Polygon'],
        'Dawan' => ['bbox' => [126.124242, 6.881013, 126.173376, 6.937496], 'points' => 203, 'type' => 'Polygon'],
        'Don Enrique Lopez' => ['bbox' => [126.29412, 6.96367, 126.322861, 7.011663], 'points' => 49, 'type' => 'Polygon'],
        'Don Martin Marundan' => ['bbox' => [126.24385, 6.9436, 126.295954, 7.015529], 'points' => 57, 'type' => 'Polygon'],
        'Don Salvador Lopez, Sr.' => ['bbox' => [126.245182, 6.972972, 126.300843, 7.095299], 'points' => 55, 'type' => 'Polygon'],
        'Langka' => ['bbox' => [126.18402, 6.269285, 126.209806, 6.418287], 'points' => 529, 'type' => 'Polygon'],
        'Lawigan' => ['bbox' => [126.287421, 6.798632, 126.352315, 6.838398], 'points' => 384, 'type' => 'Polygon'],
        'Libudon' => ['bbox' => [126.112571, 6.929827, 126.16652, 6.962291], 'points' => 18, 'type' => 'Polygon'],
        'Luban' => ['bbox' => [126.181193, 6.417841, 126.225745, 6.473125], 'points' => 179, 'type' => 'Polygon'],
        'Macambol' => ['bbox' => [126.155474, 6.614937, 126.292317, 6.87138], 'points' => 1369, 'type' => 'MultiPolygon'],
        'Mamali' => ['bbox' => [126.133792, 6.861967, 126.173699, 6.890216], 'points' => 141, 'type' => 'Polygon'],
        'Matiao' => ['bbox' => [126.226122, 6.932576, 126.251586, 6.991042], 'points' => 213, 'type' => 'Polygon'],
        'Mayo' => ['bbox' => [126.293641, 6.987028, 126.33747, 7.033656], 'points' => 78, 'type' => 'Polygon'],
        'Sainz' => ['bbox' => [126.165514, 6.954263, 126.237273, 7.028131], 'points' => 30, 'type' => 'Polygon'],
        'Sanghay' => ['bbox' => [126.126012, 6.952864, 126.166883, 7.028131], 'points' => 13, 'type' => 'Polygon'],
        'Tagabakid' => ['bbox' => [126.329415, 6.992404, 126.375534, 7.033656], 'points' => 206, 'type' => 'Polygon'],
        'Tagbinonga' => ['bbox' => [126.217475, 7.015908, 126.248005, 7.107239], 'points' => 19, 'type' => 'Polygon'],
        'Taguibo' => ['bbox' => [126.165514, 7.012096, 126.223338, 7.096378], 'points' => 13, 'type' => 'Polygon'],
        'Tamisan' => ['bbox' => [126.273091, 6.823795, 126.330228, 6.866004], 'points' => 349, 'type' => 'MultiPolygon'],
    ];

    expect($boundaries)->not->toBeFalse();

    preg_match(
        '/export const matiBarangayBoundaries: BarangayBoundaryCollection = (\{.*?\n\});/s',
        $boundaries,
        $matches,
    );

    expect($matches[1] ?? null)->not->toBeNull();

    $collection = json_decode($matches[1], true, 512, JSON_THROW_ON_ERROR);
    $featuresByBarangay = collect($collection['features'])
        ->keyBy(fn (array $feature): string => $feature['properties']['barangay']);

    expect($featuresByBarangay->keys()->sort()->values()->all())
        ->toBe(collect(MatiCityAddressOptions::barangays())->sort()->values()->all());

    foreach ($expectedBoundaries as $barangay => $expectedBoundary) {
        $feature = $featuresByBarangay->get($barangay);
        $points = [];
        $collectPoints = function (array $coordinates) use (&$collectPoints, &$points): void {
            if (
                count($coordinates) >= 2
                && is_numeric($coordinates[0])
                && is_numeric($coordinates[1])
            ) {
                $points[] = [(float) $coordinates[0], (float) $coordinates[1]];

                return;
            }

            foreach ($coordinates as $coordinate) {
                if (is_array($coordinate)) {
                    $collectPoints($coordinate);
                }
            }
        };

        expect($feature)->not->toBeNull();

        $collectPoints($feature['geometry']['coordinates']);

        $longitudes = array_map(fn (array $point): float => $point[0], $points);
        $latitudes = array_map(fn (array $point): float => $point[1], $points);
        $bounds = [
            round(min($longitudes), 6),
            round(min($latitudes), 6),
            round(max($longitudes), 6),
            round(max($latitudes), 6),
        ];

        expect($feature['geometry']['type'])
            ->toBe($expectedBoundary['type'])
            ->and($feature['properties']['sourceBarangays'])
            ->toBe([$barangay])
            ->and($points)
            ->toHaveCount($expectedBoundary['points'])
            ->and($bounds)
            ->toBe($expectedBoundary['bbox']);
    }
});

test('static map component keeps map swaps smooth while new images load', function () {
    $component = file_get_contents(
        resource_path('js/components/mapbox-static-map.tsx'),
    );

    expect($component)
        ->not->toBeFalse()
        ->and($component)
        ->toContain(
            'pendingUrl',
            'preloadImage.onload',
            'transition-transform duration-200 ease-out',
        );
});
