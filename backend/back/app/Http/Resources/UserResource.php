<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Throwable;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'created_at' => $this->formatDateTime($this->created_at),
            'settings' => new SettingResource($this->whenLoaded('settings')),
        ];
    }

    private function formatDateTime(mixed $date): ?string
    {
        if ($date === null) {
            return null;
        }

        if ($date instanceof Carbon) {
            return $date->toISOString();
        }

        if (is_string($date)) {
            try {
                return Carbon::parse($date)->toISOString();
            } catch (Throwable) {
                return $date;
            }
        }

        return null;
    }
}
