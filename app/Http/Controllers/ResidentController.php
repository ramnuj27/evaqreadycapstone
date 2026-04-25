<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHouseholdMemberRequest;
use App\Http\Requests\UpdateHouseholdMemberRequest;
use App\Http\Requests\UpdateResidentProfileRequest;
use App\Models\AlertBroadcast;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\HouseholdQrCode;
use App\Support\MatiCityAddressOptions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ResidentController extends Controller
{
    public function __construct(
        private readonly HouseholdQrCode $householdQrCode,
    ) {}

    public function dashboard(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());
        $alerts = $this->residentAlerts($household?->barangay);
        $centers = $this->evacuationCenterDirectory($household);

        return Inertia::render('resident-dashboard', [
            'residentDashboard' => [
                'evacuationStatus' => $this->evacuationStatusPayload(
                    $household?->evacuation_status,
                ),
                'hazardZone' => $this->labelValue($household?->hazard_zone),
                'householdCode' => $household?->household_code,
                'householdSize' => $household === null
                    ? 0
                    : 1 + $household->members->count(),
                'latestAlert' => $alerts->first(),
                'nearestCenter' => $centers[0] ?? null,
                'qrStatus' => $household === null ? 'Pending' : 'Ready',
                'residentName' => $request->user()->name,
            ],
        ]);
    }

    public function profile(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());

        return Inertia::render('resident-profile', [
            'availableBarangays' => MatiCityAddressOptions::barangays(),
            'profile' => $this->profilePayload($request->user(), $household),
            'pwdTypes' => $this->pwdTypes(),
        ]);
    }

    public function household(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());

        return Inertia::render('resident-household', [
            'household' => $this->householdPayload($household),
            'pwdTypes' => $this->pwdTypes(),
        ]);
    }

    public function qrCode(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());

        return Inertia::render('resident-qr-code', [
            'qrCode' => $household === null
                ? null
                : [
                    'barangay' => $household->barangay,
                    'householdCode' => $household->household_code,
                    'householdName' => $household->name,
                    'payload' => $this->householdQrCode->payloadFor($household),
                    'residentName' => $household->headUser?->name,
                    'status' => $this->evacuationStatusPayload(
                        $household->evacuation_status,
                    )['label'],
                    'svg' => $this->householdQrCode->svgFor($household),
                ],
        ]);
    }

    public function alerts(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());

        return Inertia::render('resident-alerts', [
            'alerts' => $this->residentAlerts($household?->barangay)->all(),
        ]);
    }

    public function evacuationCenters(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());

        return Inertia::render('resident-evacuation-centers', [
            'centers' => $this->evacuationCenterDirectory($household),
        ]);
    }

    public function map(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());
        $centers = $this->residentMapCenterDirectory($household);
        $currentLocation = $this->currentLocationPayload($household);
        $nearestCenter = $centers[0] ?? null;

        return Inertia::render('resident-map', [
            'mapData' => [
                'centers' => $centers,
                'currentLocation' => $currentLocation,
                'hazardZone' => $this->labelValue($household?->hazard_zone),
                'nearestCenter' => $nearestCenter,
                'route' => $this->routePayload($currentLocation, $nearestCenter),
            ],
        ]);
    }

    public function evacuationAr(Request $request): Response
    {
        $household = $this->residentHousehold($request->user());
        $centers = $this->evacuationCenterDirectory($household);
        $currentLocation = $this->currentLocationPayload($household);

        return Inertia::render('resident-evacuation-ar', [
            'arGuide' => [
                'centers' => $centers,
                'currentLocation' => $currentLocation,
                'hazardZone' => $this->labelValue($household?->hazard_zone),
                'nearestCenter' => $centers[0] ?? null,
                'residentName' => $request->user()->name,
            ],
        ]);
    }

    public function disasterInfo(Request $request): Response
    {
        return Inertia::render('resident-disaster-info');
    }

    public function updateProfile(
        UpdateResidentProfileRequest $request,
    ): RedirectResponse {
        $validated = $request->validated();
        $user = $request->user();
        $household = $user->household()->first();

        $user->fill([
            'birthdate' => $validated['birthdate'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'email' => $validated['email'],
            'gender' => $validated['gender'] ?? null,
            'is_pregnant' => ($validated['gender'] ?? null) === 'female'
                ? (bool) ($validated['is_pregnant'] ?? false)
                : false,
            'name' => $validated['name'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($household !== null) {
            $household->forceFill([
                'barangay' => $validated['barangay'],
                'city' => MatiCityAddressOptions::city(),
                'is_pwd' => (bool) ($validated['is_pwd'] ?? false),
                'pwd_type' => (bool) ($validated['is_pwd'] ?? false)
                    ? ($validated['pwd_type'] ?? null)
                    : null,
                'pwd_type_other' => (bool) ($validated['is_pwd'] ?? false)
                    && ($validated['pwd_type'] ?? null) === 'other'
                    ? ($validated['pwd_type_other'] ?? null)
                    : null,
                'street_address' => $validated['street_address'],
            ])->save();
        }

        return to_route('resident.profile');
    }

    public function storeHouseholdMember(
        StoreHouseholdMemberRequest $request,
    ): RedirectResponse {
        $household = $request->user()->household()->firstOrFail();
        $validated = $request->validated();

        $household->members()->create([
            'birthdate' => $validated['birthdate'],
            'category' => $validated['category'],
            'full_name' => $validated['full_name'],
            'gender' => $validated['gender'],
            'is_pregnant' => $validated['gender'] === 'female'
                ? (bool) ($validated['is_pregnant'] ?? false)
                : false,
            'is_pwd' => (bool) ($validated['is_pwd'] ?? false),
            'pwd_type' => (bool) ($validated['is_pwd'] ?? false)
                ? ($validated['pwd_type'] ?? null)
                : null,
            'pwd_type_other' => (bool) ($validated['is_pwd'] ?? false)
                && ($validated['pwd_type'] ?? null) === 'other'
                ? ($validated['pwd_type_other'] ?? null)
                : null,
            'sort_order' => ((int) $household->members()->max('sort_order')) + 1,
        ]);

        return to_route('resident.household');
    }

    public function updateHouseholdMember(
        UpdateHouseholdMemberRequest $request,
        HouseholdMember $member,
    ): RedirectResponse {
        $validated = $request->validated();

        $member->update([
            'birthdate' => $validated['birthdate'],
            'category' => $validated['category'],
            'full_name' => $validated['full_name'],
            'gender' => $validated['gender'],
            'is_pregnant' => $validated['gender'] === 'female'
                ? (bool) ($validated['is_pregnant'] ?? false)
                : false,
            'is_pwd' => (bool) ($validated['is_pwd'] ?? false),
            'pwd_type' => (bool) ($validated['is_pwd'] ?? false)
                ? ($validated['pwd_type'] ?? null)
                : null,
            'pwd_type_other' => (bool) ($validated['is_pwd'] ?? false)
                && ($validated['pwd_type'] ?? null) === 'other'
                ? ($validated['pwd_type_other'] ?? null)
                : null,
        ]);

        return to_route('resident.household');
    }

    public function destroyHouseholdMember(
        Request $request,
        HouseholdMember $member,
    ): RedirectResponse {
        $household = $request->user()->household()->firstOrFail();

        abort_unless($member->household_id === $household->id, 403);

        $member->delete();

        $household->members()
            ->orderBy('sort_order')
            ->get()
            ->values()
            ->each(function (HouseholdMember $householdMember, int $index): void {
                if ($householdMember->sort_order !== $index) {
                    $householdMember->update(['sort_order' => $index]);
                }
            });

        return to_route('resident.household');
    }

    private function residentHousehold(User $user): ?Household
    {
        return Household::query()
            ->with([
                'headUser:id,name,email,contact_number,gender,birthdate,is_pregnant',
                'members:id,household_id,full_name,gender,birthdate,category,is_pwd,pwd_type,pwd_type_other,is_pregnant,sort_order',
            ])
            ->where('head_user_id', $user->id)
            ->first([
                'id',
                'head_user_id',
                'name',
                'household_code',
                'household_role',
                'street_address',
                'barangay',
                'city',
                'hazard_zone',
                'status',
                'evacuation_status',
                'evacuation_status_updated_at',
                'is_pwd',
                'pwd_type',
                'pwd_type_other',
            ]);
    }

    private function profilePayload(User $user, ?Household $household): array
    {
        return [
            'address' => $household?->street_address,
            'barangay' => $household?->barangay,
            'birthdate' => $user->birthdate?->toDateString(),
            'city' => $household?->city ?? MatiCityAddressOptions::city(),
            'contactNumber' => $user->contact_number,
            'email' => $user->email,
            'gender' => $user->gender,
            'isPregnant' => (bool) $user->is_pregnant,
            'isPwd' => (bool) ($household?->is_pwd ?? false),
            'name' => $user->name,
            'pwdType' => $household?->pwd_type,
            'pwdTypeOther' => $household?->pwd_type_other,
        ];
    }

    private function householdPayload(?Household $household): ?array
    {
        if ($household === null) {
            return null;
        }

        return [
            'address' => $this->fullAddress($household),
            'barangay' => $household->barangay,
            'city' => $household->city,
            'evacuationStatus' => $this->evacuationStatusPayload(
                $household->evacuation_status,
            ),
            'hazardZone' => [
                'key' => $household->hazard_zone,
                'label' => $this->labelValue($household->hazard_zone),
            ],
            'head' => [
                'birthdate' => $household->headUser?->birthdate?->toDateString(),
                'contactNumber' => $household->headUser?->contact_number,
                'email' => $household->headUser?->email,
                'gender' => $household->headUser?->gender,
                'isPregnant' => (bool) $household->headUser?->is_pregnant,
                'isPwd' => (bool) $household->is_pwd,
                'name' => $household->headUser?->name,
                'pwdType' => $household->pwd_type,
                'pwdTypeOther' => $household->pwd_type_other,
            ],
            'householdCode' => $household->household_code,
            'householdRole' => $household->household_role ?? 'Head of Family',
            'members' => $household->members
                ->map(fn (HouseholdMember $member): array => [
                    'birthdate' => $member->birthdate?->toDateString(),
                    'category' => $member->category,
                    'fullName' => $member->full_name,
                    'gender' => $member->gender,
                    'id' => $member->id,
                    'isPregnant' => (bool) $member->is_pregnant,
                    'isPwd' => (bool) $member->is_pwd,
                    'pwdType' => $member->pwd_type,
                    'pwdTypeOther' => $member->pwd_type_other,
                ])
                ->all(),
            'name' => $household->name,
            'streetAddress' => $household->street_address,
            'totalResidents' => 1 + $household->members->count(),
        ];
    }

    /**
     * @return Collection<int, array{
     *     audioEnabled: bool,
     *     audioUrl: string|null,
     *     id: int,
     *     message: string,
     *     severity: string,
     *     targetBarangay: string|null,
     *     time: string|null,
     *     title: string,
     *     type: string
     * }>
     */
    private function residentAlerts(?string $barangay): Collection
    {
        return AlertBroadcast::query()
            ->where('status', 'Active')
            ->when(
                $barangay !== null,
                fn (Builder $query) => $query->where(
                    fn (Builder $innerQuery) => $innerQuery
                        ->whereNull('target_barangay')
                        ->orWhere('target_barangay', $barangay),
                ),
            )
            ->orderByDesc('issued_at')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get([
                'id',
                'title',
                'message',
                'type',
                'severity',
                'target_barangay',
                'audio_enabled',
                'audio_url',
                'issued_at',
                'created_at',
            ])
            ->map(fn (AlertBroadcast $alertBroadcast): array => [
                'audioEnabled' => (bool) $alertBroadcast->audio_enabled,
                'audioUrl' => $alertBroadcast->audio_enabled
                    ? $alertBroadcast->audio_url
                    : null,
                'id' => $alertBroadcast->id,
                'message' => $alertBroadcast->message,
                'severity' => $this->severityKey($alertBroadcast->severity),
                'targetBarangay' => $alertBroadcast->target_barangay,
                'time' => $alertBroadcast->issued_at?->toIso8601String()
                    ?? $alertBroadcast->created_at?->toIso8601String(),
                'title' => $alertBroadcast->title,
                'type' => $alertBroadcast->type,
            ]);
    }

    /**
     * @return array<int, array{
     *     address: string,
     *     availableSlots: int,
     *     barangay: string,
     *     capacity: int,
     *     contact: string,
     *     distanceKm: string,
     *     etaMinutes: int,
     *     isNearest: bool,
     *     latitude: float,
     *     longitude: float,
     *     name: string,
     *     occupied: int,
     *     status: string,
     *     x: int,
     *     y: int
     * }>
     */
    private function residentMapCenterDirectory(?Household $household): array
    {
        $centers = $this->evacuationCenterDirectory($household);

        if ($centers !== []) {
            return $centers;
        }

        return $this->evacuationCenterDirectoryForBarangays([
            'Central',
            'Dahican',
            'Badas',
        ]);
    }

    /**
     * @return array<int, array{
     *     address: string,
     *     availableSlots: int,
     *     barangay: string,
     *     capacity: int,
     *     contact: string,
     *     distanceKm: string,
     *     etaMinutes: int,
     *     isNearest: bool,
     *     latitude: float,
     *     longitude: float,
     *     name: string,
     *     occupied: int,
     *     status: string,
     *     x: int,
     *     y: int
     * }>
     */
    private function evacuationCenterDirectory(?Household $household): array
    {
        if ($household === null) {
            return [];
        }

        $barangays = collect([
            $household->barangay,
            'Central',
            'Dahican',
            'Badas',
            'Macambol',
        ])->filter()->unique()->take(3)->values();

        return $this->evacuationCenterDirectoryForBarangays($barangays);
    }

    /**
     * @param  iterable<int, string>  $barangays
     * @return array<int, array{
     *     address: string,
     *     availableSlots: int,
     *     barangay: string,
     *     capacity: int,
     *     contact: string,
     *     distanceKm: string,
     *     etaMinutes: int,
     *     isNearest: bool,
     *     latitude: float,
     *     longitude: float,
     *     name: string,
     *     occupied: int,
     *     status: string,
     *     x: int,
     *     y: int
     * }>
     */
    private function evacuationCenterDirectoryForBarangays(
        iterable $barangays,
    ): array {
        $capacityByIndex = [220, 180, 140];
        $occupiedByIndex = [78, 134, 56];
        $statusByIndex = ['Open', 'Near Full', 'Open'];
        $distanceByIndex = ['1.8 km', '3.2 km', '5.1 km'];
        $etaByIndex = [12, 18, 27];

        return collect($barangays)->values()->map(function (
            string $barangay,
            int $index,
        ) use (
            $capacityByIndex,
            $distanceByIndex,
            $etaByIndex,
            $occupiedByIndex,
            $statusByIndex,
        ): array {
            $coordinates = $this->coordinatesForBarangay($barangay, $index);
            $capacity = $capacityByIndex[$index] ?? 120;
            $occupied = $occupiedByIndex[$index] ?? 42;

            return [
                'address' => "Barangay Hall Grounds, {$barangay}, Mati City",
                'availableSlots' => max($capacity - $occupied, 0),
                'barangay' => $barangay,
                'capacity' => $capacity,
                'contact' => $index === 0 ? '09171234567' : '09179876543',
                'distanceKm' => $distanceByIndex[$index] ?? '6.5 km',
                'etaMinutes' => $etaByIndex[$index] ?? 30,
                'isNearest' => $index === 0,
                'latitude' => $coordinates['latitude'],
                'longitude' => $coordinates['longitude'],
                'name' => "{$barangay} Evacuation Center",
                'occupied' => $occupied,
                'status' => $statusByIndex[$index] ?? 'Open',
                'x' => $coordinates['x'],
                'y' => $coordinates['y'],
            ];
        })->all();
    }

    /**
     * @return array{
     *     address: string,
     *     barangay: string,
     *     label: string,
     *     latitude: float,
     *     longitude: float,
     *     x: int,
     *     y: int
     * }|null
     */
    private function currentLocationPayload(?Household $household): ?array
    {
        if ($household === null) {
            return null;
        }

        $coordinates = $this->coordinatesForBarangay($household->barangay);

        return [
            'address' => $this->fullAddress($household),
            'barangay' => $household->barangay,
            'label' => 'You are here',
            'latitude' => $coordinates['latitude'] - 0.004,
            'longitude' => $coordinates['longitude'] + 0.003,
            'x' => max(10, $coordinates['x'] - 8),
            'y' => min(86, $coordinates['y'] + 10),
        ];
    }

    /**
     * @param  array{
     *     address: string,
     *     label: string,
     *     barangay: string,
     *     latitude: float,
     *     longitude: float,
     *     x: int,
     *     y: int
     * }|null  $currentLocation
     * @param  array{
     *     address: string,
     *     availableSlots: int,
     *     barangay: string,
     *     capacity: int,
     *     contact: string,
     *     distanceKm: string,
     *     etaMinutes: int,
     *     isNearest: bool,
     *     latitude: float,
     *     longitude: float,
     *     name: string,
     *     occupied: int,
     *     status: string,
     *     x: int,
     *     y: int
     * }|null  $nearestCenter
     * @return array{
     *     distance: string,
     *     steps: array<int, string>,
     *     travelTime: string
     * }|null
     */
    private function routePayload(
        ?array $currentLocation,
        ?array $nearestCenter,
    ): ?array {
        if ($currentLocation === null || $nearestCenter === null) {
            return null;
        }

        return [
            'distance' => $nearestCenter['distanceKm'],
            'steps' => [
                'Proceed to the nearest barangay access road from your household address.',
                "Follow barangay signages toward {$nearestCenter['name']}.",
                'Present your household QR code upon arrival for faster verification.',
            ],
            'travelTime' => "{$nearestCenter['etaMinutes']} min",
        ];
    }

    /**
     * @return array{label: string, tone: string}
     */
    private function evacuationStatusPayload(?string $status): array
    {
        $statusKey = strtolower((string) ($status ?? 'registered'));

        return match ($statusKey) {
            'evacuated' => [
                'label' => 'Evacuated',
                'tone' => 'warning',
            ],
            'missing' => [
                'label' => 'Missing',
                'tone' => 'critical',
            ],
            'not yet evacuated' => [
                'label' => 'Not Yet Evacuated',
                'tone' => 'default',
            ],
            default => [
                'label' => 'Registered',
                'tone' => 'default',
            ],
        };
    }

    private function labelValue(?string $value): string
    {
        if (! is_string($value) || trim($value) === '') {
            return 'Not provided';
        }

        return str($value)
            ->replace('-', ' ')
            ->title()
            ->toString();
    }

    private function severityKey(string $severity): string
    {
        return match (strtolower($severity)) {
            'high' => 'high',
            'medium' => 'medium',
            'critical' => 'critical',
            default => 'low',
        };
    }

    /**
     * @return array<int, string>
     */
    private function pwdTypes(): array
    {
        return [
            'visual-impairment',
            'hearing-impairment',
            'speech-impairment',
            'physical-disability',
            'intellectual-disability',
            'psychosocial-disability',
            'multiple-disabilities',
            'other',
        ];
    }

    private function fullAddress(Household $household): string
    {
        return collect([
            $household->street_address,
            $household->barangay,
            $household->city,
        ])->filter(fn (?string $value): bool => filled($value))->join(', ');
    }

    /**
     * @return array{latitude: float, longitude: float, x: int, y: int}
     */
    private function coordinatesForBarangay(
        ?string $barangay,
        int $index = 0,
    ): array {
        $layouts = [
            'Central' => [
                'latitude' => 6.9548,
                'longitude' => 126.2282,
                'x' => 26,
                'y' => 68,
            ],
            'Dahican' => [
                'latitude' => 6.9154,
                'longitude' => 126.2924,
                'x' => 76,
                'y' => 54,
            ],
            'Macambol' => [
                'latitude' => 6.9908,
                'longitude' => 126.2501,
                'x' => 57,
                'y' => 28,
            ],
            'Badas' => [
                'latitude' => 6.9503,
                'longitude' => 126.2475,
                'x' => 38,
                'y' => 40,
            ],
        ];

        if (is_string($barangay) && array_key_exists($barangay, $layouts)) {
            return $layouts[$barangay];
        }

        return [
            'latitude' => 6.9535 + ($index * 0.0075),
            'longitude' => 126.235 + ($index * 0.008),
            'x' => 28 + ($index * 16),
            'y' => 26 + ($index * 15),
        ];
    }
}
