<?php

namespace App\Http\Requests\ScanHistory;

use Illuminate\Foundation\Http\FormRequest;

class HistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'truck_id' => 'required|exists:trucks,id',
            'date_scan' => 'required|string',
            'time_scan' => 'required|string',
            'type' => 'required|string',
            'location_code' => 'required|string',
            'location' => 'required|string',
        ];
    }
}
