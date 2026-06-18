<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AiHealthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('profile', [AuthController::class, 'updateProfile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('ai/health', AiHealthController::class);
    Route::apiResource('chats', ChatController::class);
    Route::post('chats/{chat}/messages', [MessageController::class, 'store']);
    Route::post('upload', [AttachmentController::class, 'upload']);

    Route::get('settings', [SettingController::class, 'show']);
    Route::put('settings', [SettingController::class, 'update']);
    Route::patch('settings', [SettingController::class, 'update']);
});
