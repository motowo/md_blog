<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArticleCrudTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'author',
        ]);
    }

    public function test_authenticated_user_can_create_article(): void
    {
        Sanctum::actingAs($this->user);

        $articleData = [
            'title' => 'Test Article',
            'content' => 'This is test content.',
            'status' => 'draft',
            'is_paid' => false,
        ];

        $response = $this->postJson('/api/articles', $articleData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'content',
                    'status',
                    'is_paid',
                    'user_id',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('articles', [
            'title' => 'Test Article',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_article(): void
    {
        $articleData = [
            'title' => 'Test Article',
            'content' => 'This is test content.',
        ];

        $response = $this->postJson('/api/articles', $articleData);

        $response->assertStatus(401);
    }

    public function test_can_get_articles_list(): void
    {
        Article::factory()->count(5)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/articles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'content',
                        'status',
                        'user_id',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    public function test_can_get_single_article(): void
    {
        $article = Article::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson("/api/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'content',
                    'status',
                    'user_id',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_authenticated_user_can_update_own_article(): void
    {
        Sanctum::actingAs($this->user);

        $article = Article::factory()->create(['user_id' => $this->user->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content.',
            'status' => 'published',
        ];

        $response = $this->putJson("/api/articles/{$article->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => 'Updated Title',
            'status' => 'published',
        ]);
    }

    public function test_user_cannot_update_another_users_article(): void
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create();
        $article = Article::factory()->create(['user_id' => $otherUser->id]);

        $updateData = [
            'title' => 'Updated Title',
        ];

        $response = $this->putJson("/api/articles/{$article->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_delete_own_article(): void
    {
        Sanctum::actingAs($this->user);

        $article = Article::factory()->create(['user_id' => $this->user->id]);

        $response = $this->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('articles', [
            'id' => $article->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_article(): void
    {
        Sanctum::actingAs($this->user);

        $otherUser = User::factory()->create();
        $article = Article::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(403);
    }

    public function test_article_creation_validation(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/articles', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content']);
    }
}
