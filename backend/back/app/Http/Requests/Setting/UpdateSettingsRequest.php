<?php

namespace App\Http\Requests\Setting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'theme' => ['sometimes', 'required', Rule::in(['dark', 'light', 'system'])],
            'language' => ['sometimes', 'required', 'string', 'max:12'],
            'model' => ['sometimes', 'required', 'string', 'max:80'],
            'notifications' => ['sometimes', 'boolean'],
        ];
    }
}
