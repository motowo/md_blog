<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // テスト用ユーザーを作成
        $this->user = User::factory()->create();

        // テスト用タグを作成
        $this->tagReact = Tag::factory()->create(['name' => 'React', 'slug' => 'react']);
        $this->tagLaravel = Tag::factory()->create(['name' => 'Laravel', 'slug' => 'laravel']);
        $this->tagPHP = Tag::factory()->create(['name' => 'PHP', 'slug' => 'php']);

        // テスト用記事を作成
        $this->articleReact = Article::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'React開発入門ガイド',
            'content' => 'ReactはModern JavaScriptライブラリです。コンポーネントベースの開発ができます。',
            'status' => 'published',
        ]);
        $this->articleReact->tags()->attach($this->tagReact);

        $this->articleLaravel = Article::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Laravel APIサーバー構築',
            'content' => 'LaravelでRESTful APIを構築する方法を解説します。PHPフレームワークの基本から学びます。',
            'status' => 'published',
        ]);
        $this->articleLaravel->tags()->attach([$this->tagLaravel->id, $this->tagPHP->id]);

        $this->articleDraft = Article::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Vue.js基礎講座',
            'content' => 'Vue.jsはプログレッシブフレームワークです。',
            'status' => 'draft',
        ]);
    }

    /** @test */
    public function can_search_articles_by_title()
    {
        $response = $this->getJson('/api/articles?search=React');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'user', 'tags'],
                ],
                'current_page',
                'last_page',
                'total',
            ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('React開発入門ガイド', $data[0]['title']);
    }

    /** @test */
    public function can_search_articles_by_content()
    {
        $response = $this->getJson('/api/articles?search=RESTful');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Laravel APIサーバー構築', $data[0]['title']);
    }

    /** @test */
    public function can_search_articles_case_insensitive()
    {
        $response = $this->getJson('/api/articles?search=react');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('React開発入門ガイド', $data[0]['title']);
    }

    /** @test */
    public function can_search_with_multiple_tags()
    {
        $response = $this->getJson('/api/articles?tags=Laravel,PHP');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Laravel APIサーバー構築', $data[0]['title']);
    }

    /** @test */
    public function can_combine_search_and_tags()
    {
        $response = $this->getJson('/api/articles?search=Laravel&tags=PHP');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Laravel APIサーバー構築', $data[0]['title']);
    }

    /** @test */
    public function search_returns_empty_when_no_matches()
    {
        $response = $this->getJson('/api/articles?search=NonExistentKeyword');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(0, $data);
        $this->assertEquals(0, $response->json('total'));
    }

    /** @test */
    public function search_ignores_draft_articles()
    {
        $response = $this->getJson('/api/articles?search=Vue');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(0, $data);
    }

    /** @test */
    public function can_search_with_pagination()
    {
        // ユニークな検索キーワードを使用
        $uniqueKeyword = 'UniqueTestKeyword'.time();

        // 追加のテスト記事を作成
        for ($i = 1; $i <= 15; $i++) {
            Article::factory()->create([
                'user_id' => $this->user->id,
                'title' => "{$uniqueKeyword}講座 Part {$i}",
                'content' => "{$uniqueKeyword}の基礎について解説します。Part {$i}です。",
                'status' => 'published',
            ]);
        }

        $response = $this->getJson("/api/articles?search={$uniqueKeyword}&per_page=10");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(10, $data);
        $this->assertEquals(15, $response->json('total'));
        $this->assertEquals(2, $response->json('last_page'));
    }

    /** @test */
    public function search_with_special_characters_is_safe()
    {
        // SQLインジェクション攻撃のテスト
        $response = $this->getJson('/api/articles?search='.urlencode("'; DROP TABLE articles; --"));

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(0, $data);
    }

    /** @test */
    public function empty_search_returns_all_published_articles()
    {
        $response = $this->getJson('/api/articles?search=');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(2, $data); // 公開記事のみ（下書きは除外）
    }
}
