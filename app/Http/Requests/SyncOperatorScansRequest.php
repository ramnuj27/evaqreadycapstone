<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncOperatorScansRequest extends FormRequest
{
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
            'records' => ['required', 'array', 'min:1'],
            'records.*.attendee_refs' => ['nullable', 'array'],
            'records.*.attendee_refs.*' => ['required', 'string', 'max:255'],
            'records.*.evacuation_center_name' => ['required', 'string', 'max:255'],
            'records.*.payload' => ['required', 'string', 'max:255'],
            'records.*.scanned_at' => ['nullable', 'date'],
            'records.*.type' => ['required', 'string', Rule::in(['IN', 'OUT'])],
        ];
    }
}
