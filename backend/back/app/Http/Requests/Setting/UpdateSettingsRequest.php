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
        $colorRule = [
            'sometimes',
            'nullable',
            'string',
            function ($attribute, $value, $fail) {
                if ($value !== null && $value !== '' && $value !== 'default' && !preg_match('/^#(?:[0-9A-Fa-f]{3}){1,2}$/', $value)) {
                    $fail("The {$attribute} must be a valid hex color code (e.g. #10A37F) or 'default'.");
                }
            },
        ];

        return [
            'theme' => ['sometimes', 'required', Rule::in(['dark', 'light', 'system'])],
            'language' => ['sometimes', 'required', 'string', 'max:12'],
            'model' => ['sometimes', 'required', 'string', 'max:80'],
            'notifications' => ['sometimes', 'boolean'],
            'user_bubble_color' => $colorRule,
            'user_text_color' => $colorRule,
            'ai_accent_color' => $colorRule,
            'chat_background_color' => $colorRule,
            'sidebar_color' => $colorRule,
            'header_color' => $colorRule,
            'primary_color' => $colorRule,
            'font_size' => ['sometimes', 'required', 'integer', 'between:10,36'],
            'font_family' => ['sometimes', 'required', 'string', 'max:64'],
            'border_radius' => ['sometimes', 'required', 'integer', 'between:0,50'],
            'bubble_opacity' => ['sometimes', 'required', 'numeric', 'between:0,1'],
            'ui_preferences' => ['sometimes', 'nullable', 'array'],
            'ui_preferences.chatBubbleStyle' => ['sometimes', Rule::in(['modern-pill', 'compact-classic', 'glassmorphism'])],
            'ui_preferences.fontSize' => ['sometimes', Rule::in(['small', 'medium', 'large'])],
            'ui_preferences.autoScroll' => ['sometimes', 'boolean'],
            'ui_preferences.showTypingIndicator' => ['sometimes', 'boolean'],
            'ui_preferences.showTimestamps' => ['sometimes', 'boolean'],
            'ui_preferences.chatViewMode' => ['sometimes', Rule::in(['compact', 'comfortable'])],
            'ui_preferences.messageAnimations' => ['sometimes', 'boolean'],
            'ui_preferences.streamingResponse' => ['sometimes', 'boolean'],
            'ui_preferences.responseLength' => ['sometimes', Rule::in(['short', 'medium', 'long'])],
            'ui_preferences.detailLevel' => ['sometimes', Rule::in(['basic', 'detailed', 'expert'])],
            'ui_preferences.creativityLevel' => ['sometimes', Rule::in(['precise', 'balanced', 'creative'])],
            'ui_preferences.codeFormatting' => ['sometimes', 'boolean'],
            'ui_preferences.markdownRendering' => ['sometimes', 'boolean'],
            'ui_preferences.fullscreenDefault' => ['sometimes', 'boolean'],
            'ui_preferences.autoSaveDrafts' => ['sometimes', 'boolean'],
            'ui_preferences.autoCopyCode' => ['sometimes', 'boolean'],
            'ui_preferences.performanceMode' => ['sometimes', 'boolean'],
            'ui_preferences.developerMode' => ['sometimes', 'boolean'],
        ];
    }
}
