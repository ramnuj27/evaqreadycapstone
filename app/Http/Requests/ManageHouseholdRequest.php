<?php

namespace App\Http\Requests;

use App\Models\Household;
use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\MatiCityAddressOptions;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManageHouseholdRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $household = $this->route('household');

        return $user instanceof User
            && $household instanceof Household
            && $this->canManageHousehold($user, $household);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'barangay' => ['required', 'string', 'max:255', Rule::in(MatiCityAddressOptions::barangays())],
            'city' => ['required', 'string', 'max:255', Rule::in([MatiCityAddressOptions::city()])],
            'contact_number' => ['required', 'string', 'max:24', 'regex:/^[0-9+\-\s()]{7,24}$/'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'hazard_zone' => ['required', Rule::in($this->hazardZones())],
            'head_name' => ['required', 'string', 'max:255'],
            'household_name' => ['required', 'string', 'max:255'],
            'is_pregnant' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in($this->householdStatuses())],
            'street_address' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (
                    $this->input('gender') !== 'female'
                    && (bool) $this->boolean('is_pregnant')
                ) {
                    $validator->errors()->add(
                        'is_pregnant',
                        'Pregnant can only be enabled for a female head of household.',
                    );
                }

                $user = $this->user();

                if (
                    $user instanceof User
                    && ConsoleRole::isBarangayCommittee($user->role)
                    && $this->input('barangay') !== $user->barangay
                ) {
                    $validator->errors()->add(
                        'barangay',
                        'Barangay committee users can only manage households in their assigned barangay.',
                    );
                }
            },
        ];
    }

    private function canManageHousehold(User $user, Household $household): bool
    {
        if (ConsoleRole::isCdrrmoAdmin($user->role)) {
            return true;
        }

        return ConsoleRole::isBarangayCommittee($user->role)
            && is_string($user->barangay)
            && $user->barangay !== ''
            && $household->barangay === $user->barangay;
    }

    /**
     * @return array<int, string>
     */
    private function hazardZones(): array
    {
        return ['flood-prone', 'coastal', 'landslide', 'safe-zone'];
    }

    /**
     * @return array<int, string>
     */
    private function householdStatuses(): array
    {
        return ['Active', 'Inactive', 'Relocated'];
    }
}
