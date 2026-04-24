<?php

namespace App\Http\Controllers;

use App\Actions\Operator\RecordEvacuationScan;
use App\Http\Requests\StoreOperatorScanRequest;
use App\Http\Requests\SyncOperatorScansRequest;
use App\Http\Requests\UpdateOperatorScanAttendanceRequest;
use App\Models\EvacuationScan;
use App\Support\HouseholdQrRoster;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class OperatorScanController extends Controller
{
    public function store(
        StoreOperatorScanRequest $request,
        RecordEvacuationScan $recordEvacuationScan,
    ): JsonResponse {
        /** @var User $operator */
        $operator = $request->user();
        /** @var array{
         *     attendee_refs?: array<int, string>|null,
         *     evacuation_center_name: string,
         *     payload: string,
         *     scanned_at?: string|null,
         *     type: string
         * } $validated
         */
        $validated = $request->validated();

        $scan = $recordEvacuationScan->handle(
            $operator,
            $validated['payload'],
            $validated['type'],
            $validated['evacuation_center_name'],
            $validated['attendee_refs'] ?? null,
            isset($validated['scanned_at']) && filled($validated['scanned_at'])
                ? Carbon::parse($validated['scanned_at'])
                : null,
        );

        return response()->json([
            'id' => $scan->id,
            'record' => $this->scanRecordPayload($scan),
            'synced_at' => now()->toIso8601String(),
        ]);
    }

    public function sync(
        SyncOperatorScansRequest $request,
        RecordEvacuationScan $recordEvacuationScan,
    ): JsonResponse {
        /** @var User $operator */
        $operator = $request->user();
        $scans = [];
        /** @var array{
         *     records: array<int, array{
         *         attendee_refs?: array<int, string>|null,
         *         evacuation_center_name: string,
         *         payload: string,
         *         scanned_at?: string|null,
         *         type: string
         *     }>
         * } $validated
         */
        $validated = $request->validated();

        collect($validated['records'])->each(function (array $record) use (
            $operator,
            $recordEvacuationScan,
            &$scans,
        ): void {
            $scans[] = $recordEvacuationScan->handle(
                $operator,
                $record['payload'],
                $record['type'],
                $record['evacuation_center_name'],
                $record['attendee_refs'] ?? null,
                isset($record['scanned_at']) && filled($record['scanned_at'])
                    ? Carbon::parse($record['scanned_at'])
                    : null,
            );
        });

        return response()->json([
            'count' => count($validated['records']),
            'records' => collect($scans)->map(
                fn (EvacuationScan $scan): array => $this->scanRecordPayload($scan),
            )->all(),
            'synced_at' => now()->toIso8601String(),
        ]);
    }

    public function update(
        UpdateOperatorScanAttendanceRequest $request,
        EvacuationScan $evacuationScan,
        RecordEvacuationScan $recordEvacuationScan,
    ): JsonResponse {
        $scan = $recordEvacuationScan->updateAttendance(
            $evacuationScan,
            $request->validated('attendee_refs'),
        );

        return response()->json([
            'id' => $scan->id,
            'record' => $this->scanRecordPayload($scan),
            'synced_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * @return array{
     *     address: string|null,
     *     attendee_refs: array<int, string>,
     *     barangay: string,
     *     evacuation_center_name: string|null,
      *     household_code: string,
     *     household_members: array<int, array{
     *         age: int|null,
     *         gender: string|null,
     *         id: string,
     *         name: string,
     *         qrReference: string,
     *         role: string
     *     }>,
     *     household_name: string,
     *     name: string,
     *     payload: string,
     *     scanned_at: string|null,
      *     type: string
     * }
     */
    private function scanRecordPayload(EvacuationScan $scan): array
    {
        $household = $scan->household()->firstOrFail();

        return [
            'address' => $household->street_address,
            'attendee_refs' => collect($scan->attendee_refs)
                ->filter(fn (mixed $reference): bool => is_string($reference))
                ->map(fn (string $reference): string => trim($reference))
                ->filter(fn (string $reference): bool => $reference !== '')
                ->values()
                ->all(),
            'barangay' => $household->barangay,
            'evacuation_center_name' => $scan->evacuation_center_name,
            'household_code' => $household->household_code,
            'household_members' => HouseholdQrRoster::members($household),
            'household_name' => $household->name,
            'name' => $household->headUser?->name ?? $household->name,
            'payload' => $scan->payload,
            'scanned_at' => $scan->scanned_at?->toIso8601String(),
            'type' => $scan->type,
        ];
    }
}
