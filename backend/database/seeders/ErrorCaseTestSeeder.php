<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\User;
use App\Models\Payment;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ErrorCaseTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("=== エラーケーステストデータ生成開始 ===");

        // 既存ユーザーを取得（authorロールのユーザーも購入者として使用）
        $authors = User::where('role', 'author')->limit(5)->get();
        $users = User::where('role', 'author')->limit(10)->get(); // authorを購入者として使用
        $tags = Tag::limit(5)->get();

        if ($authors->isEmpty() || $users->isEmpty() || $tags->isEmpty()) {
            $this->command->error('基本データが不足しています。先に基本シーダーを実行してください。');
            return;
        }

        // 1. 異常な価格の記事
        $this->createAbnormalPriceArticles($authors->first(), $tags);

        // 2. 異常な日付データ
        $this->createAbnormalDateArticles($authors->get(1), $tags);

        // 3. 決済エラーケース
        $this->createPaymentErrorCases($users, $authors);

        // 4. 極端に長いタイトル・コンテンツ
        $this->createExtremeContentArticles($authors->get(2), $tags);

        // 5. 文字化けテストデータ
        $this->createCharacterEncodingTestData($authors->get(3), $tags);

        // 6. 特殊文字テストデータ
        $this->createSpecialCharacterTestData($authors->get(4), $tags);

        // 7. 境界値テストデータ
        $this->createBoundaryValueTestData($authors, $users);

        $this->command->info("=== エラーケーステストデータ生成完了 ===");
        $this->showErrorCaseStatistics();
    }

    /**
     * 異常な価格の記事を作成
     */
    private function createAbnormalPriceArticles($author, $tags): void
    {
        $this->command->info("異常価格記事を作成中...");

        $abnormalPrices = [
            0,      // 無料だが is_paid = true
            -100,   // 負の価格
            999999, // 極端に高い価格
            1,      // 最低価格
            50,     // 50円（通常より低い）
        ];

        foreach ($abnormalPrices as $price) {
            $article = new Article([
                'title' => "異常価格テスト記事（{$price}円）",
                'content' => "この記事は価格{$price}円のテストデータです。\n\n異常な価格設定のテストに使用されます。",
                'user_id' => $author->id,
                'is_paid' => true,
                'price' => $price,
                'status' => 'published',
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
                'updated_at' => Carbon::now(),
            ]);
            $article->save();
            
            // タグを関連付け
            $article->tags()->attach($tags->random()->id);
        }
    }

    /**
     * 異常な日付の記事を作成
     */
    private function createAbnormalDateArticles($author, $tags): void
    {
        $this->command->info("異常日付記事を作成中...");

        $abnormalDates = [
            Carbon::create(1900, 1, 1),  // 過去すぎる日付
            Carbon::create(2100, 12, 31), // 未来すぎる日付
            Carbon::create(2024, 2, 29),  // うるう年の2月29日
            Carbon::create(2023, 2, 29),  // 存在しない日付（うるう年でない）
        ];

        foreach ($abnormalDates as $index => $date) {
            try {
                $article = new Article([
                    'title' => "異常日付テスト記事 - {$date->format('Y-m-d')}",
                    'content' => "この記事は異常な日付（{$date->format('Y-m-d')}）のテストデータです。",
                    'user_id' => $author->id,
                    'is_paid' => false,
                    'price' => 0,
                    'status' => 'published',
                    'created_at' => $date,
                    'updated_at' => $date->copy()->addHour(),
                ]);
                $article->save();
                
                $article->tags()->attach($tags->random()->id);
            } catch (\Exception $e) {
                $this->command->warn("日付エラー: {$date->format('Y-m-d')} - {$e->getMessage()}");
            }
        }
    }

    /**
     * 決済エラーケースを作成
     */
    private function createPaymentErrorCases($users, $authors): void
    {
        $this->command->info("決済エラーケースを作成中...");

        // テスト用有料記事を作成
        $testArticle = new Article([
            'title' => '決済エラーテスト用記事',
            'content' => 'この記事は決済エラーのテストに使用されます。',
            'user_id' => $authors->first()->id,
            'is_paid' => true,
            'price' => 500,
            'status' => 'published',
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()->subDays(10),
        ]);
        $testArticle->save();

        // 異常な決済データ
        $errorCases = [
            [
                'amount' => 0,
                'commission_amount' => 0,
                'payout_amount' => 0,
                'status' => 'completed',
                'description' => '金額ゼロの決済'
            ],
            [
                'amount' => -500,
                'commission_amount' => -50,
                'payout_amount' => -450,
                'status' => 'completed',
                'description' => '負の金額の決済'
            ],
            [
                'amount' => 500,
                'commission_amount' => 600, // 手数料が金額を超過
                'payout_amount' => -100,
                'status' => 'completed',
                'description' => '手数料超過の決済'
            ],
            [
                'amount' => 500,
                'commission_amount' => 50,
                'payout_amount' => 450,
                'status' => 'failed',
                'description' => '失敗した決済'
            ],
            [
                'amount' => 500,
                'commission_amount' => 50,
                'payout_amount' => 450,
                'status' => 'pending',
                'description' => '保留中の決済'
            ],
        ];

        foreach ($errorCases as $index => $case) {
            try {
                $payment = new Payment([
                    'user_id' => $users->random()->id,
                    'article_id' => $testArticle->id,
                    'amount' => $case['amount'],
                    'commission_amount' => $case['commission_amount'],
                    'payout_amount' => $case['payout_amount'],
                    'status' => $case['status'],
                    'payment_method' => 'credit_card',
                    'transaction_id' => 'error_test_' . ($index + 1),
                    'created_at' => Carbon::now()->subDays(rand(1, 5)),
                    'updated_at' => Carbon::now(),
                ]);
                $payment->save();
                
                $this->command->info("作成: {$case['description']}");
            } catch (\Exception $e) {
                $this->command->warn("決済エラー: {$case['description']} - {$e->getMessage()}");
            }
        }
    }

    /**
     * 極端に長いコンテンツの記事を作成
     */
    private function createExtremeContentArticles($author, $tags): void
    {
        $this->command->info("極端コンテンツ記事を作成中...");

        // 極端に長いタイトル
        $longTitle = str_repeat('非常に長いタイトルのテストデータ', 20);
        
        // 極端に長いコンテンツ
        $longContent = str_repeat("この文章は極端に長いコンテンツのテストデータです。\n", 1000);
        
        // 極端に短いコンテンツ
        $shortContent = "短";

        $extremeCases = [
            [
                'title' => $longTitle,
                'content' => '通常の長さのコンテンツです。',
                'description' => '極端に長いタイトル'
            ],
            [
                'title' => '極端に長いコンテンツのテスト',
                'content' => $longContent,
                'description' => '極端に長いコンテンツ'
            ],
            [
                'title' => '極端に短いコンテンツのテスト',
                'content' => $shortContent,
                'description' => '極端に短いコンテンツ'
            ],
            [
                'title' => '',
                'content' => '空のタイトルのテストです。',
                'description' => '空のタイトル'
            ],
            [
                'title' => '空のコンテンツのテスト',
                'content' => '',
                'description' => '空のコンテンツ'
            ],
        ];

        foreach ($extremeCases as $case) {
            try {
                $article = new Article([
                    'title' => $case['title'],
                    'content' => $case['content'],
                    'user_id' => $author->id,
                    'is_paid' => false,
                    'price' => 0,
                    'status' => 'published',
                    'created_at' => Carbon::now()->subDays(rand(1, 10)),
                    'updated_at' => Carbon::now(),
                ]);
                $article->save();
                
                $article->tags()->attach($tags->random()->id);
                $this->command->info("作成: {$case['description']}");
            } catch (\Exception $e) {
                $this->command->warn("極端コンテンツエラー: {$case['description']} - {$e->getMessage()}");
            }
        }
    }

    /**
     * 文字化けテストデータを作成
     */
    private function createCharacterEncodingTestData($author, $tags): void
    {
        $this->command->info("文字化けテストデータを作成中...");

        $encodingTests = [
            [
                'title' => '🚀 絵文字テスト 🎉 記事タイトル 💻',
                'content' => "絵文字を含むコンテンツのテストです。\n\n🌟 星\n❤️ ハート\n🔥 火\n\n絵文字が正しく表示されるかテストします。",
                'description' => '絵文字テスト'
            ],
            [
                'title' => 'ñoël café résumé naïve',
                'content' => 'Accented characters: café, résumé, naïve, piñata, ñoël',
                'description' => 'アクセント文字テスト'
            ],
            [
                'title' => '中文测试 한국어 テスト العربية',
                'content' => "多言語文字のテストです。\n\n中文: 这是中文测试\n한국어: 한국어 테스트입니다\nالعربية: هذا اختبار عربي",
                'description' => '多言語文字テスト'
            ],
            [
                'title' => '特殊記号テスト ∀∃∈∉∪∩⊂⊃',
                'content' => "数学記号: ∀∃∈∉∪∩⊂⊃⊆⊇∧∨¬\n通貨記号: ¥€\$£¢\n矢印: ←→↑↓⇐⇒⇑⇓",
                'description' => '特殊記号テスト'
            ],
        ];

        foreach ($encodingTests as $test) {
            try {
                $article = new Article([
                    'title' => $test['title'],
                    'content' => $test['content'],
                    'user_id' => $author->id,
                    'is_paid' => false,
                    'price' => 0,
                    'status' => 'published',
                    'created_at' => Carbon::now()->subDays(rand(1, 5)),
                    'updated_at' => Carbon::now(),
                ]);
                $article->save();
                
                $article->tags()->attach($tags->random()->id);
                $this->command->info("作成: {$test['description']}");
            } catch (\Exception $e) {
                $this->command->warn("文字化けテストエラー: {$test['description']} - {$e->getMessage()}");
            }
        }
    }

    /**
     * 特殊文字テストデータを作成
     */
    private function createSpecialCharacterTestData($author, $tags): void
    {
        $this->command->info("特殊文字テストデータを作成中...");

        $specialCharTests = [
            [
                'title' => 'SQLインジェクション\'; DROP TABLE articles; --',
                'content' => "SQLインジェクション攻撃の文字列テストです。\n'; DROP TABLE articles; --\nOR 1=1\nUNION SELECT * FROM users",
                'description' => 'SQLインジェクションテスト'
            ],
            [
                'title' => 'XSSテスト<script>alert("XSS")</script>',
                'content' => "XSS攻撃の文字列テストです。\n<script>alert('XSS')</script>\n<img src=x onerror=alert('XSS')>",
                'description' => 'XSSテスト'
            ],
            [
                'title' => 'HTMLタグテスト<h1>見出し</h1>',
                'content' => "<p>HTMLタグのテストです。</p>\n<strong>太字</strong>\n<em>斜体</em>\n<code>コード</code>",
                'description' => 'HTMLタグテスト'
            ],
            [
                'title' => '改行文字テスト\n\r\n\t',
                'content' => "改行文字とタブ文字のテストです。\n\n改行\r\nWindows改行\t\tタブ",
                'description' => '改行・タブ文字テスト'
            ],
        ];

        foreach ($specialCharTests as $test) {
            try {
                $article = new Article([
                    'title' => $test['title'],
                    'content' => $test['content'],
                    'user_id' => $author->id,
                    'is_paid' => false,
                    'price' => 0,
                    'status' => 'draft', // セキュリティテストなので下書き状態
                    'created_at' => Carbon::now()->subDays(rand(1, 3)),
                    'updated_at' => Carbon::now(),
                ]);
                $article->save();
                
                $article->tags()->attach($tags->random()->id);
                $this->command->info("作成: {$test['description']}");
            } catch (\Exception $e) {
                $this->command->warn("特殊文字テストエラー: {$test['description']} - {$e->getMessage()}");
            }
        }
    }

    /**
     * 境界値テストデータを作成
     */
    private function createBoundaryValueTestData($authors, $users): void
    {
        $this->command->info("境界値テストデータを作成中...");

        // 記事の境界値テスト
        $boundaryPrices = [299, 300, 301, 999, 1000, 1001, 9999, 10000, 10001];
        
        foreach ($boundaryPrices as $price) {
            try {
                $article = new Article([
                    'title' => "境界値テスト記事（{$price}円）",
                    'content' => "価格{$price}円の境界値テストデータです。",
                    'user_id' => $authors->random()->id,
                    'is_paid' => true,
                    'price' => $price,
                    'status' => 'published',
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                    'updated_at' => Carbon::now(),
                ]);
                $article->save();
            } catch (\Exception $e) {
                $this->command->warn("境界値テストエラー（価格{$price}）: {$e->getMessage()}");
            }
        }

        // 決済の境界値テスト（手数料変更日付周辺）
        $boundaryDates = [
            Carbon::create(2023, 12, 31, 23, 59, 59), // 2024年前の最後
            Carbon::create(2024, 1, 1, 0, 0, 0),      // 2024年の最初
            Carbon::create(2024, 12, 31, 23, 59, 59), // 2024年の最後
            Carbon::create(2025, 1, 1, 0, 0, 0),      // 2025年の最初
        ];

        $testArticle = Article::where('is_paid', true)->first();
        if ($testArticle) {
            foreach ($boundaryDates as $date) {
                try {
                    $payment = new Payment([
                        'user_id' => $users->random()->id,
                        'article_id' => $testArticle->id,
                        'amount' => $testArticle->price,
                        'commission_amount' => $this->calculateCommission($testArticle->price, $date),
                        'payout_amount' => $testArticle->price - $this->calculateCommission($testArticle->price, $date),
                        'status' => 'completed',
                        'payment_method' => 'credit_card',
                        'transaction_id' => 'boundary_' . $date->format('YmdHis'),
                        'created_at' => $date,
                        'updated_at' => $date->copy()->addHour(),
                    ]);
                    $payment->save();
                } catch (\Exception $e) {
                    $this->command->warn("境界値決済エラー（{$date->format('Y-m-d H:i:s')}）: {$e->getMessage()}");
                }
            }
        }
    }

    /**
     * 手数料計算（CommissionSettingSeederと同じロジック）
     */
    private function calculateCommission(int $amount, Carbon $date): int
    {
        if ($date->lt(Carbon::create(2024, 1, 1))) {
            $rate = 0.10; // 10%
        } elseif ($date->lt(Carbon::create(2025, 1, 1))) {
            $rate = 0.05; // 5% (2024年)
        } else {
            $rate = 0.10; // 10% (2025年以降)
        }
        
        return (int)($amount * $rate);
    }

    /**
     * エラーケース統計情報表示
     */
    private function showErrorCaseStatistics(): void
    {
        $errorArticles = Article::where('title', 'LIKE', '%テスト%')->count();
        $errorPayments = Payment::where('transaction_id', 'LIKE', '%test%')
                               ->orWhere('transaction_id', 'LIKE', '%error%')
                               ->orWhere('transaction_id', 'LIKE', '%boundary%')
                               ->count();

        $this->command->info('=== エラーケーステストデータ統計 ===');
        $this->command->info("テスト記事数: {$errorArticles}");
        $this->command->info("テスト決済数: {$errorPayments}");
        
        // 特殊文字を含む記事
        $specialCharArticles = Article::where('title', 'LIKE', '%<script%')
                                     ->orWhere('title', 'LIKE', '%DROP TABLE%')
                                     ->orWhere('title', 'LIKE', '%絵文字%')
                                     ->count();
        $this->command->info("特殊文字テスト記事数: {$specialCharArticles}");
    }
}