<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TagManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'author',
        ]);

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);
    }

    public function test_can_get_tags_list(): void
    {
        Tag::factory()->count(5)->create();

        $response = $this->getJson('/api/tags');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    public function test_can_get_single_tag(): void
    {
        $tag = Tag::factory()->create();

        $response = $this->getJson("/api/tags/{$tag->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_authenticated_admin_can_create_tag(): void
    {
        Sanctum::actingAs($this->admin);

        $tagData = [
            'name' => 'Laravel',
            'slug' => 'laravel',
        ];

        $response = $this->postJson('/api/tags', $tagData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('tags', [
            'name' => 'Laravel',
            'slug' => 'laravel',
        ]);
    }

    public function test_regular_user_cannot_create_tag(): void
    {
        Sanctum::actingAs($this->user);

        $tagData = [
            'name' => 'PHP',
            'slug' => 'php',
        ];

        $response = $this->postJson('/api/tags', $tagData);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_create_tag(): void
    {
        $tagData = [
            'name' => 'JavaScript',
            'slug' => 'javascript',
        ];

        $response = $this->postJson('/api/tags', $tagData);

        $response->assertStatus(401);
    }

    public function test_admin_can_update_tag(): void
    {
        Sanctum::actingAs($this->admin);

        $tag = Tag::factory()->create();

        $updateData = [
            'name' => 'Updated Tag',
            'slug' => 'updated-tag',
        ];

        $response = $this->putJson("/api/tags/{$tag->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'Updated Tag',
            'slug' => 'updated-tag',
        ]);
    }

    public function test_regular_user_cannot_update_tag(): void
    {
        Sanctum::actingAs($this->user);

        $tag = Tag::factory()->create();

        $updateData = [
            'name' => 'Updated Tag',
        ];

        $response = $this->putJson("/api/tags/{$tag->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_tag(): void
    {
        Sanctum::actingAs($this->admin);

        $tag = Tag::factory()->create();

        $response = $this->deleteJson("/api/tags/{$tag->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('tags', [
            'id' => $tag->id,
        ]);
    }

    public function test_regular_user_cannot_delete_tag(): void
    {
        Sanctum::actingAs($this->user);

        $tag = Tag::factory()->create();

        $response = $this->deleteJson("/api/tags/{$tag->id}");

        $response->assertStatus(403);
    }

    public function test_can_attach_tags_to_article(): void
    {
        Sanctum::actingAs($this->user);

        $article = Article::factory()->create(['user_id' => $this->user->id]);
        $tags = Tag::factory()->count(3)->create();

        $tagIds = $tags->pluck('id')->toArray();

        $response = $this->postJson("/api/articles/{$article->id}/tags", [
            'tag_ids' => $tagIds,
        ]);

        $response->assertStatus(200);

        foreach ($tagIds as $tagId) {
            $this->assertDatabaseHas('article_tags', [
                'article_id' => $article->id,
                'tag_id' => $tagId,
            ]);
        }
    }

    public function test_can_detach_tags_from_article(): void
    {
        Sanctum::actingAs($this->user);

        $article = Article::factory()->create(['user_id' => $this->user->id]);
        $tags = Tag::factory()->count(3)->create();

        $article->tags()->attach($tags->pluck('id'));

        $tagToDetach = $tags->first();

        $response = $this->deleteJson("/api/articles/{$article->id}/tags/{$tagToDetach->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('article_tags', [
            'article_id' => $article->id,
            'tag_id' => $tagToDetach->id,
        ]);
    }

    public function test_can_filter_articles_by_tag(): void
    {
        $tag = Tag::factory()->create();
        $articles = Article::factory()->count(3)->create();

        // タグを記事に関連付け
        $articles->each(function ($article) use ($tag) {
            $article->tags()->attach($tag);
        });

        // タグに関連付けられていない記事も作成
        Article::factory()->count(2)->create();

        $response = $this->getJson("/api/articles?tag={$tag->slug}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_tag_creation_validation(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/tags', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_tag_name_must_be_unique(): void
    {
        Sanctum::actingAs($this->admin);

        Tag::factory()->create(['name' => 'Existing Tag']);

        $response = $this->postJson('/api/tags', [
            'name' => 'Existing Tag',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_slug_is_auto_generated_if_not_provided(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/tags', [
            'name' => 'Auto Slug Test',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('tags', [
            'name' => 'Auto Slug Test',
            'slug' => 'auto-slug-test',
        ]);
    }
}
