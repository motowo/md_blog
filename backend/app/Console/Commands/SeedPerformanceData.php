<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\AvatarFile;
use App\Models\Payment;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedPerformanceData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:performance 
                            {type : Data type to seed (users|articles|payments|all)}
                            {--batch-size=500 : Number of records per batch}
                            {--users=1000 : Number of users to generate}
                            {--articles=10000 : Number of articles to generate}
                            {--payments=25000 : Number of payments to generate}
                            {--offset=0 : Start from this offset (for resuming)}
                            {--limit= : Limit the number of records to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed performance test data with batch processing support';

    private $japaneseNames = [
        '田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '中村', '小林', '加藤', '吉田',
        '松本', '井上', '木村', '林', '佐々木', '田村', '森田', '藤田', '野口', '石川',
        '大野', '村上', '清水', '長谷川', '青木', '福田', '橋本', '西村', '山本', '岡田',
        '山田', '後藤', '斉藤', '前田', '武田', '中島', '小川', '岩崎', '宮崎', '河野',
        '小野寺', '安田', '森', '近藤', '石井', '三浦', '内田', '原田', '藤井', '竹内',
    ];

    private $japaneseFirstNames = [
        '太郎', '次郎', '三郎', '花子', '美香', '由美', '智子', '裕子', '直子', '恵子',
        '健', '誠', '明', '博', '浩', '聡', '学', '勇', '隆', '正',
        '愛', '恵', '美穂', '真由美', '千春', '久美子', '麻衣', '沙織', '香織', '真理',
        '雄一', '大輔', '拓也', '翔太', '和也', '亮', '慎一', '章', '修', '昭',
        '理恵', '幸子', '純子', '律子', '希', '瞳', '薫', '綾', '舞', '愛美',
    ];
    
    // ローマ字変換用マッピング
    private $romajiLastNames = [
        '田中' => 'tanaka', '佐藤' => 'sato', '鈴木' => 'suzuki', '高橋' => 'takahashi', 
        '伊藤' => 'ito', '渡辺' => 'watanabe', '中村' => 'nakamura', '小林' => 'kobayashi', 
        '加藤' => 'kato', '吉田' => 'yoshida', '松本' => 'matsumoto', '井上' => 'inoue', 
        '木村' => 'kimura', '林' => 'hayashi', '佐々木' => 'sasaki', '田村' => 'tamura', 
        '森田' => 'morita', '藤田' => 'fujita', '野口' => 'noguchi', '石川' => 'ishikawa',
        '大野' => 'ono', '村上' => 'murakami', '清水' => 'shimizu', '長谷川' => 'hasegawa', 
        '青木' => 'aoki', '福田' => 'fukuda', '橋本' => 'hashimoto', '西村' => 'nishimura', 
        '山本' => 'yamamoto', '岡田' => 'okada', '山田' => 'yamada', '後藤' => 'goto', 
        '斉藤' => 'saito', '前田' => 'maeda', '武田' => 'takeda', '中島' => 'nakajima', 
        '小川' => 'ogawa', '岩崎' => 'iwasaki', '宮崎' => 'miyazaki', '河野' => 'kawano',
        '小野寺' => 'onodera', '安田' => 'yasuda', '森' => 'mori', '近藤' => 'kondo', 
        '石井' => 'ishii', '三浦' => 'miura', '内田' => 'uchida', '原田' => 'harada', 
        '藤井' => 'fujii', '竹内' => 'takeuchi',
    ];
    
    private $romajiFirstNames = [
        '太郎' => 'taro', '次郎' => 'jiro', '三郎' => 'saburo', '花子' => 'hanako', 
        '美香' => 'mika', '由美' => 'yumi', '智子' => 'tomoko', '裕子' => 'yuko', 
        '直子' => 'naoko', '恵子' => 'keiko', '健' => 'ken', '誠' => 'makoto', 
        '明' => 'akira', '博' => 'hiroshi', '浩' => 'hiroshi', '聡' => 'satoshi', 
        '学' => 'manabu', '勇' => 'isamu', '隆' => 'takashi', '正' => 'tadashi',
        '愛' => 'ai', '恵' => 'megumi', '美穂' => 'miho', '真由美' => 'mayumi', 
        '千春' => 'chiharu', '久美子' => 'kumiko', '麻衣' => 'mai', '沙織' => 'saori', 
        '香織' => 'kaori', '真理' => 'mari', '雄一' => 'yuichi', '大輔' => 'daisuke', 
        '拓也' => 'takuya', '翔太' => 'shota', '和也' => 'kazuya', '亮' => 'ryo', 
        '慎一' => 'shinichi', '章' => 'akira', '修' => 'osamu', '昭' => 'akira',
        '理恵' => 'rie', '幸子' => 'sachiko', '純子' => 'junko', '律子' => 'ritsuko', 
        '希' => 'nozomi', '瞳' => 'hitomi', '薫' => 'kaoru', '綾' => 'aya', 
        '舞' => 'mai', '愛美' => 'manami',
    ];

    private $specialties = [
        'fullstack', 'frontend', 'backend', 'infrastructure', 'data_science',
        'ai', 'mobile', 'security', 'design', 'database', 'testing', 'blockchain',
        'management', 'documentation', 'education',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->argument('type');
        $batchSize = $this->option('batch-size');
        $offset = $this->option('offset');
        $limit = $this->option('limit');

        $this->info("=== パフォーマンステストデータ生成 ===");
        $this->info("タイプ: {$type}");
        $this->info("バッチサイズ: {$batchSize}");
        $this->info("オフセット: {$offset}");
        if ($limit) {
            $this->info("リミット: {$limit}");
        }

        switch ($type) {
            case 'users':
                $this->seedUsers($batchSize, $offset, $limit);
                break;
            case 'articles':
                $this->seedArticles($batchSize, $offset, $limit);
                break;
            case 'payments':
                $this->seedPayments($batchSize, $offset, $limit);
                break;
            case 'all':
                $this->seedUsers($batchSize, 0, null);
                $this->seedArticles($batchSize, 0, null);
                $this->seedPayments($batchSize, 0, null);
                break;
            default:
                $this->error("無効なタイプです: {$type}");
                return 1;
        }

        $this->showStatistics();
        return 0;
    }

    /**
     * ユーザーデータを生成
     */
    private function seedUsers($batchSize, $offset, $limit)
    {
        $targetCount = $limit ?? $this->option('users');
        $startCount = User::count();
        
        $this->info("ユーザー生成開始: {$targetCount}名 (オフセット: {$offset})");
        
        $users = [];
        $batchCount = 0;
        $totalGenerated = 0;
        
        // プログレスバーの作成
        $bar = $this->output->createProgressBar($targetCount);
        $bar->start();
        
        for ($i = $offset; $i < ($offset + $targetCount); $i++) {
            // 1%の確率で同姓同名を生成
            if ($i < 100 || rand(1, 100) > 1) {
                $lastName = $this->japaneseNames[array_rand($this->japaneseNames)];
                $firstName = $this->japaneseFirstNames[array_rand($this->japaneseFirstNames)];
            } else {
                // 既に生成した名前から選択
                $existingIndex = rand(0, min($i - 1, 99));
                $lastName = $this->japaneseNames[$existingIndex % count($this->japaneseNames)];
                $firstName = $this->japaneseFirstNames[$existingIndex % count($this->japaneseFirstNames)];
            }

            $name = $lastName . ' ' . $firstName;
            
            // ローマ字のユーザー名とメールアドレスを生成
            $romajiLastName = $this->romajiLastNames[$lastName] ?? strtolower($lastName);
            $romajiFirstName = $this->romajiFirstNames[$firstName] ?? strtolower($firstName);
            $username = $romajiLastName . '_' . $romajiFirstName . '_' . str_pad($i, 4, '0', STR_PAD_LEFT);
            $email = $romajiLastName . '.' . $romajiFirstName . '.' . $i . '@example.com';

            $users[] = [
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'password' => bcrypt('password'),
                'role' => rand(1, 10) <= 8 ? 'author' : 'user',
                'profile_public' => rand(1, 10) <= 7,
                'is_active' => true,
                'bio' => "パフォーマンステスト用ユーザー {$i} の自己紹介です。",
                'created_at' => Carbon::now()->subDays(rand(1, 1000)),
                'updated_at' => Carbon::now(),
            ];

            $batchCount++;
            $totalGenerated++;

            // バッチサイズに達したら挿入
            if ($batchCount >= $batchSize) {
                DB::table('users')->insert($users);
                $users = [];
                $batchCount = 0;
                $bar->advance($batchSize);
            }
        }

        // 残りを挿入
        if (!empty($users)) {
            DB::table('users')->insert($users);
            $bar->advance(count($users));
        }

        $bar->finish();
        $this->newLine();
        
        $endCount = User::count();
        $this->info("ユーザー生成完了: " . ($endCount - $startCount) . "名追加 (総数: {$endCount}名)");
        
        // アバターを生成
        $this->generateAvatarsForUsers($offset, $targetCount);
    }

    /**
     * 記事データを生成
     */
    private function seedArticles($batchSize, $offset, $limit)
    {
        $targetCount = $limit ?? $this->option('articles');
        $startCount = Article::count();
        
        $this->info("記事生成開始: {$targetCount}件 (オフセット: {$offset})");
        
        // 著者とタグを取得
        $authors = User::where('role', 'author')->pluck('id')->toArray();
        $tags = Tag::all();
        
        if (empty($authors)) {
            $this->error('著者が見つかりません。先にユーザーを生成してください。');
            return;
        }
        
        if ($tags->isEmpty()) {
            $this->error('タグが見つかりません。先にTagSeederを実行してください。');
            return;
        }

        $articles = [];
        $batchCount = 0;
        $totalGenerated = 0;
        
        // プログレスバーの作成
        $bar = $this->output->createProgressBar($targetCount);
        $bar->start();
        
        for ($i = $offset; $i < ($offset + $targetCount); $i++) {
            $createdAt = Carbon::create(2020, 1, 1)->addDays(rand(0, 2011));
            $isPaid = rand(1, 10) <= 4;
            $specialty = $this->specialties[array_rand($this->specialties)];
            
            $title = $this->generateTitle($specialty, $i);
            $content = $this->generateContent($specialty, rand(1000, 5000));
            
            $articles[] = [
                'user_id' => $authors[array_rand($authors)],
                'title' => $title,
                'content' => $content,
                'status' => rand(1, 10) <= 9 ? 'published' : 'draft',
                'is_paid' => $isPaid,
                'price' => $isPaid ? (rand(3, 50) * 100) : null,
                'preview_content' => $isPaid ? mb_substr($content, 0, 200) . '...' : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            $batchCount++;
            $totalGenerated++;

            // バッチサイズに達したら挿入
            if ($batchCount >= $batchSize) {
                DB::table('articles')->insert($articles);
                $articles = [];
                $batchCount = 0;
                $bar->advance($batchSize);
                
                // メモリ解放
                gc_collect_cycles();
            }
        }

        // 残りを挿入
        if (!empty($articles)) {
            DB::table('articles')->insert($articles);
            $bar->advance(count($articles));
        }

        $bar->finish();
        $this->newLine();
        
        $endCount = Article::count();
        $this->info("記事生成完了: " . ($endCount - $startCount) . "件追加 (総数: {$endCount}件)");
        
        // 記事にタグを付与
        $this->attachTagsToArticles($tags, $offset, $targetCount);
    }

    /**
     * 決済データを生成
     */
    private function seedPayments($batchSize, $offset, $limit)
    {
        $targetCount = $limit ?? $this->option('payments');
        $startCount = Payment::count();
        
        $this->info("決済生成開始: {$targetCount}件 (オフセット: {$offset})");
        
        // 有料記事と読者を取得
        $paidArticles = Article::where('is_paid', true)
            ->where('status', 'published')
            ->select('id', 'price', 'created_at', 'user_id')
            ->get()
            ->toArray();
            
        $readers = User::where('role', 'user')
            ->pluck('id')
            ->toArray();
        
        if (empty($paidArticles)) {
            $this->error('有料記事が見つかりません。');
            return;
        }
        
        if (empty($readers)) {
            $this->error('読者ユーザーが見つかりません。');
            return;
        }

        $payments = [];
        $batchCount = 0;
        $totalGenerated = 0;
        
        // プログレスバーの作成
        $bar = $this->output->createProgressBar($targetCount);
        $bar->start();
        
        $startDate = Carbon::create(2020, 1, 1);
        $endDate = Carbon::create(2025, 7, 31);
        $monthsRange = $startDate->diffInMonths($endDate);
        
        for ($i = $offset; $i < ($offset + $targetCount); $i++) {
            $article = $paidArticles[array_rand($paidArticles)];
            $readerId = $readers[array_rand($readers)];
            
            // 記事の著者自身は購入しない
            if ($readerId == $article['user_id']) {
                continue;
            }
            
            // 各月に満遍なく分散
            $monthOffset = (int)(($i / $targetCount) * $monthsRange);
            $paymentDate = $startDate->copy()->addMonths($monthOffset)->addDays(rand(1, 28));
            
            // 記事作成日以降の購入のみ
            if ($paymentDate->lt(Carbon::parse($article['created_at']))) {
                $paymentDate = Carbon::parse($article['created_at'])->addDays(rand(1, 30));
            }
            
            // 手数料計算
            $commission = $article['price'] * 0.1;
            
            // 2025年6月以前は振込完了
            $isPayoutCompleted = $paymentDate->lt(Carbon::create(2025, 6, 1));
            $payoutDate = $isPayoutCompleted ? 
                $paymentDate->copy()->addDays(rand(7, 30)) : null;
            
            $payments[] = [
                'user_id' => $readerId,
                'article_id' => $article['id'],
                'amount' => $article['price'],
                'commission_amount' => $commission,
                'payout_amount' => $article['price'] - $commission,
                'status' => 'completed',
                'payment_method' => rand(1, 2) === 1 ? 'credit_card' : 'bank_transfer',
                'transaction_id' => 'perf_txn_' . uniqid() . '_' . $i,
                'paid_at' => $paymentDate,
                'created_at' => $paymentDate,
                'updated_at' => $paymentDate,
                'payout_completed_at' => $payoutDate,
            ];

            $batchCount++;
            $totalGenerated++;

            // バッチサイズに達したら挿入
            if ($batchCount >= $batchSize) {
                DB::table('payments')->insert($payments);
                $payments = [];
                $batchCount = 0;
                $bar->advance($batchSize);
                
                // メモリ解放
                gc_collect_cycles();
            }
        }

        // 残りを挿入
        if (!empty($payments)) {
            DB::table('payments')->insert($payments);
            $bar->advance(count($payments));
        }

        $bar->finish();
        $this->newLine();
        
        $endCount = Payment::count();
        $this->info("決済生成完了: " . ($endCount - $startCount) . "件追加 (総数: {$endCount}件)");
    }

    /**
     * タイトル生成
     */
    private function generateTitle($specialty, $index)
    {
        $templates = [
            'ai' => [
                '【2025年最新】AIエンジニアが教える機械学習入門 第%d回',
                'ChatGPTを活用した業務効率化の実践例 その%d',
                'ディープラーニングの基礎から応用まで Part%d',
                'AI倫理とビジネス活用を考える #%d',
                '生成AIがもたらす未来の開発体験 Episode%d',
            ],
            'frontend' => [
                'React Hooks完全ガイド Chapter%d',
                'Next.js 14で作るモダンWebアプリ 第%d弾',
                'TypeScriptの型システムを極める Level%d',
                'フロントエンドパフォーマンス最適化 Tips#%d',
                'CSS Grid/Flexbox実践テクニック Vol.%d',
            ],
            'backend' => [
                'マイクロサービス設計の実践 第%d章',
                'GraphQL APIの設計と実装 Part%d',
                'サーバーレスアーキテクチャ入門 Step%d',
                'データベース最適化の極意 Lesson%d',
                'セキュアなAPI開発の鉄則 Rule#%d',
            ],
            'default' => [
                'プログラミング学習の効率的な方法 第%d回',
                'エンジニアのキャリア戦略 Chapter%d',
                'チーム開発を成功に導く方法論 Part%d',
                'コードレビューの best practice #%d',
                'テスト駆動開発の実践 Step%d',
            ],
        ];

        $specialtyTemplates = $templates[$specialty] ?? $templates['default'];
        $template = $specialtyTemplates[array_rand($specialtyTemplates)];
        
        return sprintf($template, $index);
    }

    /**
     * コンテンツ生成
     */
    private function generateContent($specialty, $length)
    {
        $intro = "この記事では、{$specialty}分野における重要なトピックについて詳しく解説します。\n\n";
        
        $sections = [
            "## はじめに\n\n現代のソフトウェア開発において、{$specialty}の知識は欠かせません。",
            "## 基本概念\n\n### 重要な用語\n\n- **概念1**: 基本的な説明\n- **概念2**: 詳細な説明\n- **概念3**: 実践的な説明",
            "## 実装例\n\n```javascript\n// サンプルコード\nfunction example() {\n  return 'Hello, World!';\n}\n```",
            "## ベストプラクティス\n\n1. 常に最新の情報をキャッチアップする\n2. 実践を通じて学ぶ\n3. コミュニティに参加する",
            "## まとめ\n\n今回は{$specialty}について解説しました。継続的な学習が重要です。"
        ];
        
        $content = $intro;
        $currentLength = mb_strlen($content);
        
        while ($currentLength < $length && !empty($sections)) {
            $section = array_shift($sections);
            $content .= "\n\n" . $section;
            $currentLength = mb_strlen($content);
            
            // パディング
            if ($currentLength < $length && empty($sections)) {
                $padding = "\n\n詳細な説明を続けます。" . str_repeat("テクニカルな内容の説明。", 50);
                $content .= mb_substr($padding, 0, $length - $currentLength);
            }
        }
        
        // 改行を含むコンテンツ
        $content = str_replace("。", "。\n", $content);
        
        return $content;
    }

    /**
     * 記事にタグを付与
     */
    private function attachTagsToArticles($tags, $offset, $limit)
    {
        $this->info("タグ付与開始...");
        
        $articles = Article::orderBy('id', 'desc')
            ->skip($offset)
            ->take($limit)
            ->pluck('id');
        
        $tagIds = $tags->pluck('id')->toArray();
        $articleTags = [];
        
        foreach ($articles as $articleId) {
            $numTags = rand(1, 3);
            $selectedTags = array_rand(array_flip($tagIds), $numTags);
            
            if (!is_array($selectedTags)) {
                $selectedTags = [$selectedTags];
            }
            
            foreach ($selectedTags as $tagId) {
                $articleTags[] = [
                    'article_id' => $articleId,
                    'tag_id' => $tagId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            // バッチで挿入
            if (count($articleTags) >= 1000) {
                DB::table('article_tags')->insertOrIgnore($articleTags);
                $articleTags = [];
            }
        }
        
        // 残りを挿入
        if (!empty($articleTags)) {
            DB::table('article_tags')->insertOrIgnore($articleTags);
        }
        
        $this->info("タグ付与完了");
    }

    /**
     * 統計情報を表示
     */
    private function showStatistics()
    {
        $this->newLine();
        $this->info('=== データベース統計 ===');
        $this->info('ユーザー数: ' . User::count());
        $this->info('記事数: ' . Article::count());
        $this->info('有料記事: ' . Article::where('is_paid', true)->count());
        $this->info('無料記事: ' . Article::where('is_paid', false)->count());
        $this->info('決済数: ' . Payment::count());
        $this->info('総売上: ¥' . number_format(Payment::where('status', 'completed')->sum('amount')));
    }
    
    /**
     * ユーザーにアバターを生成
     */
    private function generateAvatarsForUsers($offset, $limit)
    {
        $this->info("アバター生成開始...");
        
        // 対象ユーザーを取得
        $users = User::orderBy('id', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();
            
        $avatarColors = [
            ['bg' => '#FF6B6B', 'text' => '#FFFFFF'],
            ['bg' => '#4ECDC4', 'text' => '#FFFFFF'],
            ['bg' => '#45B7D1', 'text' => '#FFFFFF'],
            ['bg' => '#96CEB4', 'text' => '#2C3E50'],
            ['bg' => '#FECA57', 'text' => '#2C3E50'],
            ['bg' => '#DDA0DD', 'text' => '#2C3E50'],
            ['bg' => '#F8B500', 'text' => '#2C3E50'],
            ['bg' => '#6C5CE7', 'text' => '#FFFFFF'],
            ['bg' => '#A29BFE', 'text' => '#FFFFFF'],
            ['bg' => '#FD79A8', 'text' => '#FFFFFF'],
        ];
        
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();
        
        foreach ($users as $user) {
            // ランダムな色を選択
            $color = $avatarColors[array_rand($avatarColors)];
            
            // イニシャルを生成（名前の最初の文字）
            $names = explode(' ', $user->name);
            $initial = mb_substr($names[0], 0, 1);
            
            // SVGアバターを生成
            $svg = $this->generateSvgAvatar($initial, $color['bg'], $color['text']);
            
            // BASE64エンコード
            $base64Data = 'data:image/svg+xml;base64,' . base64_encode($svg);
            
            // アバターファイルを作成
            $avatarFile = AvatarFile::create([
                'user_id' => $user->id,
                'original_filename' => 'avatar_' . $user->username . '.svg',
                'mime_type' => 'image/svg+xml',
                'file_size' => strlen($svg),
                'width' => 256,
                'height' => 256,
                'base64_data' => $base64Data,
                'is_active' => true,
                'created_at' => $user->created_at,
                'updated_at' => now(),
            ]);
            
            // ユーザーのavatar_pathを更新
            $user->update(['avatar_path' => 'avatar_file_' . $avatarFile->id]);
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("アバター生成完了: " . $users->count() . "件");
    }
    
    /**
     * SVGアバターを生成
     */
    private function generateSvgAvatar($initial, $bgColor, $textColor)
    {
        return <<<SVG
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="{$bgColor}"/>
    <text x="128" y="128" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
          text-anchor="middle" dominant-baseline="central" fill="{$textColor}">
        {$initial}
    </text>
</svg>
SVG;
    }
}