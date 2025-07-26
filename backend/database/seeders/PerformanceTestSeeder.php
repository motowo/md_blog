<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PerformanceTestSeeder extends Seeder
{
    // 環境変数で制御可能な設定
    private const DEFAULT_USERS = 1000;
    private const DEFAULT_ARTICLES = 10000;
    private const DEFAULT_PAYMENTS = 25000;
    
    private $japaneseNames = [
        '田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '中村', '小林', '加藤', '吉田',
        '松本', '井上', '木村', '林', '佐々木', '田村', '森田', '藤田', '野口', '石川',
        '大野', '村上', '清水', '長谷川', '青木', '福田', '橋本', '西村', '山本', '岡田',
        '山田', '後藤', '斉藤', '前田', '武田', '中島', '小川', '岩崎', '宮崎', '河野',
        '小野寺', '安田', '森', '近藤', '石井', '三浦', '内田', '原田', '藤井', '竹内'
    ];
    
    private $japaneseFirstNames = [
        '太郎', '次郎', '三郎', '花子', '美香', '由美', '智子', '裕子', '直子', '恵子',
        '健', '誠', '明', '博', '浩', '聡', '学', '勇', '隆', '正',
        '愛', '恵', '美穂', '真由美', '千春', '久美子', '麻衣', '沙織', '香織', '真理',
        '雄一', '大輔', '拓也', '翔太', '和也', '亮', '慎一', '章', '修', '昭',
        '理恵', '幸子', '純子', '律子', '希', '瞳', '薫', '綾', '舞', '愛美'
    ];
    
    private $specialties = [
        'fullstack', 'frontend', 'backend', 'infrastructure', 'data_science',
        'ai', 'mobile', 'security', 'design', 'database', 'testing', 'blockchain',
        'management', 'documentation', 'education'
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userCount = (int) env('PERF_TEST_USERS', self::DEFAULT_USERS);
        $articleCount = (int) env('PERF_TEST_ARTICLES', self::DEFAULT_ARTICLES);
        $paymentCount = (int) env('PERF_TEST_PAYMENTS', self::DEFAULT_PAYMENTS);

        $this->command->info("=== パフォーマンステストデータ生成開始 ===");
        $this->command->info("予定ユーザー数: {$userCount}");
        $this->command->info("予定記事数: {$articleCount}");
        $this->command->info("予定決済数: {$paymentCount}");

        // タグを取得
        $tags = Tag::all();
        if ($tags->isEmpty()) {
            $this->command->error('タグが見つかりません。先にTagSeederを実行してください。');
            return;
        }

        // 大規模データ生成
        $users = $this->generateUsers($userCount);
        $articles = $this->generateArticles($articleCount, $users, $tags);
        $this->generatePayments($paymentCount, $articles);

        $this->command->info("=== パフォーマンステストデータ生成完了 ===");
        $this->showStatistics();
    }

    /**
     * 大量ユーザー生成（全員日本人、1%で同姓同名）
     */
    private function generateUsers(int $userCount): array
    {
        $this->command->info("ユーザー生成開始: {$userCount}名");
        
        $users = [];
        $nameUsageCount = [];
        
        for ($i = 0; $i < $userCount; $i++) {
            $lastName = $this->japaneseNames[array_rand($this->japaneseNames)];
            $firstName = $this->japaneseFirstNames[array_rand($this->japaneseFirstNames)];
            $fullName = $lastName . ' ' . $firstName;
            
            // 1%で同姓同名を配置
            if (isset($nameUsageCount[$fullName]) || (rand(1, 100) === 1 && !empty($nameUsageCount))) {
                // 既存の名前から選択、または1%の確率で同姓同名
                if (rand(1, 2) === 1 && !empty($nameUsageCount)) {
                    $fullName = array_rand($nameUsageCount);
                }
                $nameUsageCount[$fullName] = ($nameUsageCount[$fullName] ?? 0) + 1;
            } else {
                $nameUsageCount[$fullName] = 1;
            }
            
            // ユニークなメールアドレス生成
            $emailBase = strtolower(str_replace(' ', '', $fullName));
            $emailBase = $this->convertToRomaji($emailBase);
            $email = $emailBase . '_' . ($i + 1) . '@example.com';
            
            $users[] = [
                'name' => $fullName,
                'email' => $email,
                'email_verified_at' => Carbon::now(),
                'password' => bcrypt('password'),
                'role' => 'author',
                'created_at' => Carbon::now()->subDays(rand(0, 365)),
                'updated_at' => Carbon::now(),
            ];
            
            // バッチで挿入（1000件ごと）
            if (count($users) >= 1000) {
                DB::table('users')->insert($users);
                $users = [];
                $this->command->info("ユーザー {$i} 名まで処理完了...");
            }
        }
        
        // 残りを挿入
        if (!empty($users)) {
            DB::table('users')->insert($users);
        }
        
        $this->command->info("ユーザー生成完了: " . User::count() . " 名");
        
        return User::where('role', 'author')
                  ->orderBy('id', 'desc')
                  ->limit($userCount)
                  ->get()
                  ->toArray();
    }

    /**
     * 大量記事生成（2020年1月1日～2025年7月31日、AI分野追加、1000-5000文字）
     */
    private function generateArticles(int $articleCount, array $users, \Illuminate\Database\Eloquent\Collection $tags): array
    {
        $this->command->info("記事生成開始: {$articleCount}件");
        
        $articles = [];
        $startDate = Carbon::create(2020, 1, 1);
        $endDate = Carbon::create(2025, 7, 31);
        $totalDays = $startDate->diffInDays($endDate);
        
        // 現在のデータから有料記事の割合を算出
        $existingTotal = Article::count();
        $existingPaid = Article::where('is_paid', true)->count();
        $paidRatio = $existingTotal > 0 ? $existingPaid / $existingTotal : 0.5;
        
        for ($i = 0; $i < $articleCount; $i++) {
            $user = $users[array_rand($users)];
            $specialty = $this->specialties[array_rand($this->specialties)];
            
            // 日付を均等分散
            $dayOffset = (int)(($i / $articleCount) * $totalDays);
            $articleDate = $startDate->copy()->addDays($dayOffset);
            
            // 自然な文体で1000-5000文字のコンテンツ生成
            $content = $this->generateArticleContent($specialty, rand(1000, 5000));
            
            $isPaid = rand(1, 100) <= ($paidRatio * 100);
            $price = $isPaid ? $this->calculatePrice($articleDate) : 0;
            
            $articles[] = [
                'title' => $this->generateTitle($specialty, $i),
                'content' => $content,
                'user_id' => $user['id'],
                'is_paid' => $isPaid,
                'price' => $price,
                'status' => rand(1, 10) === 1 ? 'draft' : 'published',
                'created_at' => $articleDate,
                'updated_at' => $articleDate->copy()->addHours(rand(1, 48)),
            ];
            
            // バッチで挿入（500件ごと）
            if (count($articles) >= 500) {
                DB::table('articles')->insert($articles);
                $articles = [];
                $this->command->info("記事 {$i} 件まで処理完了...");
            }
        }
        
        // 残りを挿入
        if (!empty($articles)) {
            DB::table('articles')->insert($articles);
        }
        
        $this->command->info("記事生成完了: " . Article::count() . " 件");
        
        return Article::orderBy('id', 'desc')
                     ->limit($articleCount)
                     ->get()
                     ->toArray();
    }

    /**
     * 決済データ生成（各月満遍なく、2025年6月以前の振込完了）
     */
    private function generatePayments(int $paymentCount, array $articles): void
    {
        $this->command->info("決済生成開始: {$paymentCount}件");
        
        $paidArticles = array_filter($articles, function($article) {
            return $article['is_paid'];
        });
        
        if (empty($paidArticles)) {
            $this->command->warn('有料記事がないため決済データを生成できません。');
            return;
        }
        
        $users = User::where('role', 'user')->get()->toArray();
        if (empty($users)) {
            $this->command->warn('読者ユーザーがないため決済データを生成できません。');
            return;
        }
        
        $payments = [];
        $startDate = Carbon::create(2020, 1, 1);
        $endDate = Carbon::create(2025, 7, 31);
        
        for ($i = 0; $i < $paymentCount; $i++) {
            $article = $paidArticles[array_rand($paidArticles)];
            $user = $users[array_rand($users)];
            
            // 各月に満遍なく分散
            $monthsRange = $startDate->diffInMonths($endDate);
            $monthOffset = (int)(($i / $paymentCount) * $monthsRange);
            $paymentDate = $startDate->copy()->addMonths($monthOffset)->addDays(rand(1, 28));
            
            // 記事作成日以降の購入のみ
            if ($paymentDate->lt(Carbon::parse($article['created_at']))) {
                $paymentDate = Carbon::parse($article['created_at'])->addDays(rand(1, 30));
            }
            
            // 手数料計算（時期に応じて）
            $commission = $this->calculateCommission($article['price'], $paymentDate);
            
            // 2025年6月以前は振込完了
            $isPayoutCompleted = $paymentDate->lt(Carbon::create(2025, 6, 1));
            $payoutDate = $isPayoutCompleted ? 
                $paymentDate->copy()->addDays(rand(7, 30)) : null;
            
            $payments[] = [
                'user_id' => $user['id'],
                'article_id' => $article['id'],
                'amount' => $article['price'],
                'commission_amount' => $commission,
                'payout_amount' => $article['price'] - $commission,
                'status' => 'completed',
                'payment_method' => rand(1, 2) === 1 ? 'credit_card' : 'bank_transfer',
                'transaction_id' => 'txn_' . uniqid() . '_' . $i,
                'created_at' => $paymentDate,
                'updated_at' => $paymentDate,
                'payout_completed_at' => $payoutDate,
            ];
            
            // バッチで挿入（1000件ごと）
            if (count($payments) >= 1000) {
                DB::table('payments')->insert($payments);
                $payments = [];
                $this->command->info("決済 {$i} 件まで処理完了...");
            }
        }
        
        // 残りを挿入
        if (!empty($payments)) {
            DB::table('payments')->insert($payments);
        }
        
        $this->command->info("決済生成完了: " . Payment::count() . " 件");
    }

    /**
     * 自然な文体の記事コンテンツ生成（1000-5000文字）
     */
    private function generateArticleContent(string $specialty, int $targetLength): string
    {
        $templates = [
            'ai' => [
                'intro' => 'AI技術の進歩は、私たちの生活やビジネスに革命的な変化をもたらしています。',
                'sections' => [
                    '## AI技術の基礎\n\n人工知能（AI）は、機械学習やディープラーニングなどの技術を組み合わせて、人間のような知能的な処理を実現する技術です。',
                    '## 実装方法\n\n```python\nimport tensorflow as tf\nfrom sklearn.model_selection import train_test_split\n\n# データの準備\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n```',
                    '## ビジネス活用\n\nAI技術をビジネスに活用することで、業務効率の向上や新しいサービスの創出が可能になります。',
                ]
            ],
            'frontend' => [
                'intro' => 'モダンフロントエンド開発において、ユーザー体験の向上は最重要課題の一つです。',
                'sections' => [
                    '## React Hooksの活用\n\n```jsx\nimport { useState, useEffect } from "react";\n\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  return <div>{user?.name}</div>;\n}\n```',
                    '## パフォーマンス最適化\n\nWebアプリケーションの表示速度は、ユーザーエンゲージメントに直結する重要な要素です。',
                ]
            ],
            // 他の専門分野のテンプレートも追加
        ];
        
        $template = $templates[$specialty] ?? $templates['ai'];
        $content = $template['intro'] . "\n\n";
        
        // 目標文字数に達するまでセクションを追加
        while (mb_strlen($content) < $targetLength) {
            $section = $template['sections'][array_rand($template['sections'])];
            $content .= $section . "\n\n";
            
            // 追加のパラグラフでボリューム調整
            if (mb_strlen($content) < $targetLength - 200) {
                $content .= $this->generateExtraParagraph($specialty) . "\n\n";
            }
        }
        
        // 文字数が多すぎる場合は調整
        if (mb_strlen($content) > $targetLength + 100) {
            $content = mb_substr($content, 0, $targetLength - 50) . "...";
        }
        
        return $content;
    }

    /**
     * 追加パラグラフ生成
     */
    private function generateExtraParagraph(string $specialty): string
    {
        $paragraphs = [
            "このように、{$specialty}分野では継続的な学習と実践が重要です。最新の技術動向を把握し、実際のプロジェクトで活用することで、より高い価値を提供できるようになります。",
            "実際の開発現場では、理論だけでなく実践的な知識が求められます。{$specialty}の専門知識を深めることで、チーム全体の生産性向上に貢献できるでしょう。",
            "今後の技術発展を考えると、{$specialty}分野の重要性はますます高まっていくと予想されます。常に新しい知識を吸収し、実践に活かしていくことが成功の鍵となります。"
        ];
        
        return $paragraphs[array_rand($paragraphs)];
    }

    /**
     * タイトル生成
     */
    private function generateTitle(string $specialty, int $index): string
    {
        $titles = [
            'ai' => [
                'AIによる業務自動化の実践ガイド',
                '機械学習アルゴリズムの選び方と実装',
                'ディープラーニングの基礎から応用まで',
                'AI開発における倫理的配慮とは',
                '自然言語処理の最新動向と活用法'
            ],
            'fullstack' => [
                'フルスタック開発者が知るべき技術スタック',
                'React + Node.jsによるモダンWeb開発',
                'TypeScriptで始める型安全な開発'
            ],
            // 他の専門分野も追加
        ];
        
        $specialtyTitles = $titles[$specialty] ?? $titles['ai'];
        $baseTitle = $specialtyTitles[$index % count($specialtyTitles)];
        
        $prefixes = ['【2024年最新】', '【実践編】', '【完全ガイド】', '【入門から応用】', '【現場で使える】'];
        $prefix = $prefixes[$index % count($prefixes)];
        
        return $prefix . $baseTitle;
    }

    /**
     * 時期に応じた価格計算
     */
    private function calculatePrice(Carbon $date): int
    {
        $basePrices = [300, 500, 800, 1000, 1200, 1500];
        $basePrice = $basePrices[array_rand($basePrices)];
        
        // 2024年は若干安めの価格設定
        if ($date->year === 2024) {
            $basePrice = (int)($basePrice * 0.9);
        }
        
        return $basePrice;
    }

    /**
     * 手数料計算（時期に応じた変化テスト用）
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
     * 日本語名前をローマ字に変換（簡易版）
     */
    private function convertToRomaji(string $japanese): string
    {
        $conversion = [
            '田中' => 'tanaka', '佐藤' => 'sato', '鈴木' => 'suzuki', '高橋' => 'takahashi',
            '伊藤' => 'ito', '渡辺' => 'watanabe', '中村' => 'nakamura', '小林' => 'kobayashi',
            '太郎' => 'taro', '花子' => 'hanako', '美香' => 'mika', '由美' => 'yumi',
            // 必要に応じて追加
        ];
        
        $result = $japanese;
        foreach ($conversion as $jp => $romaji) {
            $result = str_replace($jp, $romaji, $result);
        }
        
        return $result;
    }

    /**
     * 統計情報表示
     */
    private function showStatistics(): void
    {
        $totalUsers = User::count();
        $totalArticles = Article::count();
        $totalPayments = Payment::count();
        
        $this->command->info('=== パフォーマンステストデータ統計 ===');
        $this->command->info("総ユーザー数: {$totalUsers}");
        $this->command->info("総記事数: {$totalArticles}");
        $this->command->info("総決済数: {$totalPayments}");
        
        // 手数料変化境界テスト用データ確認
        $payments2023 = Payment::whereBetween('created_at', ['2023-12-01', '2024-01-31'])->count();
        $payments2024 = Payment::whereBetween('created_at', ['2024-12-01', '2025-01-31'])->count();
        
        $this->command->info('=== 手数料変化境界テストデータ ===');
        $this->command->info("2023年末-2024年初: {$payments2023}件");
        $this->command->info("2024年末-2025年初: {$payments2024}件");
    }
}