<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOperatorScanRequest extends FormRequest
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
            'attendee_refs' => ['nullable', 'array'],
            'attendee_refs.*' => ['required', 'string', 'max:255'],
            'evacuation_center_name' => ['required', 'string', 'max:255'],
            'payload' => ['required', 'string', 'max:255'],
            'scanned_at' => ['nullable', 'date'],
            'type' => ['required', 'string', Rule::in(['IN', 'OUT'])],
        ];
    }
}
