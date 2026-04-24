<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHouseholdMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $member = $this->route('member');
        return $this->user()->household()->where('id', $member->household_id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'category' => ['required', 'in:Child,Adult,Senior'],
            'is_pwd' => ['nullable', 'boolean'],
            'pwd_type' => ['nullable', Rule::in($this->pwdTypes())],
            'pwd_type_other' => ['nullable', 'string', 'max:255'],
            'is_pregnant' => ['nullable', 'boolean'],
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
