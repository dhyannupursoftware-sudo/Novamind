<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Chat $chat, GeminiService $gemini): JsonResponse
    {
        try {
            abort_unless($chat->user_id === $request->user()->id, 404);

            $data = $request->validated();

            // 1. Create User Message in Database
            $userMessage = $chat->messages()->create([
                'role' => $data['role'],
                'content' => $data['content'] ?? '',
                'attachments' => $data['attachments'] ?? null,
            ]);

            // 2. Update Chat Title & Timestamp
            if ($chat->title === 'New chat' && $userMessage->role === 'user') {
                $title = $userMessage->content
                    ? Str::limit($userMessage->content, 52, '')
                    : (count($userMessage->attachments ?? []) > 0 ? $userMessage->attachments[0]['name'] : 'Uploaded file');
                $chat->update([
                    'title' => Str::limit($title, 52, ''),
                ]);
            } else {
                $chat->touch();
            }

            // If non-user role is posted directly
            if ($userMessage->role !== 'user') {
                return response()->json([
                    'data' => [
                        'user' => new MessageResource($userMessage),
                        'assistant' => null,
                    ],
                ], 201);
            }

            // 3. Retrieve Conversation History
            $history = $chat->messages()
                ->oldest('created_at')
                ->get(['role', 'content', 'attachments'])
                ->toArray();

            // 4. Generate AI Response via Gemini Service
            $aiContent = null;

            try {
                $aiContent = $gemini->generateResponseFromHistory($history);
            } catch (Throwable $throwable) {
                Log::error('Gemini AI generation failed for chat ' . $chat->id, [
                    'chat_id' => $chat->id,
                    'user_id' => $request->user()->id,
                    'error' => $throwable->getMessage(),
                ]);

                $errorStr = strtolower($throwable->getMessage());
                $isRateLimit = str_contains($errorStr, 'quota') || str_contains($errorStr, 'rate limit') || str_contains($errorStr, '429') || str_contains($errorStr, 'resource_exhausted');
                $isKeyMissing = str_contains($errorStr, 'not configured') || str_contains($errorStr, 'api key');

                if ($isRateLimit) {
                    $aiContent = "⚠️ **Gemini API Limit Reached**: The free-tier daily quota for the current API key has been exhausted. Please add a fresh `GEMINI_API_KEY` in the backend environment settings.";
                } elseif ($isKeyMissing) {
                    $aiContent = "⚠️ **Gemini API Key Missing**: The `GEMINI_API_KEY` environment variable is not configured on the server. Please set a valid Gemini API key in Render environment settings.";
                } else {
                    $aiContent = "I'm temporarily unable to reach the AI service. Please verify your connection or try again in a few moments.\n\n*Technical Detail*: " . $throwable->getMessage();
                }
            }

            // 5. Store Assistant Response in Database
            $assistantMessage = $chat->messages()->create([
                'role' => 'assistant',
                'content' => $aiContent ?? 'I am currently unable to generate a response. Please try again.',
                'attachments' => null,
            ]);

            return response()->json([
                'data' => [
                    'user' => new MessageResource($userMessage),
                    'assistant' => new MessageResource($assistantMessage),
                ],
            ], 201);
        } catch (Throwable $criticalError) {
            Log::critical('Unhandled exception in MessageController@store', [
                'chat_id' => $chat->id ?? null,
                'user_id' => $request->user()?->id ?? null,
                'exception' => $criticalError->getMessage(),
                'trace' => $criticalError->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'An unexpected error occurred while processing your message.',
                'error' => $criticalError->getMessage(),
            ], 500);
        }
    }
}
