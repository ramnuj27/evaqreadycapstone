<?php

namespace App\Http\Requests;

use App\Models\EvacuationCenter;
use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\MatiCityAddressOptions;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManageEvacuationCenterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $center = $this->route('evacuationCenter');

        if (! $user instanceof User) {
            return false;
        }

        if (ConsoleRole::isCdrrmoAdmin($user->role)) {
            return true;
        }

        if (! ConsoleRole::isBarangayCommittee($user->role) || ! is_string($user->barangay) || $user->barangay === '') {
            return false;
        }

        return ! $center instanceof EvacuationCenter
            || $center->barangay === $user->barangay;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $centerId = $this->route('evacuationCenter') instanceof EvacuationCenter
            ? $this->route('evacuationCenter')->id
            : null;

        return [
            'barangay' => ['required', 'string', Rule::in(MatiCityAddressOptions::barangays())],
            'capacity' => ['required', 'integer', 'min:1', 'max:100000'],
            'detail' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('evacuation_centers', 'name')->ignore($centerId),
            ],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();

                if (
                    $user instanceof User
                    && ConsoleRole::isBarangayCommittee($user->role)
                    && $this->input('barangay') !== $user->barangay
                ) {
                    $validator->errors()->add(
                        'barangay',
                        'Barangay committee users can only manage centers in their assigned barangay.',
                    );
                }
            },
        ];
    }
}
