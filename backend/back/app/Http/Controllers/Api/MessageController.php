<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Services\OllamaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Chat $chat, OllamaService $ollama): \Illuminate\Http\JsonResponse
    {
        abort_unless($chat->user_id === $request->user()->id, 404);

        // 1. Create User message
        $userMessage = $chat->messages()->create($request->validated());

        // Update chat title if needed
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

        // 2. Fetch full message history to maintain context
        $history = $chat->messages()
            ->oldest('created_at')
            ->get(['role', 'content'])
            ->toArray();

        // 3. Fetch user settings for chosen model
        $userSettings = $request->user()->settings()->firstOrCreate([], [
            'theme' => 'dark',
            'language' => 'en',
            'model' => 'nova-pro',
        ]);

        // 4. Generate AI reply
        $aiContent = $ollama->generateResponse($history, $userSettings->model);

        // 5. Store AI assistant message
        $assistantMessage = $chat->messages()->create([
            'role' => 'assistant',
            'content' => $aiContent,
            'attachments' => null,
        ]);

        return response()->json([
            'data' => [
                'user' => new MessageResource($userMessage),
                'assistant' => new MessageResource($assistantMessage),
            ]
        ], 201);
    }
}
