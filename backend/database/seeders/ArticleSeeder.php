<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    private const MARKDOWN_COMPREHENSIVE_ARTICLE_TITLE = 'Markdown完全ガイド：見出しからコードブロックまで【実践編】';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'author')->get();
        $tags = Tag::all();

        if ($users->isEmpty()) {
            $this->command->error('一般ユーザーが見つかりません。先にUserSeederを実行してください。');

            return;
        }

        if ($tags->isEmpty()) {
            $this->command->error('タグが見つかりません。先にTagSeederを実行してください。');

            return;
        }

        // ユーザー別投稿パターン設定
        $userPatterns = $this->getUserPatterns($users);

        // 記事作成実行
        $this->createArticles($userPatterns, $tags);

        $this->showStatistics();
    }

    /**
     * ユーザー別投稿パターンを取得
     */
    private function getUserPatterns($users): array
    {
        $usersByEmail = $users->keyBy('email');

        return [
            // ヒートマップ確認用ユーザー（3名）
            'tanaka@example.com' => [
                'user' => $usersByEmail['tanaka@example.com'] ?? null,
                'pattern' => 'super_active',
                'description' => '超アクティブユーザー（有料・無料混在）',
                '2024_posts' => 200,
                '2025_posts' => 100,
            ],
            'sato@example.com' => [
                'user' => $usersByEmail['sato@example.com'] ?? null,
                'pattern' => 'medium_active_paid',
                'description' => '中程度アクティブユーザー（有料記事メイン）',
                '2024_posts' => 100,
                '2025_posts' => 50,
            ],
            'yamada@example.com' => [
                'user' => $usersByEmail['yamada@example.com'] ?? null,
                'pattern' => 'free_only',
                'description' => '無料記事専門ユーザー',
                '2024_posts' => 80,
                '2025_posts' => 40,
            ],

            // 投稿なしユーザー（3名）
            'takahashi@example.com' => [
                'user' => $usersByEmail['takahashi@example.com'] ?? null,
                'pattern' => 'no_posts',
                'description' => '投稿なしユーザー',
                '2024_posts' => 0,
                '2025_posts' => 0,
            ],
            'ito@example.com' => [
                'user' => $usersByEmail['ito@example.com'] ?? null,
                'pattern' => 'no_posts',
                'description' => '投稿なしユーザー',
                '2024_posts' => 0,
                '2025_posts' => 0,
            ],
            'watanabe@example.com' => [
                'user' => $usersByEmail['watanabe@example.com'] ?? null,
                'pattern' => 'no_posts',
                'description' => '投稿なしユーザー',
                '2024_posts' => 0,
                '2025_posts' => 0,
            ],

            // 適度な投稿ユーザー（4名）
            'nakamura@example.com' => [
                'user' => $usersByEmail['nakamura@example.com'] ?? null,
                'pattern' => 'moderate',
                'description' => '適度な投稿ユーザー',
                '2024_posts' => 25,
                '2025_posts' => 12,
            ],
            'kobayashi@example.com' => [
                'user' => $usersByEmail['kobayashi@example.com'] ?? null,
                'pattern' => 'moderate',
                'description' => '適度な投稿ユーザー',
                '2024_posts' => 30,
                '2025_posts' => 15,
            ],
            'kato@example.com' => [
                'user' => $usersByEmail['kato@example.com'] ?? null,
                'pattern' => 'moderate',
                'description' => '適度な投稿ユーザー',
                '2024_posts' => 20,
                '2025_posts' => 10,
            ],
            'yoshida@example.com' => [
                'user' => $usersByEmail['yoshida@example.com'] ?? null,
                'pattern' => 'moderate',
                'description' => '適度な投稿ユーザー',
                '2024_posts' => 15,
                '2025_posts' => 8,
            ],
        ];
    }

    /**
     * 記事を作成
     */
    private function createArticles(array $userPatterns, $tags): void
    {
        $articlesCreated = 0;
        $totalArticles = 0;

        foreach ($userPatterns as $email => $pattern) {
            if (! $pattern['user'] || $pattern['pattern'] === 'no_posts') {
                if ($pattern['pattern'] === 'no_posts') {
                    $this->command->info("投稿なしユーザー: {$email}");
                }

                continue;
            }

            $user = $pattern['user'];
            $this->command->info("記事作成開始: {$user->name} ({$pattern['description']})");

            // 2024年の記事作成
            if ($pattern['2024_posts'] > 0) {
                $created = $this->createArticlesForYear($user, 2024, $pattern['2024_posts'], $pattern['pattern'], $tags);
                $articlesCreated += $created;
                $totalArticles += $pattern['2024_posts'];
            }

            // 2025年の記事作成
            if ($pattern['2025_posts'] > 0) {
                $created = $this->createArticlesForYear($user, 2025, $pattern['2025_posts'], $pattern['pattern'], $tags);
                $articlesCreated += $created;
                $totalArticles += $pattern['2025_posts'];
            }

            $totalPosts = $pattern['2024_posts'] + $pattern['2025_posts'];
            $this->command->info("記事作成完了: {$user->name} - 作成予定: {$totalPosts}記事");
        }

        $this->command->info('=== 記事作成完了 ===');
        $this->command->info("作成予定記事数: {$totalArticles}");
        $this->command->info("実際作成数: {$articlesCreated}");
    }

    /**
     * 指定年の記事を作成
     */
    private function createArticlesForYear(User $user, int $year, int $targetCount, string $pattern, $tags): int
    {
        $startDate = Carbon::createFromDate($year, 1, 1);
        $endDate = $year === 2025 ? Carbon::createFromDate(2025, 6, 30) : Carbon::createFromDate($year, 12, 31);
        $totalDays = $startDate->diffInDays($endDate) + 1;

        $articlesCreated = 0;
        $markdownArticleCreated = false; // マークダウン網羅記事作成フラグ

        // 記事作成分布を計算
        $dailyDistribution = $this->calculateDailyDistribution($targetCount, $totalDays, $pattern);

        for ($day = 0; $day < $totalDays && $articlesCreated < $targetCount; $day++) {
            $currentDate = $startDate->copy()->addDays($day);
            $articlesToCreate = $dailyDistribution[$day] ?? 0;

            for ($i = 0; $i < $articlesToCreate && $articlesCreated < $targetCount; $i++) {
                $articleTime = $currentDate->copy()->setTime(
                    8 + ($articlesCreated % 14),
                    ($articlesCreated * 7) % 60
                );

                // マークダウン網羅記事を作成（ユーザーごとに1つ）
                if (! $markdownArticleCreated && $articlesCreated === 0) {
                    $this->createMarkdownComprehensiveArticle($user, $articleTime, $pattern, $tags);
                    $markdownArticleCreated = true;
                } else {
                    $this->createRegularArticle($user, $articleTime, $pattern, $tags, $articlesCreated);
                }

                $articlesCreated++;
            }
        }

        return $articlesCreated;
    }

    /**
     * 日別記事数分布を計算
     */
    private function calculateDailyDistribution(int $targetCount, int $totalDays, string $pattern): array
    {
        $distribution = array_fill(0, $totalDays, 0);
        $remaining = $targetCount;

        switch ($pattern) {
            case 'super_active':
                // 超アクティブ：固定パターンで配置
                $dayIndex = 0;
                while ($remaining > 0) {
                    $day = ($dayIndex * 7 + 3) % $totalDays; // 7日おきに3日目
                    $articles = min(1 + ($dayIndex % 5), $remaining); // 1-5記事
                    $distribution[$day] += $articles;
                    $remaining -= $articles;
                    $dayIndex++;
                }
                break;

            case 'medium_active_paid':
                // 中程度：固定パターンで配置
                $dayIndex = 0;
                while ($remaining > 0) {
                    $day = ($dayIndex * 5 + 2) % $totalDays; // 5日おきに2日目
                    $articles = min(1 + ($dayIndex % 3), $remaining); // 1-3記事
                    $distribution[$day] += $articles;
                    $remaining -= $articles;
                    $dayIndex++;
                }
                break;

            case 'free_only':
            case 'moderate':
                // 無料専門・適度：固定パターンで配置
                $articlesPerDay = max(1, intval($remaining / ($totalDays * 0.7)));
                for ($day = 0; $day < $totalDays && $remaining > 0; $day += 3) {
                    $articles = min($articlesPerDay, $remaining);
                    $distribution[$day] += $articles;
                    $remaining -= $articles;
                }
                break;
        }

        return $distribution;
    }

    /**
     * マークダウン網羅記事を作成
     */
    private function createMarkdownComprehensiveArticle(User $user, Carbon $dateTime, string $pattern, $tags): void
    {
        $content = $this->generateMarkdownComprehensiveContent();
        $selectedTags = $this->selectTags(['マークダウン', 'ドキュメント'], $tags, 2);

        // 固定値でcreated_at時間に基づいて決定
        // 振込口座がないユーザーは有料記事を作成できない
        $isPaid = $pattern !== 'free_only' && ($dateTime->day + $dateTime->hour) % 2 === 1 && $user->hasActiveBankAccount();
        $status = ($dateTime->day + $dateTime->hour + $dateTime->minute) % 10 === 1 ? 'draft' : 'published';

        $article = Article::create([
            'user_id' => $user->id,
            'title' => self::MARKDOWN_COMPREHENSIVE_ARTICLE_TITLE,
            'content' => $content,
            'status' => $status,
            'is_paid' => $isPaid,
            'price' => $isPaid ? (300 + (($dateTime->day + $dateTime->hour) % 170) * 10) : null,
            'preview_content' => $isPaid ? $this->generatePreviewContent($content) : null,
            'created_at' => $dateTime,
            'updated_at' => $dateTime->copy()->addMinutes(10 + (($dateTime->day + $dateTime->hour) % 110)),
        ]);

        if (! empty($selectedTags)) {
            $article->tags()->attach($selectedTags);
        }

        $this->command->info("Markdown網羅記事を作成: {$user->name} - {$article->title}");
    }

    /**
     * 通常記事を作成
     */
    private function createRegularArticle(User $user, Carbon $dateTime, string $pattern, $tags, int $articleIndex): void
    {
        $template = $this->getRandomArticleTemplate($pattern);
        $content = $this->generateArticleContent($template['tags'], $template['title']);
        // 固定タグ数を決定
        $tagCount = 1 + (($dateTime->day + $articleIndex) % 3);
        $selectedTags = $this->selectTags($template['tags'], $tags, $tagCount);

        // 固定値でcreated_at時間とインデックスに基づいて決定
        // 振込口座がないユーザーは有料記事を作成できない
        $isPaid = $this->determineIsPaidFixed($pattern, $dateTime, $articleIndex) && $user->hasActiveBankAccount();
        $status = ($dateTime->day + $dateTime->hour + $articleIndex) % 10 === 1 ? 'draft' : 'published';

        $article = Article::create([
            'user_id' => $user->id,
            'title' => $template['title'],
            'content' => $content,
            'status' => $status,
            'is_paid' => $isPaid,
            'price' => $isPaid ? (300 + (($dateTime->day + $articleIndex) % 170) * 10) : null,
            'preview_content' => $isPaid ? $this->generatePreviewContent($content) : null,
            'created_at' => $dateTime,
            'updated_at' => $dateTime->copy()->addMinutes(10 + (($dateTime->day + $articleIndex) % 110)),
        ]);

        if (! empty($selectedTags)) {
            $article->tags()->attach($selectedTags);
        }
    }

    /**
     * 記事テンプレートを取得
     */
    private function getRandomArticleTemplate(string $pattern): array
    {
        $templates = [
            // JavaScript関連
            [
                'title' => 'JavaScript ES2024の新機能解説と実践的な使い方',
                'tags' => ['JavaScript'],
            ],
            [
                'title' => 'Promise・async/awaitを使った非同期処理の最適化手法',
                'tags' => ['JavaScript'],
            ],
            [
                'title' => 'DOM操作とイベント処理の効率的なパフォーマンス改善',
                'tags' => ['JavaScript'],
            ],

            // TypeScript関連
            [
                'title' => 'TypeScript 5.x型システム完全攻略：Union型からMapped型まで',
                'tags' => ['TypeScript'],
            ],
            [
                'title' => 'Next.js + TypeScriptでの堅牢なアプリケーション設計',
                'tags' => ['TypeScript', 'Next.js'],
            ],
            [
                'title' => 'TypeScript Genericsを使った再利用可能なコンポーネント設計',
                'tags' => ['TypeScript', 'React'],
            ],

            // React関連
            [
                'title' => 'React Hooks深掘り：useEffect最適化とメモリリーク対策',
                'tags' => ['React', 'JavaScript'],
            ],
            [
                'title' => 'React 18 Concurrent Featuresを活用したUX向上テクニック',
                'tags' => ['React'],
            ],
            [
                'title' => 'カスタムHooksでロジック分離：再利用性の高いReact開発',
                'tags' => ['React'],
            ],

            // Vue.js関連
            [
                'title' => 'Vue.js 3 Composition API実践：リアクティブシステム完全理解',
                'tags' => ['Vue.js', 'JavaScript'],
            ],
            [
                'title' => 'Vue Router 4とPinia状態管理による現代的SPA構築',
                'tags' => ['Vue.js'],
            ],

            // Next.js関連
            [
                'title' => 'Next.js 14 App Routerとサーバーコンポーネント実装ガイド',
                'tags' => ['Next.js', 'React'],
            ],
            [
                'title' => 'Next.js ISR・SSG・SSRの使い分けとパフォーマンス最適化',
                'tags' => ['Next.js'],
            ],

            // PHP関連
            [
                'title' => 'PHP 8.3新機能とモダンPHP開発のベストプラクティス',
                'tags' => ['PHP'],
            ],
            [
                'title' => 'PSR標準に準拠したPHPアプリケーション設計パターン',
                'tags' => ['PHP'],
            ],

            // Laravel関連
            [
                'title' => 'Laravel 11 新機能解説：パフォーマンス向上と開発効率化',
                'tags' => ['Laravel', 'PHP'],
            ],
            [
                'title' => 'Laravel Eloquent ORM高度技法：リレーションとクエリ最適化',
                'tags' => ['Laravel', 'MySQL'],
            ],
            [
                'title' => 'Laravel Sanctum認証とAPI設計のセキュリティベストプラクティス',
                'tags' => ['Laravel'],
            ],

            // Python関連
            [
                'title' => 'Python 3.12新機能とパフォーマンス改善のポイント',
                'tags' => ['Python'],
            ],
            [
                'title' => 'Pythonデータ分析：pandas・NumPy効率的な処理テクニック',
                'tags' => ['Python'],
            ],

            // Django関連
            [
                'title' => 'Django REST Framework実践：スケーラブルなAPI開発手法',
                'tags' => ['Django', 'Python'],
            ],
            [
                'title' => 'Django ORMクエリ最適化とN+1問題の解決策',
                'tags' => ['Django'],
            ],

            // Go関連
            [
                'title' => 'Go言語のgoroutineとchannelを使った並行処理設計',
                'tags' => ['Go'],
            ],
            [
                'title' => 'Go Web API開発：Gin Frameworkとクリーンアーキテクチャ',
                'tags' => ['Go'],
            ],

            // Docker関連
            [
                'title' => 'Docker Compose本格活用：マルチコンテナ開発環境構築',
                'tags' => ['Docker'],
            ],
            [
                'title' => 'Dockerイメージ最適化：レイヤーキャッシュとマルチステージビルド',
                'tags' => ['Docker'],
            ],

            // AWS関連
            [
                'title' => 'AWS Lambda関数最適化：コールドスタート対策とメモリ調整',
                'tags' => ['AWS'],
            ],
            [
                'title' => 'AWS ECS Fargate本格運用：スケーリングとコスト最適化',
                'tags' => ['AWS', 'Docker'],
            ],

            // MySQL関連
            [
                'title' => 'MySQL 8.0クエリ最適化：インデックス設計とパフォーマンスチューニング',
                'tags' => ['MySQL'],
            ],
            [
                'title' => 'MySQL パーティション分割によるビッグデータ処理高速化',
                'tags' => ['MySQL'],
            ],

            // Node.js関連
            [
                'title' => 'Node.js EventLoop完全理解：非同期処理の内部動作',
                'tags' => ['Node.js', 'JavaScript'],
            ],
            [
                'title' => 'Express.js + TypeScriptで構築するREST API設計パターン',
                'tags' => ['Node.js', 'TypeScript'],
            ],

            // API設計関連
            [
                'title' => 'RESTful API設計原則とGraphQL比較：適切な選択指針',
                'tags' => ['API設計'],
            ],
            [
                'title' => 'OpenAPI Specification活用：自動化されたAPI開発フロー',
                'tags' => ['API設計'],
            ],
        ];

        // 固定インデックスでテンプレート選択
        $index = $pattern === 'free_only' ? count($templates) - 1 : 0;

        return $templates[$index % count($templates)];
    }

    /**
     * 有料記事かどうかを固定値で決定
     */
    private function determineIsPaidFixed(string $pattern, Carbon $dateTime, int $articleIndex): bool
    {
        switch ($pattern) {
            case 'free_only':
                return false;
            case 'medium_active_paid':
                // 75%の確率で有料（固定アルゴリズム）
                return ($dateTime->day + $articleIndex) % 4 !== 0;
            default:
                // 50%の確率で有料（固定アルゴリズム）
                return ($dateTime->day + $articleIndex) % 2 === 1;
        }
    }

    /**
     * タグを選択
     */
    private function selectTags(array $preferredTags, $allTags, int $count): array
    {
        $selectedTags = [];

        // 優先タグから選択
        foreach ($preferredTags as $tagName) {
            $tag = $allTags->where('name', $tagName)->first();
            if ($tag) {
                $selectedTags[] = $tag->id;
            }
            if (count($selectedTags) >= $count) {
                break;
            }
        }

        // 足りない分は既存タグから選択
        $tagIndex = 0;
        while (count($selectedTags) < $count && $tagIndex < $allTags->count()) {
            $tag = $allTags[$tagIndex % $allTags->count()];
            if (! in_array($tag->id, $selectedTags)) {
                $selectedTags[] = $tag->id;
            }
            $tagIndex++;
        }

        return $selectedTags;
    }

    /**
     * マークダウン網羅コンテンツを生成
     */
    private function generateMarkdownComprehensiveContent(): string
    {
        return <<<'MARKDOWN'
# Markdown完全ガイド：見出しからコードブロックまで

この記事では、Markdownの全機能を網羅的に解説します。技術文書の執筆からブログ投稿まで、あらゆる場面で活用できる実践的なテクニックを紹介します。

## 見出し（Headers）

Markdownでは、`#`記号を使って見出しを作成できます。レベル1から6まで対応しています。

### 見出しレベル3の例

#### 見出しレベル4の例

##### 見出しレベル5の例

###### 見出しレベル6の例

## テキスト装飾

**太字（Bold）**は`**`または`__`で囲みます。

*斜体（Italic）*は`*`または`_`で囲みます。

***太字斜体***は`***`で囲みます。

~~取り消し線~~は`~~`で囲みます。

## リスト

### 順序なしリスト

- 項目1
- 項目2
  - ネストした項目1
  - ネストした項目2
    - さらにネスト
- 項目3

### 順序ありリスト

1. 最初の項目
2. 2番目の項目
   1. ネストした番号付き項目
   2. もう一つのネスト項目
3. 3番目の項目

## リンクと画像

[リンクテキスト](https://example.com)

![画像の代替テキスト](https://via.placeholder.com/150)

## コードブロック

### インラインコード

`console.log('Hello, World!')`のように、バッククォートで囲みます。

### コードブロック（JavaScript）

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`フィボナッチ数列の10番目: ${result}`);
```

### コードブロック（Python）

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"ソート後: {sorted_numbers}")
```

### コードブロック（SQL）

```sql
SELECT 
    u.name,
    COUNT(a.id) as article_count,
    AVG(CASE WHEN a.is_paid THEN a.price ELSE 0 END) as avg_price
FROM users u
LEFT JOIN articles a ON u.id = a.user_id
WHERE a.status = 'published'
GROUP BY u.id, u.name
HAVING article_count > 5
ORDER BY article_count DESC;
```

## 引用

> これは引用文です。重要なポイントや他者の言葉を引用する際に使用します。
> 
> 複数行の引用も可能です。

## 表（テーブル）

| 言語 | 難易度 | 用途 | 人気度 |
|------|--------|------|--------|
| JavaScript | 中 | Web開発 | ★★★★★ |
| Python | 低 | データサイエンス | ★★★★★ |
| Go | 中 | バックエンド | ★★★★☆ |
| Rust | 高 | システムプログラミング | ★★★☆☆ |

## 水平線

---

## チェックボックス（タスクリスト）

- [x] 完了したタスク
- [x] Markdownの基本構文学習
- [ ] 未完了のタスク
- [ ] 応用技法の習得
- [ ] 実践プロジェクトへの適用

## 数式表示（LaTeX風）

インライン数式: $E = mc^2$

ブロック数式:
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 高度な技法

### 定義リスト

HTML
: ウェブページを作るためのマークアップ言語

CSS  
: HTMLの見た目をスタイリングするための言語

JavaScript
: ウェブページに動的な機能を追加するプログラミング言語

### 脚注

これは脚注付きのテキストです[^1]。

[^1]: これが脚注の内容です。詳細な説明や参照情報を記載できます。

## まとめ

Markdownは軽量でありながら表現力豊かなマークアップ言語です。この記事で紹介した記法をマスターすることで、技術文書やブログ記事を効率的に執筆できるようになります。

### 実践のポイント

1. **見出し構造を意識する**: 階層的な文書構造を作る
2. **コードブロックを活用する**: 技術記事では必須の機能
3. **表を効果的に使う**: データを整理して見やすく表示
4. **リストで情報を整理**: 箇条書きで読みやすさを向上

継続的な練習により、Markdownでの文書作成スキルを向上させていきましょう。
MARKDOWN;
    }

    /**
     * 記事コンテンツを生成
     */
    private function generateArticleContent(array $tags, string $title): string
    {
        $mainTag = $tags[0] ?? 'プログラミング';
        $wordCount = 200 + (strlen($title) % 800); // 固定範囲で文字数決定

        // タグに基づいた技術的コンテンツテンプレート
        $templates = $this->getContentTemplatesByTag($mainTag);
        $selectedTemplate = $templates[0]; // 固定インデックスで選択

        // コンテンツを組み立て
        $content = "# {$title}\n\n";
        $content .= $selectedTemplate['introduction']."\n\n";
        $content .= "## 概要\n\n".$selectedTemplate['overview']."\n\n";
        $content .= "## 実装方法\n\n".$selectedTemplate['implementation']."\n\n";

        if (isset($selectedTemplate['code_example'])) {
            $content .= "## コード例\n\n".$selectedTemplate['code_example']."\n\n";
        }

        $content .= "## まとめ\n\n".$selectedTemplate['conclusion']."\n";

        return $content;
    }

    /**
     * タグ別コンテンツテンプレートを取得
     */
    private function getContentTemplatesByTag(string $tag): array
    {
        $templates = [
            'JavaScript' => [
                [
                    'introduction' => 'JavaScriptは現代のウェブ開発において中核を成す言語です。ES2024の新機能を含む最新の仕様を理解することで、より効率的で保守性の高いコードが書けるようになります。',
                    'overview' => 'この記事では、JavaScriptの基本概念から応用技術まで、実践的な観点から解説します。非同期処理、DOM操作、モジュールシステムなど、実際の開発現場で必要となる知識を体系的に学べます。',
                    'implementation' => 'JavaScriptの実装において重要なのは、適切なデザインパターンの選択です。関数型プログラミングとオブジェクト指向プログラミングの考え方を組み合わせることで、柔軟性と再利用性を兼ね備えたコードが実現できます。',
                    'code_example' => "```javascript\n// 非同期処理の例\nasync function fetchUserData(userId) {\n  try {\n    const response = await fetch('/api/users/' + userId);\n    if (!response.ok) throw new Error('ユーザーデータの取得に失敗しました');\n    return await response.json();\n  } catch (error) {\n    console.error('エラー:', error.message);\n    throw error;\n  }\n}\n```",
                    'conclusion' => 'JavaScriptの習得は継続的な学習プロセスです。基礎をしっかりと身につけ、実践的なプロジェクトを通じてスキルを向上させることが重要です。',
                ],
            ],
            'TypeScript' => [
                [
                    'introduction' => 'TypeScriptは、JavaScriptに静的型付けを追加した言語として、大規模アプリケーション開発において欠かせない存在となっています。型安全性により、開発効率の向上とバグの早期発見が可能になります。',
                    'overview' => 'TypeScriptの型システムは非常に強力で、Union型、Intersection型、Mapped型など高度な型機能を提供します。これらを適切に活用することで、コードの品質と保守性を大幅に向上させることができます。',
                    'implementation' => 'TypeScriptプロジェクトの設定では、tsconfig.jsonの適切な設定が重要です。strict modeを有効にし、適切なコンパイルオプションを選択することで、型チェックの恩恵を最大限に活用できます。',
                    'code_example' => <<<'CODE'
```typescript
// ジェネリック型の活用例
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(url);
    return response.json();
  }
}
```
CODE,
                    'conclusion' => 'TypeScriptは学習コストがありますが、それを上回る開発体験の向上をもたらします。チーム開発における生産性向上のために、積極的に導入を検討すべき技術です。',
                ],
            ],
            'React' => [
                [
                    'introduction' => 'Reactは、コンポーネントベースのアーキテクチャにより、再利用可能で保守性の高いUIを構築できるJavaScriptライブラリです。Hooksの導入により、関数コンポーネントでの状態管理がより直感的になりました。',
                    'overview' => 'React 18では、Concurrent Featuresが導入され、ユーザーエクスペリエンスの向上が図られています。Suspense、useTransition、useDeferredValueなどの新機能を理解することで、よりスムーズなアプリケーションが作成できます。',
                    'implementation' => 'Reactアプリケーションの設計において、適切な状態管理とコンポーネントの責務分離が重要です。単一責任の原則に従い、小さく再利用可能なコンポーネントを作成することを心がけましょう。',
                    'code_example' => <<<'CODE'
```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```
CODE,
                    'conclusion' => 'Reactエコシステムは急速に進化しています。最新のベストプラクティスを継続的に学習し、実際のプロジェクトで実践することが成長への近道です。',
                ],
            ],
            'Laravel' => [
                [
                    'introduction' => 'LaravelはPHPにおける最も人気の高いフレームワークの一つです。Eloquent ORM、Blade テンプレートエンジン、Artisanコマンドラインツールなど、開発効率を高める機能が豊富に用意されています。',
                    'overview' => 'Laravel 11では、パフォーマンスの向上と開発者体験の改善が図られています。新しいルーティング機能、改善されたクエリビルダー、強化されたバリデーション機能などが追加されました。',
                    'implementation' => 'Laravelアプリケーションの開発では、MVCアーキテクチャの適切な実装が重要です。モデル、ビュー、コントローラーの責務を明確に分離し、サービス層やリポジトリパターンを活用することで保守性を向上させます。',
                    'code_example' => <<<'CODE'
```php
<?php

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->create($request->validated());
            return response()->json([
                'message' => 'ユーザーが正常に作成されました',
                'user' => new UserResource($user)
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'ユーザーの作成に失敗しました'
            ], 500);
        }
    }
}
```
CODE,
                    'conclusion' => 'Laravelは豊富な機能と優秀なドキュメントにより、迅速な開発が可能です。フレームワークの機能を適切に活用し、品質の高いWebアプリケーションを構築していきましょう。',
                ],
            ],
        ];

        return $templates[$tag] ?? $templates['JavaScript'];
    }

    /**
     * プレビューコンテンツを生成
     */
    private function generatePreviewContent(string $content): string
    {
        $words = explode(' ', strip_tags($content));
        $previewWords = array_slice($words, 0, 100);

        return implode(' ', $previewWords).'...';
    }

    /**
     * 統計情報を表示
     */
    private function showStatistics(): void
    {
        $totalArticles = Article::count();
        $paidArticles = Article::where('is_paid', true)->count();
        $draftArticles = Article::where('status', 'draft')->count();
        $publishedArticles = Article::where('status', 'published')->count();

        $this->command->info('=== 記事統計 ===');
        $this->command->info("総記事数: {$totalArticles}");
        $this->command->info("有料記事: {$paidArticles}");
        $this->command->info('無料記事: '.($totalArticles - $paidArticles));
        $this->command->info("下書き: {$draftArticles}");
        $this->command->info("公開済み: {$publishedArticles}");

        if ($paidArticles > 0) {
            $avgPrice = Article::where('is_paid', true)->avg('price');
            $this->command->info('平均価格: '.number_format($avgPrice, 0).'円');
        }

        // 年別統計
        $yearlyStats = Article::selectRaw('YEAR(created_at) as year, COUNT(*) as count')
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        $this->command->info('=== 年別統計 ===');
        foreach ($yearlyStats as $stat) {
            $this->command->info("{$stat->year}年: {$stat->count}記事");
        }
    }
}
