<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'pinned',
        'saved',
    ];

    protected function casts(): array
    {
        return [
            'pinned' => 'boolean',
            'saved' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (Chat $chat) {
            foreach ($chat->messages as $message) {
                if (!empty($message->attachments) && is_array($message->attachments)) {
                    foreach ($message->attachments as $attachment) {
                        $url = $attachment['url'] ?? '';
                        if (!empty($url)) {
                            $path = parse_url($url, PHP_URL_PATH);
                            if ($path && str_contains($path, '/storage/')) {
                                $relativePath = ltrim(str_replace('/storage/', '', $path), '/');
                                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
                            }
                        }
                    }
                }
            }
        });
    }
}
