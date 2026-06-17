<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'content' => 'Draft a launch plan.',
        ]);

        $messageResponse
            ->assertCreated()
            ->assertJsonPath('data.role', 'user')
            ->assertJsonPath('data.content', 'Draft a launch plan.');
    }
}
