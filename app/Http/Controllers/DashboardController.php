<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManageHouseholdMemberRequest;
use App\Http\Requests\ManageHouseholdRequest;
use App\Http\Requests\ManageEvacuationCenterRequest;
use App\Models\AlertBroadcast;
use App\Models\EvacuationScan;
use App\Models\EvacuationCenter;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\HouseholdQrRoster;
use App\Support\MatiCityAddressOptions;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const LOCAL_TIMEZONE = 'Asia/Manila';

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        return $this->renderConsolePage($request, 'dashboard');
    }

    public function evacuationMonitoring(Request $request): Response
    {
        return $this->renderConsolePage($request, 'evacuation-monitoring');
    }

    public function mapMonitoring(Request $request): Response
    {
        return $this->renderConsolePage($request, 'map-monitoring');
    }

    public function operatorDashboard(Request $request): Response
    {
        return $this->renderOperatorPage($request, 'operator-dashboard');
    }

    public function operatorQrScanner(Request $request): Response
    {
        return $this->renderOperatorPage($request, 'operator-qr-scanner');
    }

    public function operatorScanHistory(Request $request): Response
    {
        return $this->renderOperatorPage($request, 'operator-scan-history');
    }

    public function operatorOfflineSync(Request $request): Response
    {
        return $this->renderOperatorPage($request, 'operator-offline-sync');
    }

    public function householdManagement(Request $request): Response
    {
        return $this->renderConsolePage($request, 'household-management');
    }

    public function updateHousehold(ManageHouseholdRequest $request, Household $household): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($household, $validated): void {
            $household->forceFill([
                'barangay' => $validated['barangay'],
                'city' => $validated['city'],
                'contact_number' => $validated['contact_number'],
                'hazard_zone' => $validated['hazard_zone'],
                'name' => $validated['household_name'],
                'sex' => $validated['gender'],
                'status' => $validated['status'],
                'street_address' => $validated['street_address'],
            ])->save();

            if ($household->headUser instanceof User) {
                $household->headUser->forceFill([
                    'birthdate' => $validated['birthdate'],
                    'contact_number' => $validated['contact_number'],
                    'gender' => $validated['gender'],
                    'is_pregnant' => $validated['gender'] === 'female'
                        && (bool) ($validated['is_pregnant'] ?? false),
                    'name' => $validated['head_name'],
                ])->save();
            }
        });

        return back()->with('success', 'Household record updated successfully.');
    }

    public function destroyHousehold(Request $request, Household $household): RedirectResponse
    {
        abort_unless($this->canManageHousehold($request, $household), 403);

        DB::transaction(function () use ($household): void {
            $household->members()->delete();
            $household->evacuationScans()->delete();
            $household->delete();
        });

        return back()->with('success', 'Household deleted successfully.');
    }

    public function storeManagedHouseholdMember(
        ManageHouseholdMemberRequest $request,
        Household $household,
    ): RedirectResponse {
        $sortOrder = $household->members()->max('sort_order');

        $household->members()->create([
            ...$this->householdMemberMutationPayload($request->validated()),
            'sort_order' => $sortOrder === null ? 0 : ((int) $sortOrder + 1),
        ]);

        return back()->with('success', 'Household member added successfully.');
    }

    public function updateManagedHouseholdMember(
        ManageHouseholdMemberRequest $request,
        HouseholdMember $member,
    ): RedirectResponse {
        $member->update($this->householdMemberMutationPayload($request->validated()));

        return back()->with('success', 'Household member updated successfully.');
    }

    public function destroyManagedHouseholdMember(Request $request, HouseholdMember $member): RedirectResponse
    {
        $member->loadMissing('household');

        abort_if($member->household === null, 404);
        abort_unless($this->canManageHousehold($request, $member->household), 403);

        $household = $member->household;

        $member->delete();
        $this->resequenceHouseholdMembers($household);

        return back()->with('success', 'Household member removed successfully.');
    }

    public function barangayManagement(Request $request): Response
    {
        return $this->renderConsolePage($request, 'barangay-management');
    }

    public function userManagement(Request $request): Response
    {
        $panelBarangay = $this->panelBarangay($request);

        $users = $this->consoleUsersQuery($panelBarangay)
            ->select(['id', 'name', 'email', 'contact_number', 'role', 'barangay', 'status', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ConsoleRole::label($user->role),
                'barangay' => $user->barangay,
                'contact_number' => $user->contact_number ?? 'N/A',
                'status' => $user->status ?? 'Active',
                'last_active' => null,
            ]);

        $roles = $panelBarangay === null
            ? [ConsoleRole::CDRRMO_ADMIN, ConsoleRole::BARANGAY_COMMITTEE, ConsoleRole::OPERATOR]
            : [ConsoleRole::BARANGAY_COMMITTEE, ConsoleRole::OPERATOR];
        $barangays = $panelBarangay === null
            ? MatiCityAddressOptions::barangays()
            : [$panelBarangay];

        $summary = [
            'total' => $users->count(),
            'admins' => $users->where('role', ConsoleRole::CDRRMO_ADMIN)->count(),
            'barangayCommittee' => $users->where('role', ConsoleRole::BARANGAY_COMMITTEE)->count(),
            'operators' => $users->where('role', ConsoleRole::OPERATOR)->count(),
        ];

        return Inertia::render('user-management', [
            'dashboard' => fn (): array => $this->dashboardData($request),
            'users' => $users,
            'roles' => $roles,
            'barangays' => $barangays,
            'summary' => $summary,
        ]);
    }

    public function evacuationCenters(Request $request): Response
    {
        return $this->renderConsolePage($request, 'evacuation-centers');
    }

    public function storeEvacuationCenter(ManageEvacuationCenterRequest $request): RedirectResponse
    {
        EvacuationCenter::query()->create($this->evacuationCenterPayload($request));

        return back()->with('success', 'Evacuation center added successfully.');
    }

    public function updateEvacuationCenter(
        ManageEvacuationCenterRequest $request,
        EvacuationCenter $evacuationCenter,
    ): RedirectResponse {
        $evacuationCenter->update($this->evacuationCenterPayload($request));

        return back()->with('success', 'Evacuation center updated successfully.');
    }

    public function destroyEvacuationCenter(Request $request, EvacuationCenter $evacuationCenter): RedirectResponse
    {
        abort_unless($this->canManageEvacuationCenter($request, $evacuationCenter), 403);

        $evacuationCenter->delete();

        return back()->with('success', 'Evacuation center deleted successfully.');
    }

    public function reportsAnalytics(Request $request): Response
    {
        return $this->renderConsolePage($request, 'reports-analytics');
    }

    public function alertsNotifications(Request $request): Response
    {
        return Inertia::render('alerts-notifications', [
            'dashboard' => fn (): array => $this->dashboardData($request),
            'alertsCenter' => fn (): array => $this->alertsCenterData($request),
        ]);
    }

    public function systemSettings(): Response
    {
        return Inertia::render('settings/system', [
            'settings' => $this->defaultSystemSettings(),
        ]);
    }

    private function renderConsolePage(Request $request, string $component): Response
    {
        $dashboardPayload = null;

        $dashboard = function () use ($request, &$dashboardPayload): array {
            if ($dashboardPayload === null) {
                $dashboardPayload = $this->dashboardData($request);
            }

            return $dashboardPayload;
        };

        $props = [
            'dashboard' => $dashboard,
        ];

        if ($component === 'household-management') {
            $props['householdManagement'] = fn (): array => $this->householdManagementData($request);
        }

        if ($component === 'reports-analytics') {
            $props['reportsAnalytics'] = fn (): array => $this->reportsAnalyticsData(
                $request,
                $dashboard(),
            );
        }

        return Inertia::render($component, $props);
    }

    private function renderOperatorPage(Request $request, string $component): Response
    {
        $operatorPayload = null;

        $operatorModule = function () use ($request, &$operatorPayload): array {
            if ($operatorPayload === null) {
                $operatorPayload = $this->operatorModuleData($request);
            }

            return $operatorPayload;
        };

        return Inertia::render($component, [
            'operatorModule' => $operatorModule,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function operatorModuleData(Request $request): array
    {
        $dashboard = $this->dashboardData($request);
        $assignedBarangay = $this->operatorBarangay($request);
        $centers = collect($dashboard['mapMonitoring']['markers'])
            ->when(
                $assignedBarangay !== null,
                fn (Collection $markers) => $markers->where('barangay', $assignedBarangay),
            )
            ->values()
            ->map(fn (array $marker): array => [
                'barangay' => $marker['barangay'],
                'id' => $marker['id'],
                'imageLabel' => $marker['imageLabel'],
                'name' => $marker['name'],
                'status' => $marker['status'],
            ]);
        $scanRoster = $this->buildOperatorScanRoster($request, $centers);
        $scannerConnected = $scanRoster->contains(
            fn (array $entry): bool => $entry['status'] === 'Evacuated',
        );

        return [
            'centers' => $centers->all(),
            'command' => [
                'assignmentLabel' => $assignedBarangay === null
                    ? 'City-wide operator access'
                    : "{$assignedBarangay} field assignment",
                'dateLabel' => $this->localNow()->format('F j, Y'),
                'operatorName' => $request->user()?->name ?? 'Operator',
                'status' => $assignedBarangay === null
                    ? 'Field scanning workflow is active across the response console.'
                    : "{$assignedBarangay} field scanning workflow is active.",
            ],
            'meta' => [
                'defaultEvacuationCenter' => $assignedBarangay === null
                    ? ($centers->first()['name'] ?? null)
                    : MatiCityAddressOptions::evacuationCenterName($assignedBarangay),
                'note' => $scannerConnected
                    ? 'Online scans now update the accountability board immediately, while offline scans stay queued on the device until sync.'
                    : 'Scan records stay on the device for field use, then sync once a stable connection is available again.',
                'offlineMode' => true,
                'qrPayloadPrefix' => 'EVAQREADY-HOUSEHOLD:',
                'scannerConnected' => $scannerConnected,
                'supportsTimeOut' => true,
            ],
            'roster' => $scanRoster->all(),
            'scanCenters' => MatiCityAddressOptions::evacuationCenters(),
            'summary' => [
                'activeCenters' => $centers->count(),
                'rosterTotal' => $scanRoster->count(),
                'trackedHouseholds' => $scanRoster->pluck('householdCode')->unique()->count(),
            ],
        ];
    }

    /**
     * @param  Collection<int, array{
     *     barangay: string,
     *     id: string,
     *     imageLabel: string,
     *     name: string,
     *     status: string
     * }>  $centers
     * @return Collection<int, array{
     *     address: string|null,
     *     barangay: string,
     *     evacuationCenter: string|null,
     *     household: string,
     *     householdCode: string,
     *     id: string,
     *     members: array<int, array{
     *         age: int|null,
     *         gender: string|null,
     *         id: string,
     *         name: string,
     *         qrReference: string,
     *         role: string
     *     }>,
     *     name: string,
     *     note: string,
     *     qrReference: string,
     *     role: string,
     *     status: string
     * }>
     */
    private function buildOperatorScanRoster(
        Request $request,
        Collection $centers,
    ): Collection {
        $assignedBarangay = $this->operatorBarangay($request);

        /** @var Collection<int, Household> $households */
        $households = Household::query()
            ->with([
                'headUser:id,name,gender,birthdate',
                'members:id,household_id,full_name,sort_order,gender,birthdate,category',
            ])
            ->when(
                $assignedBarangay !== null,
                fn (Builder $query) => $query->where('barangay', $assignedBarangay),
            )
            ->orderBy('barangay')
            ->orderBy('household_code')
            ->get([
                'id',
                'head_user_id',
                'name',
                'household_code',
                'barangay',
                'evacuation_status',
                'street_address',
            ]);

        return $households
            ->map(function (Household $household) use ($centers): array {
                /** @var array{
                 *     barangay: string,
                 *     id: string,
                 *     imageLabel: string,
                 *     name: string,
                 *     status: string
                 * }|null $assignedCenter
                 */
                $assignedCenter = $centers->first(
                    fn (array $center): bool => $center['barangay'] === $household->barangay,
                ) ?? $centers->first();
                $status = $this->operatorRosterStatus($household->evacuation_status);

                return [
                    'address' => $household->street_address,
                    'barangay' => $household->barangay,
                    'evacuationCenter' => $assignedCenter['name'] ?? null,
                    'household' => $household->name,
                    'householdCode' => $household->household_code,
                    'id' => "household-{$household->id}",
                    'members' => HouseholdQrRoster::members($household),
                    'name' => $household->headUser?->name ?? $household->name,
                    'note' => $this->operatorRosterNote($status),
                    'qrReference' => $household->household_code,
                    'role' => 'Household QR',
                    'status' => $status,
                ];
            })
            ->values();
    }

    private function operatorRosterStatus(?string $status): string
    {
        return match (strtolower((string) ($status ?? 'registered'))) {
            'evacuated' => 'Evacuated',
            'missing' => 'Missing',
            'not yet evacuated' => 'Not Yet Evacuated',
            default => 'Registered',
        };
    }

    private function operatorRosterNote(string $status): string
    {
        return match ($status) {
            'Evacuated' => 'Safe arrival was already confirmed for this household.',
            'Missing' => 'This household is still tagged for urgent accountability follow-up.',
            'Not Yet Evacuated' => 'Registered household QR is ready for Time-In once the family arrives.',
            default => 'Registered household QR is ready for operator scanning.',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultSystemSettings(): array
    {
        return [
            'alerts' => [
                'alertVolume' => 75,
                'enableAudioAlerts' => true,
                'enableEmergencyBroadcast' => true,
                'enableVisualAlerts' => true,
            ],
            'backup' => [
                'lastBackupDate' => 'January 15, 2026',
            ],
            'general' => [
                'defaultLanguage' => 'English',
                'defaultLocation' => 'Mati City',
                'systemName' => 'EvaQReady',
                'timeFormat' => '12-hour',
            ],
            'map' => [
                'defaultMapView' => 'standard',
                'enableHazardOverlay' => true,
                'enableMapMonitoring' => true,
                'showNearestEvacuationCenter' => true,
            ],
            'offline' => [
                'autoSyncWhenOnline' => true,
                'enableManualSyncButton' => true,
                'enableOfflineMode' => true,
                'showSyncStatusIndicator' => true,
            ],
            'qr' => [
                'autoTimeInOnScan' => true,
                'duplicateScanProtection' => true,
                'enableQrCodeGeneration' => true,
                'enableTimeOutScan' => true,
            ],
            'reports' => [
                'enablePdfExport' => true,
                'enablePrintReports' => true,
                'includeBarangayBreakdown' => true,
                'includeChartsInReports' => true,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function dashboardData(Request $request): array
    {
        $this->publishDueAlertBroadcasts();

        $panelBarangay = $this->panelBarangay($request);
        $accessibleBarangays = $this->accessibleBarangays($request);
        $isCdrrmoAdmin = $this->isCdrrmoAdmin($request);

        $households = $this->dashboardHouseholds($panelBarangay);

        /** @var Collection<int, User> $headResidents */
        $headResidents = $households
            ->pluck('headUser')
            ->filter(fn (?User $user): bool => $user instanceof User)
            ->values();
        /** @var Collection<int, HouseholdMember> $memberResidents */
        $memberResidents = $households
            ->flatMap(fn (Household $household): Collection => $household->members)
            ->values();

        $householdsCount = $households->count();
        $registeredResidents = $households->sum(
            fn (Household $household): int => $this->memberCountForHousehold($household) + 1,
        );
        $consoleUsers = $this->consoleUsersQuery($panelBarangay)->get(['role']);
        $cdrrmoAdminUsers = $panelBarangay === null
            ? $consoleUsers->filter(fn (User $user): bool => ConsoleRole::isCdrrmoAdmin($user->role))->count()
            : 0;
        $barangayCommitteeUsers = $consoleUsers
            ->filter(fn (User $user): bool => ConsoleRole::isBarangayCommittee($user->role))
            ->count();
        $operatorUsers = $consoleUsers
            ->filter(fn (User $user): bool => ConsoleRole::isOperator($user->role))
            ->count();
        $barangaysCovered = $households->pluck('barangay')->filter()->unique()->count();
        $totalBarangays = count($accessibleBarangays);
        $registrationsToday = $households
            ->filter(fn (Household $household): bool => $this->isLocalToday($household->created_at))
            ->count();

        $maleResidents = $headResidents
            ->filter(fn (User $user): bool => $this->normalizedGender($user->gender) === 'male')
            ->count() + $memberResidents
            ->filter(fn (HouseholdMember $member): bool => $this->normalizedGender($member->gender) === 'male')
            ->count();
        $femaleResidents = $headResidents
            ->filter(fn (User $user): bool => $this->normalizedGender($user->gender) === 'female')
            ->count() + $memberResidents
            ->filter(fn (HouseholdMember $member): bool => $this->normalizedGender($member->gender) === 'female')
            ->count();

        $childrenResidents = $headResidents
            ->filter(fn (User $user): bool => $this->ageGroupForBirthdate($user->birthdate) === 'Child')
            ->count() + $memberResidents
            ->filter(
                fn (HouseholdMember $member): bool => $this->residentPopulationCategory(
                    $member->birthdate,
                    $member->category,
                ) === 'Child',
            )
            ->count();
        $adultResidents = $headResidents
            ->filter(fn (User $user): bool => $this->ageGroupForBirthdate($user->birthdate) === 'Adult')
            ->count() + $memberResidents
            ->filter(
                fn (HouseholdMember $member): bool => $this->residentPopulationCategory(
                    $member->birthdate,
                    $member->category,
                ) === 'Adult',
            )
            ->count();
        $seniorResidents = $headResidents
            ->filter(fn (User $user): bool => $this->ageGroupForBirthdate($user->birthdate) === 'Senior')
            ->count() + $memberResidents
            ->filter(
                fn (HouseholdMember $member): bool => $this->residentPopulationCategory(
                    $member->birthdate,
                    $member->category,
                ) === 'Senior',
            )
            ->count();

        $pwdResidents = $households
            ->filter(fn (Household $household): bool => (bool) $household->is_pwd)
            ->count() + $memberResidents
            ->filter(fn (HouseholdMember $member): bool => (bool) $member->is_pwd)
            ->count();
        $pregnantResidents = $memberResidents
            ->filter(fn (HouseholdMember $member): bool => (bool) $member->is_pregnant)
            ->count()
            + $headResidents->filter(fn (User $user): bool => (bool) $user->is_pregnant)->count();
        $supportFlags = $pwdResidents + $pregnantResidents;

        $barangayMonitoring = collect($this->buildBarangayMonitoring($households, $accessibleBarangays));
        $evacuationCenters = $this->buildEvacuationCenters($barangayMonitoring, $panelBarangay, $households, $request);
        $centerSummary = $evacuationCenters['summary'];
        $atRiskResidents = (int) $barangayMonitoring->sum('atRiskResidents');
        $recentHouseholds = $this->buildRecentHouseholds($households);
        $hazardBreakdown = $this->buildHazardBreakdown($households);
        $evacuationMonitoring = $this->buildEvacuationMonitoring(
            $households,
            $barangayMonitoring,
            $evacuationCenters['centers'],
        );
        $checkedInEvacuees = (int) ($evacuationMonitoring['summary']['evacuated'] ?? 0);
        $missingEvacuees = (int) ($evacuationMonitoring['summary']['missing'] ?? 0);
        $notYetEvacuated = (int) ($evacuationMonitoring['summary']['notYetEvacuated'] ?? 0);
        $scannerConnected = (bool) ($evacuationMonitoring['meta']['scannerConnected'] ?? false);
        $mapMonitoring = $this->buildMapMonitoringData(
            $households,
            $evacuationCenters['centers'],
            $hazardBreakdown,
        );
        $alerts = $this->buildAlerts(
            $request,
            $barangayMonitoring,
            collect($evacuationCenters['centers']),
            $supportFlags,
            $checkedInEvacuees,
        );
        $latestAlert = $this->latestAlert($alerts);

        return [
            'command' => [
                'adminName' => $request->user()->name,
                'dateLabel' => $this->localNow()->format('F j, Y'),
                'status' => $panelBarangay === null
                    ? 'CDRRMO command monitoring is active.'
                    : "{$panelBarangay} barangay monitoring is active.",
                'registrationsToday' => $registrationsToday,
                'subtitle' => $panelBarangay === null
                    ? ($scannerConnected
                        ? 'Resident analytics and QR safe-arrival monitoring are now active across the response console.'
                        : 'Resident analytics are live. QR check-ins, center occupancy, and alert feeds are scaffolded for the next module.')
                    : 'Your panel is scoped to the assigned barangay so committee updates stay local and easier to coordinate.',
            ],
            'overview' => [
                'registeredResidents' => $registeredResidents,
                'checkedInEvacuees' => $checkedInEvacuees,
                'checkedInIsPrototype' => ! $scannerConnected,
                'checkedInDetail' => $scannerConnected
                    ? 'Live operator QR scans now update safe-arrival totals and accountability status.'
                    : 'Live QR scanner check-ins will populate here once operator workflows are connected.',
                'centers' => [
                    'total' => $centerSummary['total'],
                    'active' => $centerSummary['active'],
                    'inactive' => $centerSummary['inactive'],
                    'isPrototype' => true,
                    'detail' => 'Prototype center roster prepared for the future evacuation-center registry.',
                ],
                'capacity' => [
                    'available' => $centerSummary['available'],
                    'occupied' => $centerSummary['occupied'],
                    'total' => $centerSummary['capacity'],
                    'isPrototype' => true,
                    'detail' => 'Planning capacity is derived from registered at-risk residents until live center occupancy is available.',
                ],
                'coverage' => [
                    'coveredBarangays' => $barangaysCovered,
                    'percent' => $totalBarangays === 0
                        ? 0
                        : (int) round(($barangaysCovered / $totalBarangays) * 100),
                    'totalBarangays' => $totalBarangays,
                ],
            ],
            'summary' => [
                'evacuatedSafe' => [
                    'detail' => $checkedInEvacuees === 0
                        ? 'No verified safe arrivals have been recorded yet.'
                        : 'Residents confirmed safe through the active scanner feed.',
                    'total' => $checkedInEvacuees,
                ],
                'notYetEvacuated' => [
                    'detail' => 'Registered residents are still awaiting safe-arrival confirmation.',
                    'total' => $notYetEvacuated,
                ],
                'missingUnaccounted' => [
                    'detail' => $missingEvacuees === 0
                        ? 'No unresolved accountability cases are flagged in the current command feed.'
                        : 'Residents still missing a safe-arrival scan are flagged here for follow-up.',
                    'total' => $missingEvacuees,
                ],
                'activeCenters' => [
                    'detail' => 'Open sites are ready to receive evacuees right now.',
                    'total' => $centerSummary['active'],
                ],
            ],
            'analytics' => [
                'gender' => [
                    [
                        'key' => 'male',
                        'label' => 'Male',
                        'total' => $maleResidents,
                    ],
                    [
                        'key' => 'female',
                        'label' => 'Female',
                        'total' => $femaleResidents,
                    ],
                ],
                'ageGroups' => [
                    [
                        'key' => 'children',
                        'label' => 'Children',
                        'total' => $childrenResidents,
                        'detail' => 'Minors who may need family-focused shelter support and welfare tracking.',
                    ],
                    [
                        'key' => 'adults',
                        'label' => 'Adults',
                        'total' => $adultResidents,
                        'detail' => 'Registered adult residents available for standard shelter allocation and services.',
                    ],
                    [
                        'key' => 'seniors',
                        'label' => 'Seniors',
                        'total' => $seniorResidents,
                        'detail' => 'Older residents who may need priority movement, triage, and medical checks.',
                    ],
                ],
                'vulnerableGroups' => [
                    [
                        'key' => 'pwd',
                        'label' => 'PWD Count',
                        'total' => $pwdResidents,
                        'detail' => 'Residents who may require assisted movement, medication support, or accessibility accommodations.',
                    ],
                    [
                        'key' => 'pregnant',
                        'label' => 'Pregnant Women',
                        'total' => $pregnantResidents,
                        'detail' => 'Residents needing faster maternal care coordination, rest spaces, and clinic-ready triage.',
                    ],
                    [
                        'key' => 'senior',
                        'label' => 'Senior Citizens',
                        'total' => $seniorResidents,
                        'detail' => 'Residents who may need wellness monitoring, transport support, and priority assignment.',
                    ],
                    [
                        'key' => 'children',
                        'label' => 'Children',
                        'total' => $childrenResidents,
                        'detail' => 'Young dependents requiring family grouping, safeguarding, and child-friendly essentials.',
                    ],
                ],
            ],
            'hazardBreakdown' => $hazardBreakdown,
            'mapMonitoring' => $mapMonitoring,
            'mapPanel' => [
                'densityLeaders' => $barangayMonitoring
                    ->take(3)
                    ->values()
                    ->all(),
                'note' => 'Map markers are ready for GIS coordinates, hazard polygons, and live center locations once those records exist.',
                'prototype' => true,
            ],
            'barangayMonitoring' => $barangayMonitoring->all(),
            'userSummary' => [
                'totalUsers' => $householdsCount + $cdrrmoAdminUsers + $barangayCommitteeUsers + $operatorUsers,
                'rolesConfigured' => true,
                'roles' => [
                    [
                        'key' => 'cdrrmo-admin',
                        'label' => 'CDRRMO Admins',
                        'total' => $cdrrmoAdminUsers,
                        'detail' => 'City-level command accounts with access to every response dashboard and administration control.',
                    ],
                    [
                        'key' => 'barangay-admin',
                        'label' => 'Barangay Committees',
                        'total' => $barangayCommitteeUsers,
                        'detail' => 'Local command accounts assigned to barangay-specific monitoring and coordination work.',
                    ],
                    [
                        'key' => 'operator',
                        'label' => 'Operators',
                        'total' => $operatorUsers,
                        'detail' => 'Console users prepared for scanner, verification, and check-in workflows during evacuation events.',
                    ],
                    [
                        'key' => 'resident',
                        'label' => 'Residents',
                        'total' => $householdsCount,
                        'detail' => 'Authenticated evacuee household-head accounts kept separate from operator and admin access.',
                    ],
                ],
                'manageUsersAvailable' => $isCdrrmoAdmin,
            ],
            'alerts' => $alerts,
            'latestAlert' => $latestAlert,
            'evacuationCenters' => $evacuationCenters,
            'evacuationMonitoring' => $evacuationMonitoring,
            'liveActivity' => $this->buildLiveActivity(
                $checkedInEvacuees,
                $latestAlert,
                $recentHouseholds,
                $evacuationCenters['centers'],
            ),
            'recentHouseholds' => $recentHouseholds,
        ];
    }

    /**
     * @return array{
     *     alerts: array<int, array{
     *         audioEnabled: bool,
     *         audioUrl: string|null,
     *         id: int,
     *         issuedAt: string|null,
     *         message: string,
     *         scheduledFor: string|null,
     *         senderName: string,
     *         senderRole: string,
     *         severity: string,
     *         status: string,
     *         target: string,
     *         title: string,
     *         type: string
     *     }>,
     *     canManageBroadcasts: bool,
     *     composerTargets: array<int, string>
     * }
     */
    private function alertsCenterData(Request $request): array
    {
        $visibleAlerts = $this->visibleAlertBroadcastsQuery($request)
            ->with('creator:id,name,role')
            ->orderByRaw('COALESCE(issued_at, scheduled_for, created_at) desc')
            ->get()
            ->map(fn (AlertBroadcast $alertBroadcast): array => [
                'audioEnabled' => (bool) $alertBroadcast->audio_enabled,
                'audioUrl' => $alertBroadcast->audio_url,
                'id' => $alertBroadcast->id,
                'issuedAt' => $alertBroadcast->issued_at?->toIso8601String(),
                'message' => $alertBroadcast->message,
                'scheduledFor' => $alertBroadcast->scheduled_for?->toIso8601String(),
                'senderName' => $alertBroadcast->creator?->name ?? 'System',
                'senderRole' => ConsoleRole::label($alertBroadcast->creator?->role, 'System'),
                'severity' => $alertBroadcast->severity,
                'status' => $alertBroadcast->status,
                'target' => $alertBroadcast->target_barangay ?? 'All',
                'title' => $alertBroadcast->title,
                'type' => $alertBroadcast->type,
            ])
            ->values()
            ->all();

        return [
            'alerts' => $visibleAlerts,
            'canManageBroadcasts' => $this->isCdrrmoAdmin($request),
            'composerTargets' => MatiCityAddressOptions::barangays(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function householdManagementData(Request $request): array
    {
        $panelBarangay = $this->panelBarangay($request);
        $search = trim((string) $request->query('search', ''));
        $availableBarangays = $this->accessibleBarangays($request);
        $availableStatuses = $this->householdStatuses();
        $selectedBarangay = (string) $request->query('barangay', 'all');
        $selectedStatus = (string) $request->query('status', 'all');

        if (! in_array($selectedBarangay, $availableBarangays, true)) {
            $selectedBarangay = 'all';
        }

        if (! in_array($selectedStatus, $availableStatuses, true)) {
            $selectedStatus = 'all';
        }

        $query = Household::query()
            ->select([
                'id',
                'head_user_id',
                'name',
                'household_code',
                'street_address',
                'barangay',
                'city',
                'hazard_zone',
                'status',
                'created_at',
                'updated_at',
            ])
            ->with([
                'headUser:id,name,contact_number,gender,birthdate,is_pregnant',
                'members:id,household_id,full_name,gender,birthdate,category,is_pwd,pwd_type,pwd_type_other,is_pregnant,sort_order',
            ])
            ->withCount('members')
            ->orderByDesc('created_at')
            ->orderBy('household_code')
            ->when(
                $panelBarangay !== null,
                fn (Builder $builder) => $builder->where('barangay', $panelBarangay),
            );

        if ($search !== '') {
            $this->applyHouseholdSearch($query, $search);
        }

        if ($selectedBarangay !== 'all') {
            $query->where('barangay', $selectedBarangay);
        }

        if ($selectedStatus !== 'all') {
            $query->where('status', $selectedStatus);
        }

        $households = $query
            ->paginate(8)
            ->withQueryString();

        return [
            'actions' => [
                'canManageHouseholds' => $this->canManageHouseholdRegistry($request),
            ],
            'filters' => [
                'barangay' => $selectedBarangay,
                'barangays' => $availableBarangays,
                'search' => $search,
                'status' => $selectedStatus,
                'statuses' => $availableStatuses,
            ],
            'options' => [
                'hazardZones' => $this->householdHazardZones(),
                'pwdTypes' => $this->householdPwdTypes(),
            ],
            'summary' => [
                'barangaysCovered' => Household::query()
                    ->when(
                        $panelBarangay !== null,
                        fn (Builder $builder) => $builder->where('barangay', $panelBarangay),
                    )
                    ->whereNotNull('barangay')
                    ->distinct()
                    ->count('barangay'),
                'totalHouseholds' => Household::query()
                    ->when(
                        $panelBarangay !== null,
                        fn (Builder $builder) => $builder->where('barangay', $panelBarangay),
                    )
                    ->count(),
                'totalRegisteredMembers' => Household::query()
                    ->when(
                        $panelBarangay !== null,
                        fn (Builder $builder) => $builder->where('barangay', $panelBarangay),
                    )
                    ->count() + HouseholdMember::query()
                        ->when(
                            $panelBarangay !== null,
                            fn (Builder $builder) => $builder->whereHas(
                                'household',
                                fn (Builder $householdQuery) => $householdQuery->where('barangay', $panelBarangay),
                            ),
                        )
                        ->count(),
            ],
            'table' => [
                'pagination' => [
                    'currentPage' => $households->currentPage(),
                    'from' => $households->firstItem(),
                    'hasPages' => $households->hasPages(),
                    'lastPage' => $households->lastPage(),
                    'to' => $households->lastItem(),
                    'total' => $households->total(),
                ],
                'rows' => $households
                    ->getCollection()
                    ->map(fn (Household $household): array => $this->householdManagementRow($household))
                    ->all(),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $dashboard
     * @return array<string, mixed>
     */
    private function reportsAnalyticsData(Request $request, ?array $dashboard = null): array
    {
        $dashboard ??= $this->dashboardData($request);
        $panelBarangay = $this->panelBarangay($request);
        $households = $this->dashboardHouseholds($panelBarangay);

        /** @var Collection<int, array{
         *     barangay: string,
         *     evacuationCenter: string|null,
         *     gender: string,
         *     isPregnant: bool,
         *     isPwd: bool,
         *     household: string,
         *     name: string,
         *     populationCategory: string,
         *     recordedAt: string|null,
         *     status: string,
         *     timeIn: string|null,
         *     timeOut: string|null
         * }> $reportRows
         */
        $reportRows = $this->monitoringRowsWithMembers(
            $households,
            collect($dashboard['barangayMonitoring'] ?? []),
            $dashboard['evacuationCenters']['centers'] ?? [],
            true,
        );
        /** @var array<int, string> $availableBarangays */
        $availableBarangays = $reportRows
            ->pluck('barangay')
            ->filter()
            ->unique()
            ->values()
            ->all();
        /** @var array<int, string> $availableCenters */
        $availableCenters = $reportRows
            ->pluck('evacuationCenter')
            ->filter(fn (mixed $center): bool => is_string($center) && $center !== '')
            ->unique()
            ->values()
            ->all();

        $selectedBarangay = (string) $request->query('barangay', 'all');
        $selectedCenter = (string) $request->query('center', 'all');

        if (! in_array($selectedBarangay, [...$availableBarangays, 'all'], true)) {
            $selectedBarangay = 'all';
        }

        if (! in_array($selectedCenter, [...$availableCenters, 'all'], true)) {
            $selectedCenter = 'all';
        }

        $dateFrom = $this->normalizedReportDate($request->query('date_from'));
        $dateTo = $this->normalizedReportDate($request->query('date_to'));

        if ($dateFrom !== null && $dateTo !== null && $dateFrom->greaterThan($dateTo)) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        $dateToEnd = $dateTo?->copy()->endOfDay();

        $filteredRows = $reportRows
            ->filter(function (array $row) use (
                $dateFrom,
                $dateToEnd,
                $selectedBarangay,
                $selectedCenter,
            ): bool {
                if ($selectedBarangay !== 'all' && $row['barangay'] !== $selectedBarangay) {
                    return false;
                }

                $rowCenter = $row['evacuationCenter'] ?? 'unassigned';
                if ($selectedCenter !== 'all' && $rowCenter !== $selectedCenter) {
                    return false;
                }

                if ($dateFrom === null && $dateToEnd === null) {
                    return true;
                }

                if (! is_string($row['recordedAt'])) {
                    return false;
                }

                $recordedAt = Carbon::parse($row['recordedAt']);

                if ($dateFrom !== null && $recordedAt->lt($dateFrom)) {
                    return false;
                }

                if ($dateToEnd !== null && $recordedAt->gt($dateToEnd)) {
                    return false;
                }

                return true;
            })
            ->values();

        $totalEvacuees = $filteredRows->count();
        $evacuatedCount = $filteredRows->where('status', 'Evacuated')->count();
        $notYetCount = $filteredRows->where('status', 'Not Yet Evacuated')->count();
        $missingCount = $filteredRows->where('status', 'Missing')->count();

        $statusChart = collect([
            [
                'key' => 'evacuated',
                'label' => 'Evacuated',
                'tone' => 'emerald',
                'total' => $evacuatedCount,
            ],
            [
                'key' => 'not-yet',
                'label' => 'Not Yet',
                'tone' => 'amber',
                'total' => $notYetCount,
            ],
            [
                'key' => 'missing',
                'label' => 'Missing',
                'tone' => 'rose',
                'total' => $missingCount,
            ],
        ])
            ->map(fn (array $item): array => [
                ...$item,
                'percent' => $this->reportPercentage($item['total'], $totalEvacuees),
            ])
            ->all();

        $barangayDistribution = $filteredRows
            ->groupBy('barangay')
            ->map(fn (Collection $rows, string $barangay): array => [
                'name' => $barangay,
                'total' => $rows->count(),
                'percent' => $this->reportPercentage($rows->count(), $totalEvacuees),
            ])
            ->sortByDesc('total')
            ->values()
            ->all();

        $recordedGenderTotals = $filteredRows->reduce(
            function (array $totals, array $row): array {
                $gender = strtolower((string) $row['gender']);

                if (isset($totals[$gender])) {
                    $totals[$gender]++;
                }

                return $totals;
            },
            [
                'male' => 0,
                'female' => 0,
            ],
        );
        $genderTotal = array_sum($recordedGenderTotals);
        $genderDistribution = collect([
            [
                'key' => 'male',
                'label' => 'Male',
                'tone' => 'sky',
                'total' => $recordedGenderTotals['male'],
            ],
            [
                'key' => 'female',
                'label' => 'Female',
                'tone' => 'orange',
                'total' => $recordedGenderTotals['female'],
            ],
        ])
            ->map(fn (array $item): array => [
                ...$item,
                'percent' => $this->reportPercentage($item['total'], $genderTotal),
            ])
            ->all();

        $populationTotals = $filteredRows->reduce(
            function (array $totals, array $row): array {
                $category = strtolower(
                    $this->normalizedPopulationCategory($row['populationCategory'] ?? null),
                );

                if (isset($totals[$category])) {
                    $totals[$category]++;
                }

                if (($row['isPwd'] ?? false) === true) {
                    $totals['pwd']++;
                }

                if (($row['isPregnant'] ?? false) === true) {
                    $totals['pregnant']++;
                }

                return $totals;
            },
            [
                'child' => 0,
                'adult' => 0,
                'senior' => 0,
                'pwd' => 0,
                'pregnant' => 0,
            ],
        );

        $populationBreakdown = collect([
            [
                'key' => 'child',
                'label' => 'Child',
                'tone' => 'sky',
                'total' => $populationTotals['child'],
            ],
            [
                'key' => 'adult',
                'label' => 'Adult',
                'tone' => 'emerald',
                'total' => $populationTotals['adult'],
            ],
            [
                'key' => 'senior',
                'label' => 'Senior',
                'tone' => 'amber',
                'total' => $populationTotals['senior'],
            ],
            [
                'key' => 'pwd',
                'label' => 'PWD',
                'tone' => 'violet',
                'total' => $populationTotals['pwd'],
            ],
            [
                'key' => 'pregnant',
                'label' => 'Pregnant',
                'tone' => 'rose',
                'total' => $populationTotals['pregnant'],
            ],
        ])
            ->map(fn (array $item): array => [
                ...$item,
                'percent' => $this->reportPercentage($item['total'], $totalEvacuees),
            ])
            ->all();

        return [
            'filters' => [
                'applied' => [
                    'barangay' => $selectedBarangay,
                    'center' => $selectedCenter,
                    'dateFrom' => $dateFrom?->toDateString(),
                    'dateTo' => $dateTo?->toDateString(),
                ],
                'options' => [
                    'barangays' => $availableBarangays,
                    'centers' => $availableCenters,
                ],
            ],
            'header' => [
                'barangayLabel' => $selectedBarangay === 'all'
                    ? 'All Barangays'
                    : $selectedBarangay,
                'centerLabel' => $selectedCenter === 'all'
                    ? 'All Centers'
                    : $selectedCenter,
                'dateLabel' => $this->reportDateLabel($dateFrom, $dateTo),
                'generatedAt' => $this->localNow()->format('F j, Y g:i A'),
                'note' => 'Date filters use recorded resident registry timestamps until live QR scanner check-ins are connected.',
                'title' => 'Evacuation Report - Mati City',
            ],
            'summary' => [
                'evacuated' => $evacuatedCount,
                'missing' => $missingCount,
                'notYet' => $notYetCount,
                'totalEvacuees' => $totalEvacuees,
            ],
            'charts' => [
                'barangayDistribution' => $barangayDistribution,
                'evacuationStatus' => $statusChart,
                'genderDistribution' => $genderDistribution,
            ],
            'populationBreakdown' => [
                'categories' => $populationBreakdown,
                'note' => 'Pregnant residents are counted as a subset of adult female records, while PWD counts can overlap any age group.',
            ],
            'table' => [
                'rows' => $filteredRows
                    ->map(fn (array $row): array => [
                        'barangay' => $row['barangay'],
                        'evacuationCenter' => $row['evacuationCenter'],
                        'name' => $row['name'],
                        'status' => $row['status'],
                        'timeIn' => $row['timeIn'],
                    ])
                    ->all(),
            ],
            'meta' => [
                'emptyState' => 'No resident records matched the selected report filters.',
                'fileName' => $this->reportFileName(
                    $selectedBarangay,
                    $selectedCenter,
                    $dateFrom,
                    $dateTo,
                ),
                'pdfHint' => 'PDF export uses your browser print dialog so you can save the report as PDF.',
                'recordCount' => $totalEvacuees,
            ],
        ];
    }

    /**
     * @param  Collection<int, User>  $headResidents
     * @return array{Child: int, Adult: int, Senior: int}
     */
    private function headResidentAgeCounts(Collection $headResidents): array
    {
        return $headResidents->reduce(
            function (array $totals, User $user): array {
                $totals[$this->ageGroupForBirthdate($user->birthdate)]++;

                return $totals;
            },
            [
                'Child' => 0,
                'Adult' => 0,
                'Senior' => 0,
            ],
        );
    }

    /**
     * @return array<string, int>
     */
    private function memberGenderCounts(?string $panelBarangay = null): array
    {
        return HouseholdMember::query()
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->whereHas(
                    'household',
                    fn (Builder $householdQuery) => $householdQuery->where('barangay', $panelBarangay),
                ),
            )
            ->selectRaw('LOWER(gender) as gender')
            ->selectRaw('COUNT(*) as aggregate')
            ->groupByRaw('LOWER(gender)')
            ->pluck('aggregate', 'gender')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function memberAgeCounts(?string $panelBarangay = null): array
    {
        return HouseholdMember::query()
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->whereHas(
                    'household',
                    fn (Builder $householdQuery) => $householdQuery->where('barangay', $panelBarangay),
                ),
            )
            ->selectRaw('category')
            ->selectRaw('COUNT(*) as aggregate')
            ->groupBy('category')
            ->pluck('aggregate', 'category')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();
    }

    private function memberCountForHousehold(Household $household): int
    {
        return (int) $household->getAttribute('members_count');
    }

    /**
     * @return Collection<int, Household>
     */
    private function dashboardHouseholds(?string $panelBarangay): Collection
    {
        /** @var Collection<int, Household> $households */
        $households = Household::query()
            ->with([
                'evacuationScans:id,household_id,attendee_refs,evacuation_center_name,type,scanned_at',
                'headUser:id,name,gender,birthdate,is_pregnant',
                'members:id,household_id,full_name,gender,birthdate,category,is_pwd,is_pregnant,sort_order',
            ])
            ->withCount('members')
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->where('barangay', $panelBarangay),
            )
            ->get([
                'id',
                'head_user_id',
                'name',
                'household_code',
                'barangay',
                'street_address',
                'evacuation_status',
                'evacuation_status_updated_at',
                'hazard_zone',
                'is_pwd',
                'created_at',
            ]);

        return $households;
    }

    private function applyHouseholdSearch(Builder $query, string $search): void
    {
        $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('household_code', 'like', "%{$search}%")
                ->orWhere('street_address', 'like', "%{$search}%")
                ->orWhere('barangay', 'like', "%{$search}%")
                ->orWhere('city', 'like', "%{$search}%")
                ->orWhereHas('headUser', function (Builder $headUserQuery) use ($search): void {
                    $headUserQuery->where('name', 'like', "%{$search}%");
                });
        });
    }

    /**
     * @return array{
     *     address: string,
     *     barangay: string,
     *     contactNumber: string|null,
     *     fullAddress: string,
     *     hazardZone: string|null,
     *     head: array{
     *         birthdate: string|null,
     *         contactNumber: string|null,
     *         gender: string|null,
     *         isPregnant: bool,
     *         name: string|null
     *     },
     *     headOfFamily: string,
     *     householdCode: string,
     *     id: int,
     *     lastUpdatedAt: string|null,
     *     members: array<int, array{
     *         age: int|null,
     *         birthdate: string|null,
     *         category: string|null,
     *         databaseId: int|null,
     *         gender: string|null,
     *         id: string,
     *         isPregnant: bool,
     *         isPwd: bool|null,
     *         isSenior: bool,
     *         name: string,
     *         pwdType: string|null,
     *         pwdTypeOther: string|null,
     *         relation: string,
     *         sex: string,
     *         type: string
     *     }>,
     *     name: string|null,
     *     qrReference: string,
     *     registeredAt: string|null,
     *     status: string,
     *     totalMembers: int
     * }
     */
    private function householdManagementRow(Household $household): array
    {
        $fullAddress = collect([
            $household->street_address,
            $household->barangay,
            $household->city,
        ])->filter()->implode(', ');

        return [
            'address' => $household->street_address,
            'barangay' => $household->barangay,
            'city' => $household->city,
            'contactNumber' => $household->headUser?->contact_number,
            'fullAddress' => $fullAddress,
            'hazardZone' => $household->hazard_zone,
            'head' => [
                'birthdate' => $household->headUser?->birthdate?->toDateString(),
                'contactNumber' => $household->headUser?->contact_number,
                'gender' => $this->normalizedGender($household->headUser?->gender),
                'isPregnant' => (bool) $household->headUser?->is_pregnant,
                'name' => $household->headUser?->name,
            ],
            'headOfFamily' => $household->headUser?->name ?? 'Unassigned',
            'householdCode' => $household->household_code,
            'id' => $household->id,
            'lastUpdatedAt' => $household->updated_at?->toIso8601String(),
            'members' => $this->householdManagementMembers($household),
            'name' => $household->name,
            'qrReference' => $household->household_code,
            'registeredAt' => $household->created_at?->toIso8601String(),
            'status' => $household->status ?: 'Active',
            'totalMembers' => $this->memberCountForHousehold($household) + 1,
        ];
    }

    /**
     * @return array<int, array{
     *     age: int|null,
     *     birthdate: string|null,
     *     category: string|null,
     *     databaseId: int|null,
     *     gender: string|null,
     *     id: string,
     *     isPregnant: bool,
     *     isPwd: bool|null,
     *     isSenior: bool,
     *     name: string,
     *     pwdType: string|null,
     *     pwdTypeOther: string|null,
     *     relation: string,
     *     sex: string,
     *     type: string
     * }>
     */
    private function householdManagementMembers(Household $household): array
    {
        $members = [];

        if ($household->headUser instanceof User) {
            $headResidentAge = $this->ageForBirthdate($household->headUser->birthdate);

            $members[] = [
                'age' => $headResidentAge,
                'birthdate' => $household->headUser->birthdate?->toDateString(),
                'category' => null,
                'databaseId' => null,
                'gender' => $this->normalizedGender($household->headUser->gender),
                'id' => "head-{$household->id}",
                'isPregnant' => (bool) $household->headUser->is_pregnant,
                'isPwd' => null,
                'isSenior' => $headResidentAge !== null && $headResidentAge >= 60,
                'name' => $household->headUser->name,
                'pwdType' => null,
                'pwdTypeOther' => null,
                'relation' => 'Head of Household',
                'sex' => $this->displayGender($household->headUser->gender),
                'type' => 'head',
            ];
        }

        foreach ($household->members as $member) {
            $memberAge = $this->ageForBirthdate($member->birthdate);

            $members[] = [
                'age' => $memberAge,
                'birthdate' => $member->birthdate?->toDateString(),
                'category' => $member->category,
                'databaseId' => $member->id,
                'gender' => $this->normalizedGender($member->gender),
                'id' => "member-{$member->id}",
                'isPregnant' => (bool) $member->is_pregnant,
                'isPwd' => (bool) $member->is_pwd,
                'isSenior' => $memberAge !== null ? $memberAge >= 60 : $member->category === 'Senior',
                'name' => $member->full_name,
                'pwdType' => $member->pwd_type,
                'pwdTypeOther' => $member->pwd_type_other,
                'relation' => $this->householdMemberRelationLabel($member),
                'sex' => $this->displayGender($member->gender),
                'type' => 'member',
            ];
        }

        return $members;
    }

    private function householdMemberRelationLabel(HouseholdMember $member): string
    {
        return match ($member->category) {
            'Child' => 'Child Member',
            'Senior' => 'Senior Member',
            default => 'Adult Member',
        };
    }

    /**
     * @return array<int, string>
     */
    private function householdStatuses(): array
    {
        return ['Active', 'Inactive', 'Relocated'];
    }

    /**
     * @return array<int, string>
     */
    private function householdHazardZones(): array
    {
        return ['flood-prone', 'coastal', 'landslide', 'safe-zone'];
    }

    /**
     * @return array<int, string>
     */
    private function householdPwdTypes(): array
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

    /**
     * @param  array{
     *     birthdate: string,
     *     category: string,
     *     full_name: string,
     *     gender: string,
     *     is_pregnant?: bool,
     *     is_pwd?: bool,
     *     pwd_type?: string|null,
     *     pwd_type_other?: string|null
     * }  $validated
     * @return array<string, mixed>
     */
    private function householdMemberMutationPayload(array $validated): array
    {
        $isPwd = (bool) ($validated['is_pwd'] ?? false);

        return [
            'birthdate' => $validated['birthdate'],
            'category' => $validated['category'],
            'full_name' => $validated['full_name'],
            'gender' => $validated['gender'],
            'is_pregnant' => $validated['gender'] === 'female'
                && (bool) ($validated['is_pregnant'] ?? false),
            'is_pwd' => $isPwd,
            'pwd_type' => $isPwd ? ($validated['pwd_type'] ?? null) : null,
            'pwd_type_other' => $isPwd && ($validated['pwd_type'] ?? null) === 'other'
                ? ($validated['pwd_type_other'] ?? null)
                : null,
        ];
    }

    private function resequenceHouseholdMembers(Household $household): void
    {
        $household->members()
            ->get(['id'])
            ->values()
            ->each(function (HouseholdMember $member, int $index): void {
                $member->forceFill(['sort_order' => $index])->save();
            });
    }

    private function canManageHouseholdRegistry(Request $request): bool
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return false;
        }

        return ConsoleRole::isCdrrmoAdmin($user->role)
            || (
                ConsoleRole::isBarangayCommittee($user->role)
                && is_string($user->barangay)
                && $user->barangay !== ''
            );
    }

    private function canManageHousehold(Request $request, Household $household): bool
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return false;
        }

        if (ConsoleRole::isCdrrmoAdmin($user->role)) {
            return true;
        }

        return ConsoleRole::isBarangayCommittee($user->role)
            && is_string($user->barangay)
            && $user->barangay !== ''
            && $household->barangay === $user->barangay;
    }

    private function normalizedGender(?string $gender): string
    {
        return strtolower((string) $gender);
    }

    private function displayGender(?string $gender): string
    {
        if (blank($gender)) {
            return 'Not set';
        }

        return ucfirst($this->normalizedGender($gender));
    }

    private function ageForBirthdate(mixed $birthdate): ?int
    {
        if (! $birthdate instanceof CarbonInterface) {
            return null;
        }

        return $birthdate->age;
    }

    private function normalizedReportDate(mixed $value): ?Carbon
    {
        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return null;
        }

        try {
            return Carbon::createFromFormat('Y-m-d', $value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function reportDateLabel(?Carbon $dateFrom, ?Carbon $dateTo): string
    {
        if ($dateFrom !== null && $dateTo !== null) {
            if ($dateFrom->isSameDay($dateTo)) {
                return $dateFrom->format('M j, Y');
            }

            return sprintf(
                '%s - %s',
                $dateFrom->format('M j, Y'),
                $dateTo->format('M j, Y'),
            );
        }

        if ($dateFrom !== null) {
            return 'Since '.$dateFrom->format('M j, Y');
        }

        if ($dateTo !== null) {
            return 'Up to '.$dateTo->format('M j, Y');
        }

        return 'All recorded dates';
    }

    private function reportPercentage(int $part, int $total): int
    {
        if ($part <= 0 || $total <= 0) {
            return 0;
        }

        return (int) round(($part / $total) * 100);
    }

    private function normalizedPopulationCategory(?string $category): string
    {
        return match (strtolower((string) $category)) {
            'child' => 'Child',
            'senior' => 'Senior',
            default => 'Adult',
        };
    }

    private function reportFileName(
        string $barangay,
        string $center,
        ?Carbon $dateFrom,
        ?Carbon $dateTo,
    ): string {
        $parts = collect([
            'evacuation-report',
            'mati-city',
            $barangay !== 'all' ? $barangay : null,
            $center !== 'all' ? $center : null,
            $dateFrom?->format('Ymd'),
            $dateTo?->format('Ymd'),
        ])
            ->filter()
            ->map(fn (string $value): string => str($value)->slug()->toString())
            ->values()
            ->all();

        return implode('-', $parts);
    }

    private function ageGroupForBirthdate(mixed $birthdate): string
    {
        if (! $birthdate instanceof CarbonInterface) {
            return 'Adult';
        }

        return match (true) {
            $birthdate->age >= 60 => 'Senior',
            $birthdate->age >= 18 => 'Adult',
            default => 'Child',
        };
    }

    private function residentPopulationCategory(
        mixed $birthdate,
        ?string $fallbackCategory = null,
    ): string {
        if ($birthdate instanceof CarbonInterface) {
            return $this->ageGroupForBirthdate($birthdate);
        }

        if (filled($fallbackCategory)) {
            return $this->normalizedPopulationCategory($fallbackCategory);
        }

        return 'Adult';
    }

    /**
     * @param  Collection<int, Household>  $households
     * @return array<int, array{
     *     key: string,
     *     label: string,
     *     detail: string,
     *     total: int
     * }>
     */
    private function buildHazardBreakdown(Collection $households): array
    {
        return collect($this->hazardZoneDetails())
            ->map(fn (array $details, string $zone): array => [
                'key' => $zone,
                'label' => $details['label'],
                'detail' => $details['detail'],
                'total' => $households->where('hazard_zone', $zone)->count(),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Household>  $households
     * @return array<int, array{
     *     name: string,
     *     checkedInEvacuees: int,
     *     coveragePercent: int,
     *     households: int,
     *     atRiskResidents: int,
     *     registeredResidents: int,
     *     riskLabel: string,
     *     status: string
     * }>
     */
    private function buildBarangayMonitoring(Collection $households, array $accessibleBarangays): array
    {
        return collect($accessibleBarangays)
            ->map(function (string $barangay) use ($households): array {
                /** @var Collection<int, Household> $barangayHouseholds */
                $barangayHouseholds = $households
                    ->filter(fn (Household $household): bool => $household->barangay === $barangay)
                    ->values();

                $registeredResidents = $barangayHouseholds->sum(
                    fn (Household $household): int => $this->memberCountForHousehold($household) + 1,
                );
                $atRiskResidents = $barangayHouseholds
                    ->filter(fn (Household $household): bool => $household->hazard_zone !== 'safe-zone')
                    ->sum(fn (Household $household): int => $this->memberCountForHousehold($household) + 1);
                $coveragePercent = $registeredResidents === 0
                    ? 0
                    : (int) round(($atRiskResidents / $registeredResidents) * 100);

                return [
                    'name' => $barangay,
                    'checkedInEvacuees' => 0,
                    'coveragePercent' => $coveragePercent,
                    'households' => $barangayHouseholds->count(),
                    'atRiskResidents' => $atRiskResidents,
                    'registeredResidents' => $registeredResidents,
                    'riskLabel' => $this->barangayRiskLabel($atRiskResidents),
                    'status' => $this->barangayStatus($atRiskResidents, $registeredResidents),
                ];
            })
            ->sortByDesc(
                fn (array $barangay): int => ($barangay['atRiskResidents'] * 1000)
                    + $barangay['registeredResidents'],
            )
            ->values()
            ->all();
    }

    private function barangayRiskLabel(int $atRiskResidents): string
    {
        return match (true) {
            $atRiskResidents >= 30 => 'High',
            $atRiskResidents >= 10 => 'Moderate',
            $atRiskResidents > 0 => 'Low',
            default => 'Clear',
        };
    }

    private function barangayStatus(int $atRiskResidents, int $registeredResidents): string
    {
        if ($atRiskResidents === 0 || $registeredResidents === 0) {
            return 'Safe';
        }

        $riskRatio = $atRiskResidents / $registeredResidents;

        return match (true) {
            $atRiskResidents >= 40 || $riskRatio >= 0.7 => 'Evacuating',
            default => 'At Risk',
        };
    }

    /**
     * @param  Collection<int, array{
     *     name: string,
     *     atRiskResidents: int
     * }>  $barangayMonitoring
     * @param  Collection<int, Household>  $households
     * @return array{
     *     actions: array{canManageCenters: bool},
     *     options: array{barangays: array<int, string>},
     *     prototype: bool,
     *     summary: array{active: int, available: int, capacity: int, inactive: int, occupied: int, total: int},
     *     centers: array<int, array{
     *         barangay: string,
     *         capacity: int,
     *         detail: string,
     *         id: int|null,
     *         isActive: bool,
     *         name: string,
     *         occupied: int,
     *         status: string
     *     }>
     * }
     */
    private function buildEvacuationCenters(
        Collection $barangayMonitoring,
        ?string $panelBarangay,
        Collection $households,
        Request $request,
    ): array {
        $databaseCenters = EvacuationCenter::query()
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->where('barangay', $panelBarangay),
            )
            ->orderBy('barangay')
            ->orderBy('name')
            ->get();

        if ($databaseCenters->isNotEmpty()) {
            $occupancyByCenter = $this->centerOccupancyByName($households);

            $centers = $databaseCenters
                ->map(function (EvacuationCenter $center) use ($occupancyByCenter): array {
                    $occupied = (bool) $center->is_active
                        ? min($center->capacity, (int) ($occupancyByCenter[$center->name] ?? 0))
                        : 0;

                    return [
                        'barangay' => $center->barangay,
                        'capacity' => $center->capacity,
                        'detail' => $center->detail ?: 'Live evacuation-center record managed from the response console.',
                        'id' => $center->id,
                        'isActive' => (bool) $center->is_active,
                        'name' => $center->name,
                        'occupied' => $occupied,
                        'status' => $center->is_active
                            ? $this->centerStatus($occupied, $center->capacity)
                            : 'Inactive',
                    ];
                })
                ->values();

            return [
                'actions' => [
                    'canManageCenters' => $this->canManageEvacuationCenterRegistry($request),
                ],
                'options' => [
                    'barangays' => $this->accessibleBarangays($request),
                ],
                'prototype' => false,
                'summary' => $this->evacuationCenterSummary($centers),
                'centers' => $centers->all(),
            ];
        }

        $prioritizedBarangays = $panelBarangay === null
            ? $barangayMonitoring
                ->pluck('name')
                ->merge(['Central', 'Dahican', 'Macambol', 'Badas'])
                ->unique()
                ->take(4)
                ->values()
            : collect([$panelBarangay]);

        $capacityByIndex = [220, 180, 160, 140];
        $activeByIndex = [true, true, true, false];
        $monitoringIndex = $barangayMonitoring->keyBy('name');

        $centers = $prioritizedBarangays
            ->map(function (string $barangay, int $index) use ($activeByIndex, $capacityByIndex, $monitoringIndex): array {
                $capacity = $capacityByIndex[$index] ?? 120;
                $isActive = $activeByIndex[$index] ?? true;
                $atRiskResidents = (int) (($monitoringIndex->get($barangay)['atRiskResidents'] ?? 0));
                $occupied = $isActive ? min($capacity, $atRiskResidents) : 0;

                return [
                    'barangay' => $barangay,
                    'capacity' => $capacity,
                    'detail' => $isActive
                        ? 'Prototype load is mapped from currently registered at-risk residents in this barangay.'
                        : 'Reserved in the prototype roster and marked inactive until the center module is deployed.',
                    'id' => null,
                    'isActive' => $isActive,
                    'name' => "{$barangay} Evacuation Center",
                    'occupied' => $occupied,
                    'status' => $isActive
                        ? $this->centerStatus($occupied, $capacity)
                        : 'Inactive',
                ];
            })
            ->values();

        return [
            'actions' => [
                'canManageCenters' => $this->canManageEvacuationCenterRegistry($request),
            ],
            'options' => [
                'barangays' => $this->accessibleBarangays($request),
            ],
            'prototype' => true,
            'summary' => $this->evacuationCenterSummary($centers),
            'centers' => $centers->all(),
        ];
    }

    /**
     * @param  Collection<int, array{capacity: int, isActive: bool, occupied: int}>  $centers
     * @return array{active: int, available: int, capacity: int, inactive: int, occupied: int, total: int}
     */
    private function evacuationCenterSummary(Collection $centers): array
    {
        $activeCenters = $centers->where('isActive', true);
        $totalCapacity = (int) $centers->sum('capacity');
        $occupiedCapacity = (int) $centers->sum('occupied');

        return [
            'active' => $activeCenters->count(),
            'available' => max($totalCapacity - $occupiedCapacity, 0),
            'capacity' => $totalCapacity,
            'inactive' => $centers->where('isActive', false)->count(),
            'occupied' => $occupiedCapacity,
            'total' => $centers->count(),
        ];
    }

    /**
     * @param  Collection<int, Household>  $households
     * @return array<string, int>
     */
    private function centerOccupancyByName(Collection $households): array
    {
        $currentCenterByReference = [];

        $households->each(function (Household $household) use (&$currentCenterByReference): void {
            $allAttendeeReferences = collect(HouseholdQrRoster::members($household))
                ->pluck('qrReference')
                ->filter(fn (mixed $reference): bool => is_string($reference))
                ->values()
                ->all();

            $household->evacuationScans
                ->sortBy(fn (EvacuationScan $scan): string => sprintf(
                    '%020d-%010d',
                    $scan->scanned_at?->getTimestamp() ?? 0,
                    $scan->id,
                ))
                ->each(function (EvacuationScan $scan) use (&$currentCenterByReference, $allAttendeeReferences): void {
                    $scanAttendeeReferences = $this->monitoringStoredAttendeeReferences(
                        $scan,
                        $allAttendeeReferences,
                    );

                    foreach ($scanAttendeeReferences as $reference) {
                        if ($scan->type === 'IN' && filled($scan->evacuation_center_name)) {
                            $currentCenterByReference[$reference] = $scan->evacuation_center_name;

                            continue;
                        }

                        unset($currentCenterByReference[$reference]);
                    }
                });
        });

        return collect($currentCenterByReference)
            ->countBy()
            ->map(fn (int $count): int => $count)
            ->all();
    }

    private function centerStatus(int $occupied, int $capacity): string
    {
        if ($capacity === 0) {
            return 'Available';
        }

        $occupancyRate = $occupied / $capacity;

        return match (true) {
            $occupancyRate >= 1 => 'Full',
            $occupancyRate >= 0.75 => 'Near Full',
            default => 'Available',
        };
    }

    /**
     * @return array{name: string, barangay: string, capacity: int, detail: string|null, is_active: bool}
     */
    private function evacuationCenterPayload(ManageEvacuationCenterRequest $request): array
    {
        $validated = $request->validated();

        return [
            'barangay' => $validated['barangay'],
            'capacity' => (int) $validated['capacity'],
            'detail' => filled($validated['detail'] ?? null) ? $validated['detail'] : null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'name' => $validated['name'],
        ];
    }

    private function canManageEvacuationCenterRegistry(Request $request): bool
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return false;
        }

        return ConsoleRole::isCdrrmoAdmin($user->role)
            || (
                ConsoleRole::isBarangayCommittee($user->role)
                && is_string($user->barangay)
                && $user->barangay !== ''
            );
    }

    private function canManageEvacuationCenter(Request $request, EvacuationCenter $center): bool
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return false;
        }

        if (ConsoleRole::isCdrrmoAdmin($user->role)) {
            return true;
        }

        return ConsoleRole::isBarangayCommittee($user->role)
            && is_string($user->barangay)
            && $user->barangay !== ''
            && $center->barangay === $user->barangay;
    }

    /**
     * @param  Collection<int, Household>  $households
     * @param  array<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $centers
     * @return array{
     *     filters: array{
     *         barangays: array<int, string>,
     *         centers: array<int, string>,
     *         statuses: array<int, string>
     *     },
     *     meta: array{
     *         note: string,
     *         offlineMode: bool,
     *         scannerConnected: bool
     *     },
     *     rows: array<int, array{
     *         barangay: string,
     *         evacuationCenter: string|null,
     *         gender: string,
     *         hazardZone: string,
     *         household: string,
     *         householdCode: string,
     *         id: string,
     *         isPregnant: bool,
     *         isPwd: bool,
     *         lastScan: string|null,
     *         name: string,
     *         note: string,
     *         populationCategory: string,
     *         qrReference: string,
     *         recordedAt: string|null,
     *         role: string,
     *         status: string,
     *         syncStatus: string,
     *         timeIn: string|null,
     *         timeOut: string|null
     *     }>,
     *     summary: array{
     *         evacuated: int,
     *         missing: int,
     *         notYetEvacuated: int
     *     }
     * }
     */
    private function buildEvacuationMonitoring(
        Collection $households,
        Collection $barangayMonitoring,
        array $centers,
    ): array {
        $rows = $this->monitoringRowsWithMembers($households, $barangayMonitoring, $centers, true);
        $scannerConnected = $rows->contains(
            fn (array $row): bool => filled($row['lastScan']),
        );

        return [
            'filters' => [
                'barangays' => $rows->pluck('barangay')->filter()->unique()->values()->all(),
                'centers' => $rows->pluck('evacuationCenter')->filter()->unique()->values()->all(),
                'statuses' => ['Evacuated', 'Not Yet Evacuated', 'Missing'],
            ],
            'meta' => [
                'note' => $scannerConnected
                    ? 'Live QR scans are now populating safe arrivals, time in, time out, and last-scan accountability records.'
                    : 'QR scans will populate safe arrivals, time in, time out, and last scan once the operator scanner workflow is connected.',
                'offlineMode' => true,
                'scannerConnected' => $scannerConnected,
            ],
            'rows' => $rows->all(),
            'summary' => [
                'evacuated' => $rows->where('status', 'Evacuated')->count(),
                'missing' => $rows->where('status', 'Missing')->count(),
                'notYetEvacuated' => $rows->where('status', 'Not Yet Evacuated')->count(),
            ],
        ];
    }

    /**
     * @param  Collection<int, Household>  $households
     * @param  Collection<int, array{
     *     atRiskResidents: int,
     *     checkedInEvacuees: int,
     *     coveragePercent: int,
     *     households: int,
     *     name: string,
     *     registeredResidents: int,
     *     riskLabel: string,
     *     status: string
     * }>  $barangayMonitoring
     * @param  array<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $centers
     * @return Collection<int, array{
     *     barangay: string,
     *     evacuationCenter: string|null,
     *     gender: string,
     *     hazardZone: string|null,
     *     household: string|null,
     *     householdCode: string,
     *     id: string,
     *     isPregnant: bool,
     *     isPwd: bool,
     *     lastScan: string|null,
     *     name: string,
     *     note: string,
     *     populationCategory: string,
     *     qrReference: string,
     *     recordedAt: string|null,
     *     role: string,
     *     status: string,
     *     syncStatus: string,
     *     timeIn: string|null,
     *     timeOut: string|null
     * }>
     */
    private function monitoringRowsWithMembers(
        Collection $households,
        Collection $barangayMonitoring,
        array $centers,
        bool $includeSafeZoneHouseholds = false,
    ): Collection {
        $barangaySignals = $barangayMonitoring->keyBy('name');
        $activeCenters = collect($centers)
            ->where('isActive', true)
            ->values();
        $sourceHouseholds = $includeSafeZoneHouseholds
            ? $households
            : $households
                ->filter(fn (Household $household): bool => $household->hazard_zone !== 'safe-zone')
                ->values();

        return $sourceHouseholds
            ->flatMap(function (Household $household) use (
                $activeCenters,
                $barangaySignals,
                $includeSafeZoneHouseholds,
            ): Collection {
                $barangaySignal = $barangaySignals->get($household->barangay);
                $riskLabel = $includeSafeZoneHouseholds && $household->hazard_zone === 'safe-zone'
                    ? 'Clear'
                    : (string) ($barangaySignal['riskLabel'] ?? 'Low');
                $memberScanStates = $this->monitoringMemberScanStates(
                    $household,
                    $riskLabel,
                );
                $assignedCenter = $this->monitoringCenterForBarangay(
                    $household->barangay,
                    $activeCenters,
                );
                $assignedCenterName = $assignedCenter['name'] ?? null;
                $headQrReference = "{$household->household_code}-HEAD";
                $headScanState = $memberScanStates[$headQrReference]
                    ?? $this->defaultMonitoringMemberState($riskLabel);
                $headStatus = $headScanState['status'];
                $headSyncStatus = $this->monitoringSyncStatus(
                    $headScanState['lastScan'],
                    $household->created_at,
                );
                $headCenterName = $this->monitoringDisplayedCenter(
                    $headScanState['evacuationCenter'],
                    $headScanState['lastScan'],
                    $headStatus,
                    $assignedCenterName,
                );

                $headRow = [
                    'barangay' => $household->barangay,
                    'evacuationCenter' => $headCenterName,
                    'gender' => $this->displayGender($household->headUser?->gender),
                    'hazardZone' => $household->hazard_zone,
                    'household' => $household->name,
                    'householdCode' => $household->household_code,
                    'id' => "household-{$household->id}-head",
                    'isPregnant' => (bool) ($household->headUser?->is_pregnant ?? false),
                    'isPwd' => (bool) $household->is_pwd,
                    'lastScan' => $headScanState['lastScan'],
                    'name' => $household->headUser?->name ?? 'Unassigned Head',
                    'note' => $this->monitoringStatusNote($headStatus, $riskLabel),
                    'populationCategory' => $this->ageGroupForBirthdate(
                        $household->headUser?->birthdate,
                    ),
                    'qrReference' => $headQrReference,
                    'recordedAt' => $household->created_at?->toIso8601String(),
                    'role' => 'Head of Household',
                    'status' => $headStatus,
                    'syncStatus' => $headSyncStatus,
                    'timeIn' => $headScanState['timeIn'],
                    'timeOut' => $headScanState['timeOut'],
                ];

                $memberRows = $household->members
                    ->values()
                    ->map(function (HouseholdMember $member, int $index) use (
                        $assignedCenterName,
                        $household,
                        $riskLabel,
                        $memberScanStates,
                    ): array {
                        $sequence = max((int) $member->sort_order, $index + 1);
                        $memberQrReference = sprintf(
                            '%s-M%02d',
                            $household->household_code,
                            $sequence,
                        );
                        $memberScanState = $memberScanStates[$memberQrReference]
                            ?? $this->defaultMonitoringMemberState($riskLabel);
                        $memberStatus = $memberScanState['status'];
                        $memberSyncStatus = $this->monitoringSyncStatus(
                            $memberScanState['lastScan'],
                            $household->created_at,
                        );
                        $memberCenterName = $this->monitoringDisplayedCenter(
                            $memberScanState['evacuationCenter'],
                            $memberScanState['lastScan'],
                            $memberStatus,
                            $assignedCenterName,
                        );

                        return [
                            'barangay' => $household->barangay,
                            'evacuationCenter' => $memberCenterName,
                            'gender' => $this->displayGender($member->gender),
                            'hazardZone' => $household->hazard_zone,
                            'household' => $household->name,
                            'householdCode' => $household->household_code,
                            'id' => "member-{$member->id}",
                            'isPregnant' => (bool) $member->is_pregnant,
                            'isPwd' => (bool) $member->is_pwd,
                            'lastScan' => $memberScanState['lastScan'],
                            'name' => $member->full_name,
                            'note' => $this->monitoringStatusNote($memberStatus, $riskLabel),
                            'populationCategory' => $this->residentPopulationCategory(
                                $member->birthdate,
                                $member->category,
                            ),
                            'qrReference' => $memberQrReference,
                            'recordedAt' => $household->created_at?->toIso8601String(),
                            'role' => 'Household Member',
                            'status' => $memberStatus,
                            'syncStatus' => $memberSyncStatus,
                            'timeIn' => $memberScanState['timeIn'],
                            'timeOut' => $memberScanState['timeOut'],
                        ];
                    });

                return collect([$headRow])->concat($memberRows);
            })
            ->sortBy(fn (array $row): string => sprintf(
                '%d-%s-%s',
                $this->monitoringStatusSortOrder($row['status']),
                $row['barangay'],
                $row['name'],
            ))
            ->values();
    }

    /**
     * @param  Collection<int, Household>  $households
     * @param  Collection<int, array{
     *     atRiskResidents: int,
     *     checkedInEvacuees: int,
     *     coveragePercent: int,
     *     households: int,
     *     name: string,
     *     registeredResidents: int,
     *     riskLabel: string,
     *     status: string
     * }>  $barangayMonitoring
     * @param  array<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $centers
     * @return Collection<int, array{
     *     barangay: string,
     *     evacuationCenter: string|null,
     *     gender: string,
     *     hazardZone: string|null,
     *     household: string|null,
     *     householdCode: string,
     *     id: string,
     *     isPregnant: bool,
     *     isPwd: bool,
     *     lastScan: string|null,
     *     name: string,
     *     note: string,
     *     populationCategory: string,
     *     qrReference: string,
     *     recordedAt: string|null,
     *     role: string,
     *     status: string,
     *     syncStatus: string,
     *     timeIn: string|null,
     *     timeOut: string|null
     * }>
     */
    private function monitoringRows(
        Collection $households,
        Collection $barangayMonitoring,
        array $centers,
        bool $includeSafeZoneHouseholds = false,
    ): Collection {
        $barangaySignals = $barangayMonitoring->keyBy('name');
        $activeCenters = collect($centers)
            ->where('isActive', true)
            ->values();
        $sourceHouseholds = $includeSafeZoneHouseholds
            ? $households
            : $households
                ->filter(fn (Household $household): bool => $household->hazard_zone !== 'safe-zone')
                ->values();

        return $sourceHouseholds
            ->map(function (Household $household) use (
                $activeCenters,
                $barangaySignals,
                $includeSafeZoneHouseholds,
            ): array {
                $barangaySignal = $barangaySignals->get($household->barangay);
                $riskLabel = $includeSafeZoneHouseholds && $household->hazard_zone === 'safe-zone'
                    ? 'Clear'
                    : (string) ($barangaySignal['riskLabel'] ?? 'Low');
                $memberScanStates = $this->monitoringMemberScanStates(
                    $household,
                    $riskLabel,
                );
                $assignedCenter = $this->monitoringCenterForBarangay(
                    $household->barangay,
                    $activeCenters,
                );
                $assignedCenterName = $assignedCenter['name'] ?? null;
                $headQrReference = "{$household->household_code}-HEAD";
                $headScanState = $memberScanStates[$headQrReference]
                    ?? $this->defaultMonitoringMemberState($riskLabel);
                $headStatus = $headScanState['status'];
                $headSyncStatus = $this->monitoringSyncStatus(
                    $headScanState['lastScan'],
                    $household->created_at,
                );
                $headCenterName = $this->monitoringDisplayedCenter(
                    $headScanState['evacuationCenter'],
                    $headScanState['lastScan'],
                    $headStatus,
                    $assignedCenterName,
                );

                return [
                    'barangay' => $household->barangay,
                    'evacuationCenter' => $headCenterName,
                    'gender' => $this->displayGender($household->headUser?->gender),
                    'hazardZone' => $household->hazard_zone,
                    'household' => $household->name,
                    'householdCode' => $household->household_code,
                    'id' => "household-{$household->id}-head",
                    'isPregnant' => (bool) ($household->headUser?->is_pregnant ?? false),
                    'isPwd' => (bool) $household->is_pwd,
                    'lastScan' => $headScanState['lastScan'],
                    'name' => $household->headUser?->name ?? 'Unassigned Head',
                    'note' => $this->monitoringStatusNote($headStatus, $riskLabel),
                    'populationCategory' => $this->ageGroupForBirthdate(
                        $household->headUser?->birthdate,
                    ),
                    'qrReference' => $headQrReference,
                    'recordedAt' => $household->created_at?->toIso8601String(),
                    'role' => 'Head of Household',
                    'status' => $headStatus,
                    'syncStatus' => $headSyncStatus,
                    'timeIn' => $headScanState['timeIn'],
                    'timeOut' => $headScanState['timeOut'],
                ];
            })
            ->sortBy(fn (array $row): string => sprintf(
                '%d-%s-%s',
                $this->monitoringStatusSortOrder($row['status']),
                $row['barangay'],
                $row['name'],
            ))
            ->values();
    }

    /**
     * @param  Collection<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $activeCenters
     * @return array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }|null
     */
    private function monitoringCenterForBarangay(
        string $barangay,
        Collection $activeCenters,
    ): ?array {
        /** @var array{
         *     barangay: string,
         *     capacity: int,
         *     detail: string,
         *     isActive: bool,
         *     name: string,
         *     occupied: int,
         *     status: string
         * }|null $matchedCenter
         */
        $matchedCenter = $activeCenters->first(
            fn (array $center): bool => $center['barangay'] === $barangay,
        );

        if ($matchedCenter !== null) {
            return $matchedCenter;
        }

        /** @var array{
         *     barangay: string,
         *     capacity: int,
         *     detail: string,
         *     isActive: bool,
         *     name: string,
         *     occupied: int,
         *     status: string
         * }|null $fallbackCenter
         */
        $fallbackCenter = $activeCenters->first();

        return $fallbackCenter;
    }

    private function monitoringStatus(string $riskLabel): string
    {
        return $riskLabel === 'High'
            ? 'Missing'
            : 'Not Yet Evacuated';
    }

    private function monitoringStatusSortOrder(string $status): int
    {
        return match ($status) {
            'Missing' => 0,
            'Not Yet Evacuated' => 1,
            default => 2,
        };
    }

    private function monitoringSyncStatus(?string $lastScan, mixed $timestamp): string
    {
        if (filled($lastScan)) {
            return 'Synced';
        }

        if ($this->isLocalToday($timestamp)) {
            return 'Pending Sync';
        }

        return 'Synced';
    }

    /**
     * @return array{
     *     evacuationCenter: string|null,
     *     lastScan: string|null,
     *     status: string,
     *     timeIn: string|null,
     *     timeOut: string|null
     * }
     */
    private function defaultMonitoringMemberState(string $riskLabel): array
    {
        return [
            'evacuationCenter' => null,
            'lastScan' => null,
            'status' => $this->monitoringStatus($riskLabel),
            'timeIn' => null,
            'timeOut' => null,
        ];
    }

    /**
     * @return array<string, array{
     *     evacuationCenter: string|null,
     *     lastScan: string|null,
     *     status: string,
     *     timeIn: string|null,
     *     timeOut: string|null
     * }>
     */
    private function monitoringMemberScanStates(
        Household $household,
        string $riskLabel,
    ): array {
        $memberStateMap = collect(HouseholdQrRoster::members($household))
            ->mapWithKeys(fn (array $member): array => [
                $member['qrReference'] => $this->defaultMonitoringMemberState($riskLabel),
            ]);
        $allAttendeeReferences = $memberStateMap->keys()->values()->all();

        $household->evacuationScans
            ->sortBy(fn (EvacuationScan $scan): string => sprintf(
                '%020d-%010d',
                $scan->scanned_at?->getTimestamp() ?? 0,
                $scan->id,
            ))
            ->each(function (EvacuationScan $scan) use (
                $allAttendeeReferences,
                $memberStateMap,
                $riskLabel,
            ): void {
                $scanMoment = $scan->scanned_at?->toIso8601String();
                $scanAttendeeReferences = $this->monitoringStoredAttendeeReferences(
                    $scan,
                    $allAttendeeReferences,
                );

                foreach ($scanAttendeeReferences as $reference) {
                    /** @var array{
                     *     evacuationCenter: string|null,
                     *     lastScan: string|null,
                     *     status: string,
                     *     timeIn: string|null,
                     *     timeOut: string|null
                     * } $memberState
                     */
                    $memberState = $memberStateMap->get(
                        $reference,
                        $this->defaultMonitoringMemberState($riskLabel),
                    );
                    $memberState['lastScan'] = $scanMoment;

                    if ($scan->type === 'IN') {
                        $memberState['evacuationCenter'] = $scan->evacuation_center_name;
                        $memberState['status'] = 'Evacuated';
                        $memberState['timeIn'] = $scanMoment;
                    } else {
                        $memberState['evacuationCenter'] = null;
                        $memberState['status'] = $this->monitoringStatus($riskLabel);
                        $memberState['timeOut'] = $scanMoment;
                    }

                    $memberStateMap->put($reference, $memberState);
                }
            });

        if ($household->evacuationScans->isNotEmpty()) {
            $memberStateMap = $memberStateMap->map(function (array $memberState): array {
                if ($memberState['lastScan'] === null) {
                    $memberState['evacuationCenter'] = null;
                    $memberState['status'] = 'Missing';
                }

                return $memberState;
            });
        }

        return $memberStateMap->all();
    }

    private function monitoringDisplayedCenter(
        ?string $memberCenterName,
        ?string $lastScan,
        string $status,
        ?string $assignedCenterName,
    ): ?string {
        if ($status === 'Evacuated') {
            return $memberCenterName ?? $assignedCenterName;
        }

        if (filled($lastScan) || $status === 'Missing') {
            return null;
        }

        return $assignedCenterName;
    }

    /**
     * @param  array<int, string>  $allAttendeeReferences
     * @return array<int, string>
     */
    private function monitoringStoredAttendeeReferences(
        EvacuationScan $scan,
        array $allAttendeeReferences,
    ): array {
        if ($scan->attendee_refs === null) {
            return $allAttendeeReferences;
        }

        $storedAttendeeReferences = collect($scan->attendee_refs)
            ->filter(fn (mixed $reference): bool => is_string($reference))
            ->map(fn (string $reference): string => trim($reference))
            ->filter(fn (string $reference): bool => $reference !== '')
            ->values()
            ->all();

        return array_values(array_intersect(
            $storedAttendeeReferences,
            $allAttendeeReferences,
        ));
    }

    private function monitoringStatusNote(string $status, string $riskLabel): string
    {
        return match ($status) {
            'Missing' => "High-risk monitoring flag: {$riskLabel} priority and no safe scan recorded yet.",
            'Evacuated' => 'Safe arrival was confirmed by the active QR scanner workflow.',
            default => 'Waiting for QR scan or manual safe confirmation from the operator side.',
        };
    }

    /**
     * @param  Collection<int, Household>  $households
     * @param  Collection<int, array{
     *     atRiskResidents: int,
     *     checkedInEvacuees: int,
     *     coveragePercent: int,
     *     households: int,
     *     name: string,
     *     registeredResidents: int,
     *     riskLabel: string,
     *     status: string
     * }>  $barangayMonitoring
     * @param  array<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $centers
     * @param  array<int, array{
     *     detail: string,
     *     key: string,
     *     label: string,
     *     total: int
     * }>  $hazardBreakdown
     * @return array{
     *     filters: array{
     *         barangays: array<int, string>,
     *         statuses: array<int, string>
     *     },
     *     hazardAreas: array<int, array{
     *         barangays: array<int, string>,
     *         description: string,
     *         height: int,
     *         id: string,
     *         key: string,
     *         label: string,
     *         tone: string,
     *         total: int,
     *         width: int,
     *         x: int,
     *         y: int
     *     }>,
     *     legend: array<int, array{
     *         label: string,
     *         status: string
     *     }>,
     *     markers: array<int, array{
     *         availableSlots: int,
     *         barangay: string,
     *         capacity: int,
     *         currentEvacuees: int,
     *         id: string,
     *         imageLabel: string,
     *         latitude: float,
     *         longitude: float,
     *         name: string,
     *         note: string,
     *         status: string,
     *         x: int,
     *         y: int
     *     }>,
     *     meta: array{
     *         note: string,
     *         supportsDirections: bool,
     *         supportsGeolocation: bool
     *     },
     *     summary: array{
     *         full: int,
     *         nearFull: int,
     *         open: int,
     *         total: int
     *     }
     * }
     */
    private function buildMapMonitoringData(
        Collection $households,
        array $centers,
        array $hazardBreakdown,
    ): array {
        $centerLayouts = $this->mapCenterLayouts();

        $markers = collect($centers)
            ->filter(
                fn (array $center): bool => $center['isActive']
                    && in_array($center['status'], ['Available', 'Near Full', 'Full'], true),
            )
            ->values()
            ->map(function (array $center, int $index) use ($centerLayouts): array {
                $layout = $centerLayouts[$center['barangay']] ?? [
                    'latitude' => 6.9535 + ($index * 0.0075),
                    'longitude' => 126.235 + ($index * 0.008),
                    'x' => 28 + ($index * 16),
                    'y' => 26 + ($index * 15),
                ];

                return [
                    'availableSlots' => max($center['capacity'] - $center['occupied'], 0),
                    'barangay' => $center['barangay'],
                    'capacity' => $center['capacity'],
                    'currentEvacuees' => $center['occupied'],
                    'id' => str($center['name'])->slug()->toString(),
                    'imageLabel' => str($center['barangay'])->substr(0, 2)->upper()->toString(),
                    'latitude' => (float) $layout['latitude'],
                    'longitude' => (float) $layout['longitude'],
                    'name' => $center['name'],
                    'note' => $center['detail'],
                    'status' => $center['status'],
                    'x' => (int) $layout['x'],
                    'y' => (int) $layout['y'],
                ];
            })
            ->values();

        $hazardOverlays = collect($hazardBreakdown)
            ->filter(
                fn (array $hazard): bool => $hazard['key'] !== 'safe-zone'
                    && (int) $hazard['total'] > 0,
            )
            ->values()
            ->map(function (array $hazard) use ($households): array {
                $layout = $this->hazardOverlayLayouts()[$hazard['key']] ?? [
                    'height' => 24,
                    'tone' => 'sky',
                    'width' => 26,
                    'x' => 50,
                    'y' => 50,
                ];

                return [
                    'barangays' => $households
                        ->where('hazard_zone', $hazard['key'])
                        ->pluck('barangay')
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                    'description' => $hazard['detail'],
                    'height' => (int) $layout['height'],
                    'id' => "{$hazard['key']}-overlay",
                    'key' => $hazard['key'],
                    'label' => $hazard['key'] === 'coastal'
                        ? 'Storm Surge / Coastal'
                        : $hazard['label'],
                    'tone' => (string) $layout['tone'],
                    'total' => $hazard['total'],
                    'width' => (int) $layout['width'],
                    'x' => (int) $layout['x'],
                    'y' => (int) $layout['y'],
                ];
            })
            ->all();

        return [
            'filters' => [
                'barangays' => $markers->pluck('barangay')->unique()->values()->all(),
                'statuses' => ['Available', 'Near Full', 'Full'],
            ],
            'hazardAreas' => $hazardOverlays,
            'legend' => [
                [
                    'label' => 'Open',
                    'status' => 'Available',
                ],
                [
                    'label' => 'Near Full',
                    'status' => 'Near Full',
                ],
                [
                    'label' => 'Full',
                    'status' => 'Full',
                ],
            ],
            'markers' => $markers->all(),
            'meta' => [
                'note' => 'Marker positions and hazard layers are mapped for operational awareness until live GIS coordinates are connected.',
                'supportsDirections' => true,
                'supportsGeolocation' => true,
            ],
            'summary' => [
                'full' => $markers->where('status', 'Full')->count(),
                'nearFull' => $markers->where('status', 'Near Full')->count(),
                'open' => $markers->where('status', 'Available')->count(),
                'total' => $markers->count(),
            ],
        ];
    }

    /**
     * @return array<string, array{latitude: float, longitude: float, x: int, y: int}>
     */
    private function mapCenterLayouts(): array
    {
        return [
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
    }

    /**
     * @return array<string, array{height: int, tone: string, width: int, x: int, y: int}>
     */
    private function hazardOverlayLayouts(): array
    {
        return [
            'coastal' => [
                'height' => 40,
                'tone' => 'sky',
                'width' => 28,
                'x' => 78,
                'y' => 38,
            ],
            'flood-prone' => [
                'height' => 28,
                'tone' => 'blue',
                'width' => 34,
                'x' => 18,
                'y' => 26,
            ],
            'landslide' => [
                'height' => 22,
                'tone' => 'amber',
                'width' => 30,
                'x' => 46,
                'y' => 18,
            ],
        ];
    }

    /**
     * @param  Collection<int, array{
     *     name: string,
     *     atRiskResidents: int
     * }>  $barangayMonitoring
     * @param  Collection<int, array{
     *     name: string,
     *     status: string,
     *     isActive: bool
     * }>  $centers
     * @return array<int, array{
     *     affectedBarangay: string|null,
     *     audioUrl: string|null,
     *     id: string,
     *     label: string,
     *     message: string,
     *     reportedAt: string|null,
     *     severity: string,
     *     tone: string
     * }>
     */
    private function buildAlerts(
        Request $request,
        Collection $barangayMonitoring,
        Collection $centers,
        int $supportFlags,
        int $checkedInEvacuees,
    ): array {
        $alerts = collect($this->dashboardAlertBroadcasts($request));
        $commandTimestamp = now();

        $highestRiskBarangay = $barangayMonitoring->first(
            fn (array $barangay): bool => $barangay['atRiskResidents'] > 0,
        );
        if ($highestRiskBarangay !== null) {
            $alerts->push([
                'affectedBarangay' => $highestRiskBarangay['name'],
                'audioUrl' => null,
                'id' => 'barangay-risk',
                'label' => 'Barangay Monitoring',
                'message' => sprintf(
                    '%s currently has the highest planning risk with %d registered residents in exposed zones.',
                    $highestRiskBarangay['name'],
                    $highestRiskBarangay['atRiskResidents'],
                ),
                'reportedAt' => $commandTimestamp->copy()->subMinutes(25)->toIso8601String(),
                'severity' => 'Warning',
                'tone' => 'warning',
            ]);
        }

        if ($supportFlags > 0) {
            $alerts->push([
                'affectedBarangay' => 'City-wide',
                'audioUrl' => null,
                'id' => 'support-flags',
                'label' => 'Vulnerable Groups',
                'message' => "{$supportFlags} residents are flagged for assisted evacuation support or maternal care readiness.",
                'reportedAt' => $commandTimestamp->copy()->subMinutes(12)->toIso8601String(),
                'severity' => 'Critical',
                'tone' => 'critical',
            ]);
        }

        $constrainedCenter = $centers->first(
            fn (array $center): bool => $center['isActive']
                && in_array($center['status'], ['Near Full', 'Full'], true),
        );
        if ($constrainedCenter !== null) {
            $alerts->push([
                'affectedBarangay' => $constrainedCenter['barangay'],
                'audioUrl' => null,
                'id' => 'center-capacity',
                'label' => 'Center Capacity',
                'message' => "{$constrainedCenter['name']} is {$constrainedCenter['status']} in the prototype planning roster.",
                'reportedAt' => $commandTimestamp->copy()->subMinutes(6)->toIso8601String(),
                'severity' => $constrainedCenter['status'] === 'Full' ? 'Critical' : 'Warning',
                'tone' => $constrainedCenter['status'] === 'Full' ? 'critical' : 'warning',
            ]);
        }

        $alerts->push([
            'affectedBarangay' => 'City-wide',
            'audioUrl' => null,
            'id' => 'qr-checkins',
            'label' => 'QR Check-ins',
            'message' => $checkedInEvacuees === 0
                ? 'Live QR check-in alerts will appear here after scanner events and operator accounts are connected.'
                : "{$checkedInEvacuees} evacuees have checked in through the live QR workflow.",
            'reportedAt' => $commandTimestamp->copy()->subMinutes(2)->toIso8601String(),
            'severity' => 'Info',
            'tone' => 'info',
        ]);

        return $alerts
            ->take(4)
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array{
     *     affectedBarangay: string|null,
     *     audioUrl: string|null,
     *     id: string,
     *     label: string,
     *     message: string,
     *     reportedAt: string|null,
     *     severity: string,
     *     tone: string
     * }>  $alerts
     * @return array{
     *     affectedBarangay: string|null,
     *     audioUrl: string|null,
     *     id: string,
     *     label: string,
     *     message: string,
     *     reportedAt: string|null,
     *     severity: string,
     *     tone: string
     * }|null
     */
    private function latestAlert(array $alerts): ?array
    {
        $actionableAlerts = collect($alerts)
            ->filter(fn (array $alert): bool => $alert['tone'] !== 'info')
            ->sortByDesc('reportedAt')
            ->values();

        if ($actionableAlerts->isNotEmpty()) {
            /** @var array{
             *     affectedBarangay: string|null,
             *     audioUrl: string|null,
             *     id: string,
             *     label: string,
             *     message: string,
             *     reportedAt: string|null,
             *     severity: string,
             *     tone: string
             * } $latestAlert
             */
            $latestAlert = $actionableAlerts->first();

            return $latestAlert;
        }

        if ($alerts === []) {
            return null;
        }

        return collect($alerts)
            ->sortByDesc('reportedAt')
            ->values()
            ->first();
    }

    /**
     * @param  array{
     *     affectedBarangay: string|null,
     *     audioUrl: string|null,
     *     id: string,
     *     label: string,
     *     message: string,
     *     reportedAt: string|null,
     *     severity: string,
     *     tone: string
     * }|null  $latestAlert
     * @param  array<int, array{
     *     barangay: string,
     *     created_at: string|null,
     *     hazard_zone: string,
     *     head_name: string,
     *     household_code: string,
     *     id: int,
     *     name: string,
     *     total_members: int
     * }>  $recentHouseholds
     * @param  array<int, array{
     *     barangay: string,
     *     capacity: int,
     *     detail: string,
     *     isActive: bool,
     *     name: string,
     *     occupied: int,
     *     status: string
     * }>  $centers
     * @return array<int, array{
     *     detail: string,
     *     id: string,
     *     timestamp: string|null,
     *     title: string,
     *     tone: string,
     *     type: string
     * }>
     */
    private function buildLiveActivity(
        int $checkedInEvacuees,
        ?array $latestAlert,
        array $recentHouseholds,
        array $centers,
    ): array {
        $activeCenter = collect($centers)->first(
            fn (array $center): bool => $center['isActive']
                && in_array($center['status'], ['Near Full', 'Full'], true),
        ) ?? collect($centers)->first(
            fn (array $center): bool => $center['isActive'],
        );

        $activities = [
            [
                'detail' => $checkedInEvacuees === 0
                    ? 'Scanner feed is waiting for the first safe-arrival scan.'
                    : 'Latest safe-arrival confirmations are now visible in the dashboard.',
                'id' => 'scan-feed',
                'timestamp' => now()->subMinute()->toIso8601String(),
                'title' => $checkedInEvacuees === 0
                    ? 'No evacuee has been scanned safe yet'
                    : "{$checkedInEvacuees} evacuees have been verified safe",
                'tone' => $checkedInEvacuees === 0 ? 'slate' : 'emerald',
                'type' => 'Scanned Evacuee',
            ],
        ];

        if ($recentHouseholds !== []) {
            $latestHousehold = $recentHouseholds[0];
            $activities[] = [
                'detail' => "{$latestHousehold['barangay']} household {$latestHousehold['household_code']} was added to the registry.",
                'id' => 'latest-registration',
                'timestamp' => $latestHousehold['created_at'],
                'title' => "{$latestHousehold['head_name']} completed a new registration",
                'tone' => 'sky',
                'type' => 'New Registration',
            ];
        }

        if ($activeCenter !== null) {
            $activities[] = [
                'detail' => "{$activeCenter['occupied']} of {$activeCenter['capacity']} slots are currently planned for {$activeCenter['name']}.",
                'id' => 'center-status',
                'timestamp' => now()->subMinutes(3)->toIso8601String(),
                'title' => "{$activeCenter['name']} is {$activeCenter['status']}",
                'tone' => $activeCenter['status'] === 'Full'
                    ? 'rose'
                    : ($activeCenter['status'] === 'Near Full' ? 'amber' : 'emerald'),
                'type' => 'Center Update',
            ];
        }

        if ($latestAlert !== null) {
            $activities[] = [
                'detail' => $latestAlert['message'],
                'id' => 'latest-alert',
                'timestamp' => $latestAlert['reportedAt'],
                'title' => "{$latestAlert['label']} alert was issued",
                'tone' => $latestAlert['tone'] === 'critical'
                    ? 'rose'
                    : ($latestAlert['tone'] === 'warning' ? 'amber' : 'sky'),
                'type' => 'Alert Issued',
            ];
        }

        return $activities;
    }

    /**
     * @param  Collection<int, Household>  $households
     * @return array<int, array{
     *     barangay: string,
     *     created_at: string|null,
     *     hazard_zone: string,
     *     head_name: string,
     *     household_code: string,
     *     id: int,
     *     name: string,
     *     total_members: int
     * }>
     */
    private function buildRecentHouseholds(Collection $households): array
    {
        return $households
            ->sortByDesc(fn (Household $household): int => $household->created_at?->getTimestamp() ?? 0)
            ->take(6)
            ->values()
            ->map(fn (Household $household): array => [
                'barangay' => $household->barangay,
                'created_at' => $household->created_at?->toIso8601String(),
                'hazard_zone' => $household->hazard_zone,
                'head_name' => $household->headUser?->name ?? 'Unassigned',
                'household_code' => $household->household_code,
                'id' => $household->id,
                'name' => $household->name,
                'total_members' => $this->memberCountForHousehold($household) + 1,
            ])
            ->all();
    }

    private function panelBarangay(Request $request): ?string
    {
        $role = $request->user()?->role;
        $barangay = $request->user()?->barangay;

        if (! ConsoleRole::isBarangayCommittee($role) || ! is_string($barangay) || $barangay === '') {
            return null;
        }

        return $barangay;
    }

    private function operatorBarangay(Request $request): ?string
    {
        $role = $request->user()?->role;
        $barangay = $request->user()?->barangay;

        if (! ConsoleRole::isOperator($role) || ! is_string($barangay) || $barangay === '') {
            return null;
        }

        return $barangay;
    }

    /**
     * @return array<int, string>
     */
    private function accessibleBarangays(Request $request): array
    {
        $panelBarangay = $this->panelBarangay($request);

        if ($panelBarangay !== null) {
            return [$panelBarangay];
        }

        return MatiCityAddressOptions::barangays();
    }

    private function publishDueAlertBroadcasts(): void
    {
        AlertBroadcast::query()
            ->where('status', 'Scheduled')
            ->whereNotNull('scheduled_for')
            ->where('scheduled_for', '<=', now())
            ->get()
            ->each(function (AlertBroadcast $alertBroadcast): void {
                $alertBroadcast->update([
                    'issued_at' => $alertBroadcast->scheduled_for ?? now(),
                    'scheduled_for' => null,
                    'status' => 'Active',
                ]);
            });
    }

    /**
     * @return array<int, array{
     *     affectedBarangay: string|null,
     *     audioUrl: string|null,
     *     id: string,
     *     label: string,
     *     message: string,
     *     reportedAt: string|null,
     *     severity: string,
     *     tone: string
     * }>
     */
    private function dashboardAlertBroadcasts(Request $request): array
    {
        return $this->visibleAlertBroadcastsQuery($request)
            ->where('status', 'Active')
            ->with('creator:id,name,role')
            ->orderByDesc('issued_at')
            ->limit(4)
            ->get()
            ->map(fn (AlertBroadcast $alertBroadcast): array => [
                'affectedBarangay' => $alertBroadcast->target_barangay ?? 'City-wide',
                'audioUrl' => $alertBroadcast->audio_url,
                'id' => "broadcast-{$alertBroadcast->id}",
                'label' => $alertBroadcast->title,
                'message' => $alertBroadcast->message,
                'reportedAt' => $alertBroadcast->issued_at?->toIso8601String() ?? $alertBroadcast->created_at?->toIso8601String(),
                'severity' => $this->dashboardSeverityForBroadcast($alertBroadcast),
                'tone' => $this->dashboardToneForBroadcast($alertBroadcast),
            ])
            ->values()
            ->all();
    }

    private function visibleAlertBroadcastsQuery(Request $request): Builder
    {
        $panelBarangay = $this->panelBarangay($request);

        return AlertBroadcast::query()
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->where(
                    fn (Builder $innerQuery) => $innerQuery
                        ->whereNull('target_barangay')
                        ->orWhere('target_barangay', $panelBarangay),
                ),
            );
    }

    private function dashboardSeverityForBroadcast(AlertBroadcast $alertBroadcast): string
    {
        return match ($alertBroadcast->severity) {
            'High' => 'Critical',
            'Medium' => 'Warning',
            default => 'Info',
        };
    }

    private function dashboardToneForBroadcast(AlertBroadcast $alertBroadcast): string
    {
        return match ($alertBroadcast->severity) {
            'High' => 'critical',
            'Medium' => 'warning',
            default => 'info',
        };
    }

    private function consoleUsersQuery(?string $panelBarangay = null): Builder
    {
        return User::query()
            ->whereIn('role', ConsoleRole::consoleRoleValues())
            ->whereDoesntHave('household')
            ->when(
                $panelBarangay !== null,
                fn (Builder $query) => $query->where('barangay', $panelBarangay),
            );
    }

    private function localNow(): CarbonInterface
    {
        return now(self::LOCAL_TIMEZONE);
    }

    private function isLocalToday(mixed $timestamp): bool
    {
        if (! $timestamp instanceof CarbonInterface) {
            return false;
        }

        return $timestamp
            ->copy()
            ->setTimezone(self::LOCAL_TIMEZONE)
            ->isSameDay($this->localNow());
    }

    private function isCdrrmoAdmin(Request $request): bool
    {
        return ConsoleRole::isCdrrmoAdmin($request->user()?->role);
    }

    /**
     * @return array<string, array{label: string, detail: string}>
     */
    private function hazardZoneDetails(): array
    {
        return [
            'flood-prone' => [
                'label' => 'Flood-prone',
                'detail' => 'Low-lying communities requiring close water-level monitoring and transport readiness.',
            ],
            'coastal' => [
                'label' => 'Coastal',
                'detail' => 'Households exposed to storm surge and tsunami evacuation advisories.',
            ],
            'landslide' => [
                'label' => 'Landslide',
                'detail' => 'Slope-adjacent areas needing rainfall and terrain risk escalation tracking.',
            ],
            'safe-zone' => [
                'label' => 'Safe Zone',
                'detail' => 'Registered households currently outside priority high-risk evacuation zones.',
            ],
        ];
    }
}
