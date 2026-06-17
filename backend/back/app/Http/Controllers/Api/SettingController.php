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
        $settings->update($request->validated());

        return new SettingResource($settings->fresh());
    }

    private function settingsFor(Request $request): Setting
    {
        return $request->user()->settings()->firstOrCreate([], [
            'theme' => 'dark',
            'language' => 'en',
            'model' => 'nova-pro',
        ]);
    }
}
