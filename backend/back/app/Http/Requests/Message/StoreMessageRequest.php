<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageRequest extends FormRequest
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
            'role' => ['required', Rule::in(['system', 'user', 'assistant'])],
            'content' => ['nullable', 'string', 'max:4000', 'required_without:attachments'],
            'attachments' => ['nullable', 'array', 'max:8'],
            'attachments.*.name' => ['required', 'string', 'max:255'],
            'attachments.*.url' => ['required', 'string', 'max:2048'],
            'attachments.*.type' => ['required', 'string', 'max:100'],
            'attachments.*.size' => ['required', 'integer', 'min:0'],
        ];
    }
}
