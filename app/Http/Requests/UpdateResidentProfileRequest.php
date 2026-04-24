<?php

namespace App\Http\Requests;

use App\Concerns\ProfileValidationRules;
use App\Support\MatiCityAddressOptions;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResidentProfileRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()?->id),
            'barangay' => ['required', 'string', Rule::in(MatiCityAddressOptions::barangays())],
            'birthdate' => ['nullable', 'date', 'before_or_equal:today'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'is_pregnant' => ['nullable', 'boolean'],
            'is_pwd' => ['nullable', 'boolean'],
            'pwd_type' => ['nullable', Rule::in($this->pwdTypes())],
            'pwd_type_other' => ['nullable', 'string', 'max:255'],
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
                        'Pregnant can only be enabled for female residents.',
                    );
                }

                if ($this->boolean('is_pwd') && blank($this->input('pwd_type'))) {
                    $validator->errors()->add(
                        'pwd_type',
                        'Select the PWD type when PWD is enabled.',
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
