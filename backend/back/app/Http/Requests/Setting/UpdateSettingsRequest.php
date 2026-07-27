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
        $hexColor = ['sometimes', 'required', 'regex:/^#[0-9A-Fa-f]{6}$/'];

        return [
            'theme' => ['sometimes', 'required', Rule::in(['dark', 'light', 'system'])],
            'language' => ['sometimes', 'required', 'string', 'max:12'],
            'model' => ['sometimes', 'required', 'string', 'max:80'],
            'notifications' => ['sometimes', 'boolean'],
            'user_bubble_color' => $hexColor,
            'user_text_color' => $hexColor,
            'ai_accent_color' => $hexColor,
            'chat_background_color' => $hexColor,
            'sidebar_color' => $hexColor,
            'header_color' => $hexColor,
            'primary_color' => $hexColor,
            'font_size' => ['sometimes', 'required', 'integer', 'between:13,20'],
            'font_family' => ['sometimes', 'required', Rule::in(['Inter', 'System', 'Georgia', 'Monospace'])],
            'border_radius' => ['sometimes', 'required', 'integer', 'between:0,28'],
            'bubble_opacity' => ['sometimes', 'required', 'numeric', 'between:0.35,1'],
            'ui_preferences' => ['sometimes', 'array'],
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
