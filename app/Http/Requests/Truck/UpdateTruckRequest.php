<?php

namespace App\Http\Requests\Truck;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTruckRequest extends FormRequest
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
            'vehicle_id' => 'required|string|unique:trucks,vehicle_id,'.$this->id,
            'plate_no' => 'required|string|unique:trucks,plate_no,'.$this->id,
            'capacity' => 'required|integer',
            'agent' => 'required|string',
            'location_code' => 'required|string',
            'location' => 'required|string',
            'provider' => 'required|string',
        ];
    }
}
