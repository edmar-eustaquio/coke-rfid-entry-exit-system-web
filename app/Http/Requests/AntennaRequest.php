<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AntennaRequest extends FormRequest
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
            "reader_id" => 'required|exists:readers,id',
            "port" => 'required|numeric',
            "station" => 'required',
            "entry_or_exit_site" => 'nullable|string',
        ];
    }
}
