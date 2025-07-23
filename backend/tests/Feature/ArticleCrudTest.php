<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\BankAccount;
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
        $article = Article::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'published',
        ]);

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

    public function test_paid_article_requires_bank_account(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/articles', [
            'title' => 'Test Paid Article',
            'content' => 'This is a paid article content.',
            'is_paid' => true,
            'price' => 1000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bank_account']);
    }

    public function test_can_create_paid_article_with_bank_account(): void
    {
        // ユーザーに振込口座を設定
        BankAccount::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);

        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/articles', [
            'title' => 'Test Paid Article',
            'content' => 'This is a paid article content.',
            'is_paid' => true,
            'price' => 1000,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'title' => 'Test Paid Article',
                    'is_paid' => true,
                    'price' => '1000.00',
                ],
            ]);
    }

    public function test_can_update_free_article_to_paid_with_bank_account(): void
    {
        // 振込口座を設定
        BankAccount::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);

        // 無料記事を作成
        $article = Article::factory()->create([
            'user_id' => $this->user->id,
            'is_paid' => false,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->putJson("/api/articles/{$article->id}", [
            'is_paid' => true,
            'price' => 1500,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'is_paid' => true,
            'price' => 1500,
        ]);
    }

    public function test_cannot_update_free_article_to_paid_without_bank_account(): void
    {
        // 無料記事を作成
        $article = Article::factory()->create([
            'user_id' => $this->user->id,
            'is_paid' => false,
        ]);

        Sanctum::actingAs($this->user);

        $response = $this->putJson("/api/articles/{$article->id}", [
            'is_paid' => true,
            'price' => 1500,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bank_account']);
    }
}
