<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Chat $chat): MessageResource
    {
        abort_unless($chat->user_id === $request->user()->id, 404);

        $message = $chat->messages()->create($request->validated());

        if ($chat->title === 'New chat' && $message->role === 'user') {
            $title = $message->content 
                ? Str::limit($message->content, 52, '') 
                : (count($message->attachments ?? []) > 0 ? $message->attachments[0]['name'] : 'Uploaded file');
            $chat->update([
                'title' => Str::limit($title, 52, ''),
            ]);
        } else {
            $chat->touch();
        }

        return new MessageResource($message);
    }
}
