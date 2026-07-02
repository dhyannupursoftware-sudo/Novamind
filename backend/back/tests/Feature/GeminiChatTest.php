<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GeminiChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_gemini_chat(): void
    {
        $response = $this->postJson('/api/gemini/chat', [
            'message' => 'Hello',
        ]);

        $response->assertUnauthorized();
    }

    public function test_validation_fails_if_message_is_missing(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/gemini/chat', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_authenticated_user_receives_gemini_response(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Hello! This is Gemini response.']
                            ],
                            'role' => 'model'
                        ],
                        'finishReason' => 'STOP',
                        'index' => 0
                    ]
                ]
            ], 200),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/gemini/chat', [
            'message' => 'Hello Gemini',
        ]);

        $response->assertOk()
            ->assertJsonPath('response', 'Hello! This is Gemini response.');
    }

    public function test_gemini_error_handling_fails_gracefully(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'error' => [
                    'code' => 400,
                    'message' => 'API key not valid.',
                    'status' => 'INVALID_ARGUMENT'
                ]
            ], 400),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/gemini/chat', [
            'message' => 'Hello Gemini',
        ]);

        $response->assertStatus(500)
            ->assertJsonPath('error', 'Gemini API Error')
            ->assertJsonFragment(['message' => 'Gemini API authentication failed: API key not valid.']);
    }
}
