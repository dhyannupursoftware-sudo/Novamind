<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_sanctum_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Dhyan Patel',
            'username' => 'dhyan',
            'email' => 'dhyan@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'remember' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'username', 'email', 'avatar', 'settings'],
                'token',
                'token_type',
                'expires_at',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'dhyan',
            'email' => 'dhyan@example.com',
        ]);

        $this->assertDatabaseHas('settings', [
            'theme' => 'dark',
            'language' => 'en',
            'model' => 'nova-pro',
        ]);
    }

    public function test_authenticated_user_can_create_chat_and_message(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '6']
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

        $chatResponse = $this->postJson('/api/chats', [
            'title' => 'Product strategy',
            'pinned' => true,
        ]);

        $chatResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Product strategy')
            ->assertJsonPath('data.pinned', true);

        $messageResponse = $this->postJson("/api/chats/{$chatResponse->json('data.id')}/messages", [
            'role' => 'user',
            'content' => '3+3',
        ]);

        $messageResponse
            ->assertCreated()
            ->assertJsonPath('data.user.role', 'user')
            ->assertJsonPath('data.user.content', '3+3')
            ->assertJsonPath('data.assistant.role', 'assistant')
            ->assertJsonPath('data.assistant.content', '6');

        $this->assertDatabaseHas('messages', [
            'role' => 'assistant',
            'content' => '6',
        ]);
    }

    public function test_authenticated_user_can_persist_theme_preferences(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/settings', [
            'user_bubble_color' => '#245B78',
            'primary_color' => '#22C55E',
            'font_size' => 17,
            'font_family' => 'System',
            'border_radius' => 14,
            'bubble_opacity' => 0.82,
            'ui_preferences' => [
                'autoScroll' => true,
                'showTypingIndicator' => true,
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user_bubble_color', '#245B78')
            ->assertJsonPath('data.primary_color', '#22C55E')
            ->assertJsonPath('data.font_size', 17)
            ->assertJsonPath('data.ui_preferences.autoScroll', true);

        $this->assertDatabaseHas('settings', [
            'user_id' => $user->id,
            'primary_color' => '#22C55E',
            'font_family' => 'System',
        ]);
    }
}
