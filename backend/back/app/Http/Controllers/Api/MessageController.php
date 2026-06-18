<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Services\OllamaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Chat $chat, OllamaService $ollama): \Illuminate\Http\JsonResponse
    {
        abort_unless($chat->user_id === $request->user()->id, 404);

        $data = $request->validated();

        $userMessage = $chat->messages()->create([
            'role' => $data['role'],
            'content' => $data['content'] ?? '',
            'attachments' => $data['attachments'] ?? null,
        ]);

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

        if ($userMessage->role !== 'user') {
            return response()->json([
                'data' => [
                    'user' => new MessageResource($userMessage),
                    'assistant' => null,
                ],
            ], 201);
        }

        $history = $chat->messages()
            ->oldest('created_at')
            ->get(['role', 'content'])
            ->toArray();

        $userSettings = $request->user()->settings()->firstOrCreate([], [
            'theme' => 'dark',
            'language' => 'en',
            'model' => 'nova-pro',
        ]);

        try {
            $aiContent = $ollama->generateResponse($history, $userSettings->model);
        } catch (Throwable $throwable) {
            Log::error('Ollama generation failed.', [
                'chat_id' => $chat->id,
                'user_id' => $request->user()->id,
                'error' => $throwable->getMessage(),
            ]);

            return response()->json([
                'message' => 'AI service unavailable. Ensure Ollama is running and qwen3:8b is installed.',
                'error' => $throwable->getMessage(),
                'data' => [
                    'user' => new MessageResource($userMessage),
                    'assistant' => null,
                ],
            ], 503);
        }

        $assistantMessage = $chat->messages()->create([
            'role' => 'assistant',
            'content' => $aiContent,
            'attachments' => null,
        ]);

        return response()->json([
            'data' => [
                'user' => new MessageResource($userMessage),
                'assistant' => new MessageResource($assistantMessage),
            ],
        ], 201);
    }
}
