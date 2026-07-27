<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'model',
        'notifications',
        'user_bubble_color',
        'user_text_color',
        'ai_accent_color',
        'chat_background_color',
        'sidebar_color',
        'header_color',
        'primary_color',
        'font_size',
        'font_family',
        'border_radius',
        'bubble_opacity',
        'ui_preferences',
    ];

    protected function casts(): array
    {
        return [
            'notifications' => 'boolean',
            'font_size' => 'integer',
            'border_radius' => 'integer',
            'bubble_opacity' => 'float',
            'ui_preferences' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
