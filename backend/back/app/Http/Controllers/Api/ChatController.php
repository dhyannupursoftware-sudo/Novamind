<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\StoreChatRequest;
use App\Http\Requests\Chat\UpdateChatRequest;
use App\Http\Resources\ChatResource;
use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChatController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);

        $query = $request->user()
            ->chats()
            ->withCount('messages');

        if ($request->has('search') && $request->filled('search')) {
            $query->where('title', 'like', '%' . $request->query('search') . '%');
        }

        if ($request->boolean('saved')) {
            $query->where('saved', true);
        }

        if ($request->query('sort_by') === 'name') {
            $query->orderByDesc('pinned')->orderBy('title', 'asc');
        } else {
            $query->orderByDesc('pinned')->orderByDesc('updated_at');
        }

        $chats = $query->paginate($perPage);

        return ChatResource::collection($chats);
    }

    public function store(StoreChatRequest $request): ChatResource
    {
        $data = $request->validated();

        $chat = $request->user()->chats()->create([
            'title' => $data['title'] ?? 'New chat',
            'pinned' => (bool) ($data['pinned'] ?? false),
        ]);

        return new ChatResource($chat->loadCount('messages'));
    }

    public function show(Request $request, Chat $chat): ChatResource
    {
        $this->ensureOwnership($request, $chat);

        return new ChatResource(
            $chat->load([
                'messages' => fn ($query) => $query->oldest('created_at'),
            ])->loadCount('messages'),
        );
    }

    public function update(UpdateChatRequest $request, Chat $chat): ChatResource
    {
        $this->ensureOwnership($request, $chat);

        $chat->update($request->validated());

        return new ChatResource($chat->fresh()->loadCount('messages'));
    }

    public function destroy(Request $request, Chat $chat): JsonResponse
    {
        $this->ensureOwnership($request, $chat);

        $chat->delete();

        return response()->json(status: 204);
    }

    private function ensureOwnership(Request $request, Chat $chat): void
    {
        abort_unless($chat->user_id === $request->user()->id, 404);
    }
}
