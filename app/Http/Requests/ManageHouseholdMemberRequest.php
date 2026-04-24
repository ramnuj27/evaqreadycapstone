<?php

namespace App\Http\Requests;

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\ConsoleRole;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManageHouseholdMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $household = $this->householdForRequest();

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
            'category' => ['required', Rule::in(['Child', 'Adult', 'Senior'])],
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'is_pregnant' => ['nullable', 'boolean'],
            'is_pwd' => ['nullable', 'boolean'],
            'pwd_type' => ['nullable', Rule::in($this->pwdTypes())],
            'pwd_type_other' => ['nullable', 'string', 'max:255'],
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
                        'Pregnant can only be enabled for female household members.',
                    );
                }

                if ($this->boolean('is_pwd') && blank($this->input('pwd_type'))) {
                    $validator->errors()->add(
                        'pwd_type',
                        'Select the PWD type when a household member is marked as PWD.',
                    );
                }

                if (
                    $this->boolean('is_pwd')
                    && $this->input('pwd_type') === 'other'
                    && blank($this->input('pwd_type_other'))
                ) {
                    $validator->errors()->add(
                        'pwd_type_other',
                        'Specify the PWD type when "Other" is selected.',
                    );
                }
            },
        ];
    }

    private function householdForRequest(): ?Household
    {
        $household = $this->route('household');

        if ($household instanceof Household) {
            return $household;
        }

        $member = $this->route('member');

        if (! $member instanceof HouseholdMember) {
            return null;
        }

        return $member->household;
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
}
