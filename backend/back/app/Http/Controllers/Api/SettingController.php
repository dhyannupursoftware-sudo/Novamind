<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\UpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(Request $request): SettingResource
    {
        return new SettingResource($this->settingsFor($request));
    }

    public function update(UpdateSettingsRequest $request): SettingResource
    {
        $settings = $this->settingsFor($request);
        $data = $request->validated();

        if (array_key_exists('ui_preferences', $data) && is_array($data['ui_preferences'])) {
            $existing = is_array($settings->ui_preferences) ? $settings->ui_preferences : [];
            $data['ui_preferences'] = array_merge($existing, $data['ui_preferences']);
        }

        $settings->update($data);

        return new SettingResource($settings->fresh());
    }

    private function settingsFor(Request $request): Setting
    {
        return $request->user()->settings()->firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'theme' => 'dark',
                'language' => 'en',
                'model' => 'nova-pro',
                'notifications' => true,
            ]
        );
    }
}
