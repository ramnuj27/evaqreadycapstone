<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Support\HouseholdQrCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationSuccessController extends Controller
{
    public function __invoke(Request $request, HouseholdQrCode $householdQrCode): Response|RedirectResponse
    {
        $householdId = $request->session()->get('registration_success_household_id');

        if (! is_numeric((string) $householdId)) {
            return to_route('register');
        }

        $household = Household::query()
            ->with(['headUser', 'members'])
            ->find((int) $householdId);

        if ($household === null) {
            $request->session()->forget('registration_success_household_id');

            return to_route('register');
        }

        return Inertia::render('auth/register-success', [
            'registration' => [
                'address' => [
                    'barangay' => $household->barangay,
                    'city' => $household->city,
                    'street_address' => $household->street_address,
                ],
                'hazard_zone' => $household->hazard_zone,
                'head' => [
                    'birthdate' => $household->headUser->birthdate?->toDateString(),
                    'contact_number' => $household->headUser->contact_number,
                    'email' => $household->headUser->email,
                    'gender' => $household->headUser->gender,
                    'name' => $household->headUser->name,
                ],
                'household_code' => $household->household_code,
                'household_name' => $household->name,
                'members' => $household->members->map(fn ($member) => [
                    'birthdate' => $member->birthdate?->toDateString(),
                    'category' => $member->category,
                    'full_name' => $member->full_name,
                    'gender' => $member->gender,
                    'is_pregnant' => $member->is_pregnant,
                    'is_pwd' => $member->is_pwd,
                ])->all(),
                'qr_payload' => $householdQrCode->payloadFor($household),
                'qr_svg' => $householdQrCode->svgFor($household),
                'total_members' => $household->members->count() + 1,
            ],
        ]);
    }
}
