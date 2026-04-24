<?php

namespace App\Http\Controllers;

use App\Models\AlertBroadcast;
use App\Support\MatiCityAddressOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AlertBroadcastController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedPayload($request);

        AlertBroadcast::query()->create(
            $this->payloadForPersistence($request, $validated),
        );

        return to_route('alerts-notifications')
            ->with('success', 'Alert broadcast sent successfully.');
    }

    public function update(Request $request, AlertBroadcast $alertBroadcast): RedirectResponse
    {
        $validated = $this->validatedPayload($request);

        $alertBroadcast->update(
            $this->payloadForPersistence($request, $validated, $alertBroadcast),
        );

        return to_route('alerts-notifications')
            ->with('success', 'Alert broadcast updated successfully.');
    }

    public function destroy(AlertBroadcast $alertBroadcast): RedirectResponse
    {
        $alertBroadcast->delete();

        return to_route('alerts-notifications')
            ->with('success', 'Alert broadcast deleted successfully.');
    }

    /**
     * @return array{
     *     audio_enabled?: bool,
     *     dispatch_action: string,
     *     message: string,
     *     scheduled_for?: string|null,
     *     severity: string,
     *     target: string,
     *     title: string,
     *     type: string
     * }
     */
    private function validatedPayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['required', 'string', Rule::in(['Alert', 'Announcement'])],
            'severity' => ['required', 'string', Rule::in(['High', 'Medium', 'Low'])],
            'target' => ['required', 'string', Rule::in(['All', ...MatiCityAddressOptions::barangays()])],
            'audio_enabled' => ['nullable', 'boolean'],
            'dispatch_action' => ['required', 'string', Rule::in(['send_now', 'schedule'])],
            'scheduled_for' => [
                Rule::requiredIf(
                    fn (): bool => $request->string('dispatch_action')->toString() === 'schedule',
                ),
                'nullable',
                'date',
                'after:now',
            ],
        ]);
    }

    /**
     * @param  array{
     *     audio_enabled?: bool,
     *     dispatch_action: string,
     *     message: string,
     *     scheduled_for?: string|null,
     *     severity: string,
     *     target: string,
     *     title: string,
     *     type: string
     * }  $validated
     * @return array<string, mixed>
     */
    private function payloadForPersistence(
        Request $request,
        array $validated,
        ?AlertBroadcast $alertBroadcast = null,
    ): array {
        $isScheduled = $validated['dispatch_action'] === 'schedule';

        return [
            'audio_enabled' => (bool) ($validated['audio_enabled'] ?? false),
            'audio_url' => $alertBroadcast?->audio_url,
            'created_by_user_id' => $alertBroadcast?->created_by_user_id ?? $request->user()?->id,
            'issued_at' => $isScheduled ? null : ($alertBroadcast?->issued_at ?? now()),
            'message' => $validated['message'],
            'scheduled_for' => $isScheduled ? $validated['scheduled_for'] : null,
            'severity' => $validated['severity'],
            'status' => $isScheduled ? 'Scheduled' : 'Active',
            'target_barangay' => $validated['target'] === 'All' ? null : $validated['target'],
            'title' => $validated['title'],
            'type' => $validated['type'],
        ];
    }
}
