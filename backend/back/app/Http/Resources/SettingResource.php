<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'theme' => $this->theme,
            'language' => $this->language,
            'model' => $this->model,
            'notifications' => (bool) $this->notifications,
            'user_bubble_color' => $this->user_bubble_color,
            'user_text_color' => $this->user_text_color,
            'ai_accent_color' => $this->ai_accent_color,
            'chat_background_color' => $this->chat_background_color,
            'sidebar_color' => $this->sidebar_color,
            'header_color' => $this->header_color,
            'primary_color' => $this->primary_color,
            'font_size' => (int) $this->font_size,
            'font_family' => $this->font_family,
            'border_radius' => (int) $this->border_radius,
            'bubble_opacity' => (float) $this->bubble_opacity,
            'ui_preferences' => $this->ui_preferences ?? [],
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
