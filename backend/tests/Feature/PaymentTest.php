<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 認証されていないユーザーは記事を購入できない
     */
    public function test_unauthenticated_user_cannot_purchase_article(): void
    {
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4242424242424242',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * 無料記事は購入できない
     */
    public function test_cannot_purchase_free_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => false,
            'price' => null,
            'status' => 'published',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4242424242424242',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['article_id']);
    }

    /**
     * 非公開記事は購入できない
     */
    public function test_cannot_purchase_draft_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'draft',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4242424242424242',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['article_id']);
    }

    /**
     * 既に購入済みの記事は再購入できない
     */
    public function test_cannot_purchase_already_purchased_article(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        // 既に購入済みの決済レコードを作成
        Payment::create([
            'user_id' => $user->id,
            'article_id' => $article->id,
            'amount' => $article->price,
            'status' => 'success',
            'transaction_id' => 'TEST_'.uniqid(),
            'paid_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4242424242424242',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'この記事は既に購入済みです。']);
    }

    /**
     * 正常なカード番号で記事を購入できる
     */
    public function test_can_purchase_article_with_valid_card(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4242424242424242',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'article_id',
                    'amount',
                    'status',
                    'transaction_id',
                    'paid_at',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'article_id' => $article->id,
            'amount' => 1000,
            'status' => 'success',
        ]);
    }

    /**
     * エラーカード番号で決済が失敗する
     */
    public function test_payment_fails_with_error_card(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4000000000000002',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'カードが拒否されました。別のカードをお試しください。',
            ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'article_id' => $article->id,
            'amount' => 1000,
            'status' => 'failed',
        ]);
    }

    /**
     * 残高不足カード番号で決済が失敗する
     */
    public function test_payment_fails_with_insufficient_funds_card(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            'card_number' => '4000000000009995',
            'card_name' => 'Test User',
            'expiry_month' => '12',
            'expiry_year' => '2025',
            'cvv' => '123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'カードの残高が不足しています。',
            ]);
    }

    /**
     * 決済履歴を取得できる
     */
    public function test_can_get_payment_history(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // 自分の決済履歴
        $myPayments = Payment::factory()->count(3)->create([
            'user_id' => $user->id,
            'status' => 'success',
        ]);

        // 他人の決済履歴
        Payment::factory()->count(2)->create([
            'user_id' => $otherUser->id,
            'status' => 'success',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/payments');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'article' => [
                            'id',
                            'title',
                            'price',
                        ],
                        'amount',
                        'status',
                        'transaction_id',
                        'paid_at',
                    ],
                ],
            ]);
    }

    /**
     * バリデーションエラーのテスト
     */
    public function test_payment_validation_errors(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'is_paid' => true,
            'price' => 1000,
            'status' => 'published',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'article_id' => $article->id,
            // カード情報を送信しない
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'card_number',
                'card_name',
                'expiry_month',
                'expiry_year',
                'cvv',
            ]);
    }
}
