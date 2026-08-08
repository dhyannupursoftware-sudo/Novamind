<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
echo "User: " . $user->id . " (" . $user->email . ")\n";

$chat = $user->chats()->first();
if (!$chat) {
    $chat = $user->chats()->create([
        'title' => 'Test Chat',
        'pinned' => false,
    ]);
}
echo "Chat: " . $chat->id . " (" . $chat->title . ")\n";

// Generate a personal access token for Sanctum
$token = $user->createToken('test-token')->plainTextToken;

$req = Illuminate\Http\Request::create(
    "/api/chats/{$chat->id}/messages",
    'POST',
    [],
    [],
    [],
    [
        'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        'HTTP_ACCEPT' => 'application/json',
        'CONTENT_TYPE' => 'application/json',
    ],
    json_encode([
        'role' => 'user',
        'content' => 'Hello Gemini! What is 2 + 2 in 1 word?',
    ])
);

$response = $kernel->handle($req);
echo "HTTP STATUS: " . $response->getStatusCode() . "\n";
echo "HTTP HEADERS: " . json_encode($response->headers->all()) . "\n";
echo "RESPONSE BODY: " . $response->getContent() . "\n";
$kernel->terminate($req, $response);
