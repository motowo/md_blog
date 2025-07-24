<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test getting recent articles ordered by created_at
     */
    public function test_recent_articles_ordered_by_created_at()
    {
        // 異なる作成日時で記事を作成
        $user = User::factory()->create();

        $oldArticle = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'created_at' => Carbon::now()->subDays(5),
        ]);

        $newArticle = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'created_at' => Carbon::now()->subDay(),
        ]);

        $newestArticle = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'created_at' => Carbon::now(),
        ]);

        // 下書き記事（表示されないはず）
        Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'draft',
            'created_at' => Carbon::now()->addDay(),
        ]);

        $response = $this->getJson('/api/articles/recent?limit=10');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'content',
                    'is_paid',
                    'price',
                    'status',
                    'created_at',
                    'updated_at',
                    'user',
                    'tags',
                ],
            ],
        ]);

        $articles = $response->json('data');

        // 作成日時の降順で返されることを確認
        $this->assertEquals($newestArticle->id, $articles[0]['id']);
        $this->assertEquals($newArticle->id, $articles[1]['id']);
        $this->assertEquals($oldArticle->id, $articles[2]['id']);

        // 公開済み記事のみが返されることを確認
        foreach ($articles as $article) {
            $this->assertEquals('published', $article['status']);
        }
    }

    /**
     * Test getting trending articles based on sales
     */
    public function test_trending_articles_by_sales()
    {
        // 既存データをクリア
        Payment::query()->delete();
        Article::query()->delete();

        $user = User::factory()->create();

        // 有料記事を作成
        $article1 = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'is_paid' => true,
            'price' => 1000,
        ]);

        $article2 = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'is_paid' => true,
            'price' => 500,
        ]);

        $article3 = Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'is_paid' => true,
            'price' => 2000,
        ]);

        // 無料記事（表示されないはず）
        Article::factory()->create([
            'user_id' => $user->id,
            'status' => 'published',
            'is_paid' => false,
        ]);

        // 売上データを作成（過去1ヶ月以内）
        $oneWeekAgo = Carbon::now()->subWeek();

        // article1: 売上 3000円（3回購入）
        Payment::factory()->count(3)->create([
            'article_id' => $article1->id,
            'amount' => 1000,
            'status' => 'success',
            'created_at' => $oneWeekAgo,
        ]);

        // article2: 売上 5000円（10回購入）
        Payment::factory()->count(10)->create([
            'article_id' => $article2->id,
            'amount' => 500,
            'status' => 'success',
            'created_at' => $oneWeekAgo,
        ]);

        // article3: 売上 2000円（1回購入）
        Payment::factory()->create([
            'article_id' => $article3->id,
            'amount' => 2000,
            'status' => 'success',
            'created_at' => $oneWeekAgo,
        ]);

        // 古い売上データ（集計対象外）
        Payment::factory()->count(5)->create([
            'article_id' => $article1->id,
            'amount' => 1000,
            'status' => 'success',
            'created_at' => Carbon::now()->subMonths(2),
        ]);

        $response = $this->getJson('/api/articles/trending?limit=10');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'is_paid',
                    'price',
                    'total_sales',
                ],
            ],
        ]);

        $articles = $response->json('data');

        // 売上順で返されることを確認
        $this->assertEquals($article2->id, $articles[0]['id']);
        $this->assertEquals(5000, $articles[0]['total_sales']);

        $this->assertEquals($article1->id, $articles[1]['id']);
        $this->assertEquals(3000, $articles[1]['total_sales']);

        $this->assertEquals($article3->id, $articles[2]['id']);
        $this->assertEquals(2000, $articles[2]['total_sales']);

        // 有料記事のみが返されることを確認
        foreach ($articles as $article) {
            $this->assertTrue($article['is_paid']);
        }
    }

    /**
     * Test limit parameter for recent articles
     */
    public function test_recent_articles_respects_limit()
    {
        $user = User::factory()->create();

        // 15件の記事を作成
        Article::factory()->count(15)->create([
            'user_id' => $user->id,
            'status' => 'published',
        ]);

        // limitなし（デフォルト10件）
        $response = $this->getJson('/api/articles/recent');
        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));

        // limit=5
        $response = $this->getJson('/api/articles/recent?limit=5');
        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));

        // limit=15（最大10件に制限される）
        $response = $this->getJson('/api/articles/recent?limit=15');
        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
    }
}
