<?php

namespace App\Actions\Operator;

use App\Models\EvacuationScan;
use App\Models\Household;
use App\Models\User;
use App\Support\HouseholdQrRoster;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordEvacuationScan
{
    private const QR_PAYLOAD_PREFIX = 'EVAQREADY-HOUSEHOLD:';

    public function handle(
        User $operator,
        string $payload,
        string $type,
        string $evacuationCenterName,
        ?array $attendeeReferences = null,
        ?CarbonInterface $scannedAt = null,
    ): EvacuationScan
    {
        $normalizedType = strtoupper(trim($type));
        $household = $this->resolveHousehold($payload);
        $normalizedEvacuationCenterName = trim($evacuationCenterName);
        $currentAttendeeReferences = $this->currentAttendeeReferences($household);

        if ($normalizedEvacuationCenterName === '') {
            throw ValidationException::withMessages([
                'evacuation_center_name' => 'Select the evacuation center before scanning the QR code.',
            ]);
        }

        $scanTimestamp = $scannedAt === null
            ? now()
            : Carbon::instance($scannedAt->toDateTime());
        $resolvedAttendeeReferences = $this->determineAttendeeReferences(
            $household,
            $normalizedType,
            $attendeeReferences,
            $currentAttendeeReferences,
        );
        $resultingAttendeeReferences = $this->applyScan(
            $currentAttendeeReferences,
            $resolvedAttendeeReferences,
            $normalizedType,
        );

        /** @var EvacuationScan $scan */
        $scan = DB::transaction(function () use (
            $household,
            $resolvedAttendeeReferences,
            $resultingAttendeeReferences,
            $normalizedEvacuationCenterName,
            $normalizedType,
            $operator,
            $payload,
            $scanTimestamp,
        ): EvacuationScan {
            $createdScan = EvacuationScan::query()->create([
                'attendee_refs' => $resolvedAttendeeReferences,
                'evacuation_center_name' => $normalizedEvacuationCenterName,
                'household_id' => $household->id,
                'operator_user_id' => $operator->id,
                'payload' => trim($payload),
                'scanned_at' => $scanTimestamp,
                'type' => $normalizedType,
            ]);

            $household->forceFill([
                'evacuation_status' => $resultingAttendeeReferences !== []
                    ? 'evacuated'
                    : 'not yet evacuated',
                'evacuation_status_updated_at' => $scanTimestamp,
            ])->save();

            return $createdScan;
        });

        return $scan->loadMissing(['household.headUser', 'household.members']);
    }

    public function updateAttendance(
        EvacuationScan $scan,
        array $attendeeReferences,
    ): EvacuationScan {
        $household = $scan->household()->firstOrFail();
        $latestScan = $household->evacuationScans()
            ->latest('scanned_at')
            ->latest('id')
            ->first();

        if ($latestScan === null || ! $latestScan->is($scan)) {
            throw ValidationException::withMessages([
                'attendee_refs' => 'Only the latest scan can be updated for member tagging.',
            ]);
        }

        $currentAttendeeReferences = $this->currentAttendeeReferences(
            $household,
            $scan,
        );
        $resolvedAttendeeReferences = $this->determineAttendeeReferences(
            $household,
            $scan->type,
            $attendeeReferences,
            $currentAttendeeReferences,
        );
        $resultingAttendeeReferences = $this->applyScan(
            $currentAttendeeReferences,
            $resolvedAttendeeReferences,
            $scan->type,
        );

        DB::transaction(function () use (
            $household,
            $resolvedAttendeeReferences,
            $resultingAttendeeReferences,
            $scan,
        ): void {
            $scan->forceFill([
                'attendee_refs' => $resolvedAttendeeReferences,
            ])->save();

            $household->forceFill([
                'evacuation_status' => $resultingAttendeeReferences !== []
                    ? 'evacuated'
                    : 'not yet evacuated',
                'evacuation_status_updated_at' => $scan->scanned_at,
            ])->save();
        });

        return $scan->fresh()->loadMissing(['household.headUser', 'household.members']);
    }

    private function resolveHousehold(string $payload): Household
    {
        $householdCode = $this->householdCodeFromPayload($payload);

        $household = Household::query()
            ->whereRaw('UPPER(household_code) = ?', [strtoupper($householdCode)])
            ->first();

        if ($household === null) {
            throw ValidationException::withMessages([
                'payload' => 'Invalid QR. The scanned code does not match a registered household.',
            ]);
        }

        return $household;
    }

    private function householdCodeFromPayload(string $payload): string
    {
        $normalizedPayload = strtoupper(trim($payload));
        $householdCode = str_starts_with($normalizedPayload, self::QR_PAYLOAD_PREFIX)
            ? substr($normalizedPayload, strlen(self::QR_PAYLOAD_PREFIX))
            : $normalizedPayload;

        if (
            preg_match('/^(.*?)-(HEAD|M\d{2})$/', $householdCode, $matches) === 1
            && isset($matches[1])
        ) {
            return $matches[1];
        }

        return $householdCode;
    }

    /**
     * @param  array<int, string>|null  $attendeeReferences
     * @param  array<int, string>  $currentAttendeeReferences
     * @return array<int, string>
     */
    private function determineAttendeeReferences(
        Household $household,
        string $type,
        ?array $attendeeReferences,
        array $currentAttendeeReferences,
    ): array {
        $normalizedType = strtoupper(trim($type));
        $hasExplicitAttendeeReferences = $attendeeReferences !== null;
        $selectedAttendeeReferences = $attendeeReferences === null
            ? $this->defaultAttendeeReferences(
                $household,
                $normalizedType,
                $currentAttendeeReferences,
            )
            : $this->normalizeExplicitAttendeeReferences(
                $household,
                $attendeeReferences,
            );

        if ($hasExplicitAttendeeReferences && $selectedAttendeeReferences === []) {
            return [];
        }

        if ($normalizedType === 'IN') {
            $arrivingReferences = array_values(array_diff(
                $selectedAttendeeReferences,
                $currentAttendeeReferences,
            ));

            if ($arrivingReferences === []) {
                throw ValidationException::withMessages([
                    'payload' => 'Duplicate scan. This evacuee already has an active Time-In record.',
                ]);
            }

            return $arrivingReferences;
        }

        $departingReferences = array_values(array_intersect(
            $selectedAttendeeReferences,
            $currentAttendeeReferences,
        ));

        if ($departingReferences === []) {
            throw ValidationException::withMessages([
                'payload' => 'Time-Out cannot be recorded yet because no active Time-In was found.',
            ]);
        }

        return $departingReferences;
    }

    /**
     * @param  array<int, string>  $currentAttendeeReferences
     * @return array<int, string>
     */
    private function defaultAttendeeReferences(
        Household $household,
        string $type,
        array $currentAttendeeReferences,
    ): array {
        $availableAttendeeReferences = HouseholdQrRoster::qrReferences($household);

        return $type === 'IN'
            ? array_values(array_diff(
                $availableAttendeeReferences,
                $currentAttendeeReferences,
            ))
            : array_values(array_intersect(
                $availableAttendeeReferences,
                $currentAttendeeReferences,
            ));
    }

    /**
     * @param  array<int, string>  $attendeeReferences
     * @return array<int, string>
     */
    private function normalizeExplicitAttendeeReferences(
        Household $household,
        array $attendeeReferences,
    ): array {
        $availableReferenceMap = collect(HouseholdQrRoster::qrReferences($household))
            ->mapWithKeys(fn (string $reference): array => [
                strtoupper($reference) => $reference,
            ]);
        $normalizedAttendeeReferences = collect($attendeeReferences)
            ->filter(fn (mixed $reference): bool => is_string($reference))
            ->map(fn (string $reference): string => strtoupper(trim($reference)))
            ->filter(fn (string $reference): bool => $reference !== '')
            ->unique()
            ->values();

        $invalidReferences = $normalizedAttendeeReferences
            ->reject(fn (string $reference): bool => $availableReferenceMap->has($reference))
            ->values()
            ->all();

        if ($invalidReferences !== []) {
            throw ValidationException::withMessages([
                'attendee_refs' => 'One or more tagged household members are invalid for this QR.',
            ]);
        }

        return $normalizedAttendeeReferences
            ->map(fn (string $reference): string => (string) $availableReferenceMap->get($reference))
            ->all();
    }

    /**
     * @param  array<int, string>  $currentAttendeeReferences
     * @param  array<int, string>  $attendeeReferences
     * @return array<int, string>
     */
    private function applyScan(
        array $currentAttendeeReferences,
        array $attendeeReferences,
        string $type,
    ): array {
        $activeReferenceMap = collect($currentAttendeeReferences)
            ->mapWithKeys(fn (string $reference): array => [$reference => $reference]);

        foreach ($attendeeReferences as $reference) {
            if (strtoupper($type) === 'IN') {
                $activeReferenceMap->put($reference, $reference);

                continue;
            }

            $activeReferenceMap->forget($reference);
        }

        return $activeReferenceMap->values()->all();
    }

    /**
     * @return array<int, string>
     */
    private function currentAttendeeReferences(
        Household $household,
        ?EvacuationScan $ignoredScan = null,
    ): array {
        $allAttendeeReferences = HouseholdQrRoster::qrReferences($household);
        $scanQuery = $household->evacuationScans()
            ->select([
                'id',
                'household_id',
                'attendee_refs',
                'type',
                'scanned_at',
            ])
            ->orderBy('scanned_at')
            ->orderBy('id');

        if ($ignoredScan !== null) {
            $scanQuery->whereKeyNot($ignoredScan->id);
        }

        /** @var Collection<int, EvacuationScan> $scans */
        $scans = $scanQuery->get();
        $activeReferenceMap = collect();

        $scans->each(function (EvacuationScan $scan) use (
            $activeReferenceMap,
            $allAttendeeReferences,
        ): void {
            $scanAttendeeReferences = $this->storedAttendeeReferences(
                $scan,
                $allAttendeeReferences,
            );

            foreach ($scanAttendeeReferences as $reference) {
                if ($scan->type === 'IN') {
                    $activeReferenceMap->put($reference, $reference);

                    continue;
                }

                $activeReferenceMap->forget($reference);
            }
        });

        return $activeReferenceMap->values()->all();
    }

    /**
     * @param  array<int, string>  $allAttendeeReferences
     * @return array<int, string>
     */
    private function storedAttendeeReferences(
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
}
