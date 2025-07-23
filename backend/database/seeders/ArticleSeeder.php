<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
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

        // ユーザー別投稿パターン設定（30名対応）
        $userPatterns = $this->getUserPatterns($users);

        // 記事作成実行
        $this->createArticles($userPatterns, $tags);

        $this->showStatistics();
    }

    /**
     * ユーザー別投稿パターンを取得（30名）
     */
    private function getUserPatterns($users): array
    {
        $usersByEmail = $users->keyBy('email');

        return [
            // 超アクティブユーザー（6名） - 年200記事以上
            'tanaka@example.com' => [
                'user' => $usersByEmail['tanaka@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'fullstack',
                '2024_posts' => 240, '2025_posts' => 120,
            ],
            'sato@example.com' => [
                'user' => $usersByEmail['sato@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'frontend',
                '2024_posts' => 220, '2025_posts' => 110,
            ],
            'suzuki@example.com' => [
                'user' => $usersByEmail['suzuki@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'backend',
                '2024_posts' => 200, '2025_posts' => 100,
            ],
            'takahashi@example.com' => [
                'user' => $usersByEmail['takahashi@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'infrastructure',
                '2024_posts' => 210, '2025_posts' => 105,
            ],
            'ito@example.com' => [
                'user' => $usersByEmail['ito@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'data_science',
                '2024_posts' => 230, '2025_posts' => 115,
            ],
            'watanabe@example.com' => [
                'user' => $usersByEmail['watanabe@example.com'] ?? null,
                'pattern' => 'super_active', 'specialty' => 'frontend',
                '2024_posts' => 190, '2025_posts' => 95,
            ],

            // 中程度アクティブユーザー（18名） - 年50-100記事
            'nakamura@example.com' => [
                'user' => $usersByEmail['nakamura@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'backend',
                '2024_posts' => 70, '2025_posts' => 35,
            ],
            'kobayashi@example.com' => [
                'user' => $usersByEmail['kobayashi@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'design',
                '2024_posts' => 60, '2025_posts' => 30,
            ],
            'kato@example.com' => [
                'user' => $usersByEmail['kato@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'infrastructure',
                '2024_posts' => 80, '2025_posts' => 40,
            ],
            'yoshida@example.com' => [
                'user' => $usersByEmail['yoshida@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'data_science',
                '2024_posts' => 75, '2025_posts' => 35,
            ],
            'matsumoto@example.com' => [
                'user' => $usersByEmail['matsumoto@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'backend',
                '2024_posts' => 85, '2025_posts' => 40,
            ],
            'inoue@example.com' => [
                'user' => $usersByEmail['inoue@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'mobile',
                '2024_posts' => 65, '2025_posts' => 30,
            ],
            'kimura@example.com' => [
                'user' => $usersByEmail['kimura@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'security',
                '2024_posts' => 55, '2025_posts' => 25,
            ],
            'hayashi@example.com' => [
                'user' => $usersByEmail['hayashi@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'backend',
                '2024_posts' => 90, '2025_posts' => 45,
            ],
            'sasaki@example.com' => [
                'user' => $usersByEmail['sasaki@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'fullstack',
                '2024_posts' => 50, '2025_posts' => 25,
            ],
            'tamura@example.com' => [
                'user' => $usersByEmail['tamura@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'testing',
                '2024_posts' => 45, '2025_posts' => 20,
            ],
            'morita@example.com' => [
                'user' => $usersByEmail['morita@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'backend',
                '2024_posts' => 75, '2025_posts' => 35,
            ],
            'fujita@example.com' => [
                'user' => $usersByEmail['fujita@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'frontend',
                '2024_posts' => 40, '2025_posts' => 20,
            ],
            'noguchi@example.com' => [
                'user' => $usersByEmail['noguchi@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'database',
                '2024_posts' => 85, '2025_posts' => 40,
            ],
            'ishikawa@example.com' => [
                'user' => $usersByEmail['ishikawa@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'management',
                '2024_posts' => 35, '2025_posts' => 15,
            ],
            'ono@example.com' => [
                'user' => $usersByEmail['ono@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'backend',
                '2024_posts' => 55, '2025_posts' => 25,
            ],
            'murakami@example.com' => [
                'user' => $usersByEmail['murakami@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'documentation',
                '2024_posts' => 95, '2025_posts' => 45,
            ],
            'shimizu@example.com' => [
                'user' => $usersByEmail['shimizu@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'blockchain',
                '2024_posts' => 60, '2025_posts' => 30,
            ],
            'hasegawa@example.com' => [
                'user' => $usersByEmail['hasegawa@example.com'] ?? null,
                'pattern' => 'moderate', 'specialty' => 'design',
                '2024_posts' => 30, '2025_posts' => 15,
            ],

            // 無料記事専門ユーザー（3名）
            'yamada@example.com' => [
                'user' => $usersByEmail['yamada@example.com'] ?? null,
                'pattern' => 'free_only', 'specialty' => 'education',
                '2024_posts' => 120, '2025_posts' => 60,
            ],
            'aoki@example.com' => [
                'user' => $usersByEmail['aoki@example.com'] ?? null,
                'pattern' => 'free_only', 'specialty' => 'education',
                '2024_posts' => 80, '2025_posts' => 40,
            ],
            'fukuda@example.com' => [
                'user' => $usersByEmail['fukuda@example.com'] ?? null,
                'pattern' => 'free_only', 'specialty' => 'infrastructure',
                '2024_posts' => 100, '2025_posts' => 50,
            ],

            // 投稿なしユーザー（3名）
            'hashimoto@example.com' => [
                'user' => $usersByEmail['hashimoto@example.com'] ?? null,
                'pattern' => 'no_posts', 'specialty' => null,
                '2024_posts' => 0, '2025_posts' => 0,
            ],
            'nishimura@example.com' => [
                'user' => $usersByEmail['nishimura@example.com'] ?? null,
                'pattern' => 'no_posts', 'specialty' => null,
                '2024_posts' => 0, '2025_posts' => 0,
            ],
            'yamamoto@example.com' => [
                'user' => $usersByEmail['yamamoto@example.com'] ?? null,
                'pattern' => 'no_posts', 'specialty' => null,
                '2024_posts' => 0, '2025_posts' => 0,
            ],
        ];
    }

    /**
     * 記事作成メイン処理
     */
    private function createArticles($userPatterns, $tags): void
    {
        $totalArticles = 0;
        $startDate = Carbon::create(2024, 6, 1); // 2024年6月から開始
        $endDate = Carbon::create(2025, 6, 30);

        foreach ($userPatterns as $email => $pattern) {
            if (! $pattern['user'] || $pattern['pattern'] === 'no_posts') {
                if ($pattern['pattern'] === 'no_posts') {
                    $this->command->info("投稿なしユーザー: {$email}");
                }

                continue;
            }

            $user = $pattern['user'];
            $totalPosts = $pattern['2024_posts'] + $pattern['2025_posts'];

            $this->command->info("記事作成開始: {$user->name} ({$pattern['pattern']})");

            // Markdown完全ガイド記事を各ユーザーに作成
            $this->createMarkdownGuideArticle($user, $tags, $startDate);

            // 専門分野に応じた記事を作成
            $this->createSpecialtyArticles($user, $pattern, $tags, $startDate, $endDate, $totalPosts - 1);

            $totalArticles += $totalPosts;
            $this->command->info("記事作成完了: {$user->name} - 作成予定: {$totalPosts}記事");
        }

        $this->command->info('=== 記事作成完了 ===');
        $this->command->info("作成予定記事数: {$totalArticles}");
        $this->command->info('実際作成数: '.Article::count());
    }

    /**
     * Markdown完全ガイド記事を作成
     */
    private function createMarkdownGuideArticle($user, $tags, $startDate): void
    {
        $title = 'Markdown完全ガイド：見出しからコードブロックまで【実践編】';
        $content = $this->getMarkdownGuideContent();

        $article = new Article;
        $article->title = $title;
        $article->content = $content;
        $article->user_id = $user->id;
        $article->is_paid = false; // 常に無料
        $article->price = 0;
        $article->status = 'published';
        $article->created_at = $startDate->copy()->addDays(1);
        $article->updated_at = $article->created_at;
        $article->save();

        // JavaScript タグを付与
        $jsTag = $tags->where('name', 'JavaScript')->first();
        if ($jsTag) {
            $article->tags()->attach($jsTag->id);
        }

        $this->command->info("Markdown網羅記事を作成: {$user->name} - {$title}");
    }

    /**
     * 専門分野別記事作成
     */
    private function createSpecialtyArticles($user, $pattern, $tags, $startDate, $endDate, $articleCount): void
    {
        $specialty = $pattern['specialty'];
        $isPaidPattern = $pattern['pattern'] !== 'free_only';

        // 記事テンプレート定義
        $templates = $this->getArticleTemplates($specialty);

        for ($i = 0; $i < $articleCount; $i++) {
            // 固定アルゴリズムで日付を分散
            $dayOffset = (int) (($i / $articleCount) * $startDate->diffInDays($endDate));
            $articleDate = $startDate->copy()->addDays($dayOffset);

            // 2024年6月以降の記事のみ作成
            if ($articleDate->lt(Carbon::create(2024, 6, 1))) {
                $articleDate = Carbon::create(2024, 6, 1)->addDays($i % 30);
            }

            $template = $templates[$i % count($templates)];

            $article = new Article;
            $article->title = $this->generateVariedTitle($template['title'], $i);
            $article->content = $this->generateVariedContent($template['content'], $specialty, $i);
            $article->user_id = $user->id;

            // 価格設定（無料専門以外）
            if ($isPaidPattern && ($i % 2 === 0)) { // 50%を有料に
                $article->is_paid = true;
                $article->price = 300 + (($i % 20) * 50); // 300-1250円の範囲
            } else {
                $article->is_paid = false;
                $article->price = 0;
            }

            // ステータス（10%を下書きに）
            $article->status = ($i % 10 === 9) ? 'draft' : 'published';

            $article->created_at = $articleDate;
            $article->updated_at = $articleDate;
            $article->save();

            // タグ付与
            $this->attachTags($article, $template['tags'], $tags);
        }
    }

    /**
     * 専門分野別記事テンプレート
     */
    private function getArticleTemplates($specialty): array
    {
        $templates = [
            'fullstack' => [
                ['title' => 'React + Node.js で作る現代的なWebアプリケーション', 'content' => 'フルスタック開発の実践的な解説...', 'tags' => ['React', 'Node.js']],
                ['title' => 'TypeScript で型安全なフルスタック開発', 'content' => 'TypeScriptを活用した開発手法...', 'tags' => ['TypeScript', 'JavaScript']],
                ['title' => 'Docker を使った開発環境の統一', 'content' => 'コンテナ化による効率的な開発...', 'tags' => ['Docker']],
                ['title' => 'GraphQL API の設計と実装', 'content' => 'モダンなAPI設計手法...', 'tags' => ['GraphQL', 'API']],
                ['title' => 'Webパフォーマンス最適化の実践', 'content' => '表示速度改善のテクニック...', 'tags' => ['Performance']],
            ],
            'frontend' => [
                ['title' => 'React Hooks を使った状態管理', 'content' => 'Hooksを活用した効率的な状態管理...', 'tags' => ['React', 'TypeScript']],
                ['title' => 'CSS Grid レイアウトの実践的活用法', 'content' => 'モダンなレイアウト手法...', 'tags' => ['CSS', 'Design']],
                ['title' => 'Vue.js 3 Composition API 入門', 'content' => 'Vue.js の新しい記法...', 'tags' => ['Vue.js', 'JavaScript']],
                ['title' => 'アクセシビリティを考慮したUI設計', 'content' => '誰もが使いやすいUI作り...', 'tags' => ['Design', 'Accessibility']],
                ['title' => 'PWA 開発の基礎から応用まで', 'content' => 'プログレッシブWebアプリの作り方...', 'tags' => ['PWA', 'JavaScript']],
            ],
            'backend' => [
                ['title' => 'Laravel で作るREST API 設計', 'content' => 'RESTful APIの設計原則...', 'tags' => ['Laravel', 'PHP']],
                ['title' => 'データベース設計のベストプラクティス', 'content' => '効率的なDB設計手法...', 'tags' => ['Database', 'MySQL']],
                ['title' => 'Node.js でのマイクロサービス構築', 'content' => 'スケーラブルなアーキテクチャ...', 'tags' => ['Node.js', 'Microservices']],
                ['title' => 'Redis を使ったキャッシュ戦略', 'content' => 'パフォーマンス向上のキャッシュ活用...', 'tags' => ['Redis', 'Performance']],
                ['title' => 'Go言語 で高速なWeb API を作る', 'content' => 'Goによる効率的なサーバー開発...', 'tags' => ['Go', 'API']],
            ],
            'infrastructure' => [
                ['title' => 'AWS ECS を使ったコンテナデプロイ', 'content' => 'AWSでのコンテナ運用...', 'tags' => ['AWS', 'Docker']],
                ['title' => 'Terraform によるインフラ管理', 'content' => 'Infrastructure as Code の実践...', 'tags' => ['Terraform', 'AWS']],
                ['title' => 'Kubernetes クラスタ構築入門', 'content' => 'K8sによるオーケストレーション...', 'tags' => ['Kubernetes', 'Docker']],
                ['title' => 'CI/CD パイプライン設計の実践', 'content' => '自動化デプロイの構築...', 'tags' => ['CI/CD', 'DevOps']],
                ['title' => '監視とログ管理のベストプラクティス', 'content' => 'システム監視の重要性...', 'tags' => ['Monitoring', 'DevOps']],
            ],
            'data_science' => [
                ['title' => 'Python pandas による効率的なデータ分析', 'content' => 'データ操作の実践テクニック...', 'tags' => ['Python', 'Data Science']],
                ['title' => '機械学習アルゴリズムの選び方', 'content' => 'ML手法の比較と選択基準...', 'tags' => ['Machine Learning', 'Python']],
                ['title' => 'Django で作るデータ可視化アプリ', 'content' => 'WebベースのBI構築...', 'tags' => ['Django', 'Python']],
                ['title' => 'BigQuery を使った大規模データ処理', 'content' => 'クラウドでのデータ分析...', 'tags' => ['BigQuery', 'SQL']],
                ['title' => 'Deep Learning 実装の基礎', 'content' => 'ニューラルネットワークの実装...', 'tags' => ['Deep Learning', 'Python']],
            ],
            // 他の専門分野も同様に定義...
        ];

        return $templates[$specialty] ?? $templates['fullstack'];
    }

    /**
     * バリエーション豊かなタイトル生成
     */
    private function generateVariedTitle($baseTitle, $index): string
    {
        $variations = [
            '【2024年最新】'.$baseTitle,
            $baseTitle.' - 実践ガイド',
            $baseTitle.' 完全攻略',
            $baseTitle.' 入門から応用まで',
            '現場で使える '.$baseTitle,
            $baseTitle.' のベストプラクティス',
            '初心者向け '.$baseTitle.' 解説',
            $baseTitle.' 徹底解説',
        ];

        return $variations[$index % count($variations)];
    }

    /**
     * バリエーション豊かなコンテンツ生成
     */
    private function generateVariedContent($baseContent, $specialty, $index): string
    {
        $intros = [
            "この記事では、{$specialty}分野での実践的な知識をお伝えします。",
            "現場での経験を基に、{$specialty}の効果的な手法を解説します。",
            "{$specialty}領域での最新トレンドと実装方法を詳しく説明します。",
            "実際のプロジェクトで使える{$specialty}のテクニックを紹介します。",
        ];

        $sections = [
            "\n\n## 基本概念の理解\n\n".$baseContent,
            "\n\n## 実装手順\n\n```javascript\n// サンプルコード\nfunction example() {\n  return 'Hello World';\n}\n```",
            "\n\n## ベストプラクティス\n\n- 効率的な開発手法\n- パフォーマンス最適化\n- セキュリティ対策",
            "\n\n## トラブルシューティング\n\nよくある問題とその解決方法について説明します。",
            "\n\n## まとめ\n\n今回学んだ内容を活用して、より良い開発を進めていきましょう。",
        ];

        $intro = $intros[$index % count($intros)];
        $content = $intro;

        // セクションをランダムに2-3個追加
        $sectionCount = 2 + ($index % 2);
        for ($i = 0; $i < $sectionCount; $i++) {
            $content .= $sections[($index + $i) % count($sections)];
        }

        return $content;
    }

    /**
     * Markdown完全ガイドコンテンツ
     */
    private function getMarkdownGuideContent(): string
    {
        return "# Markdown完全ガイド

この記事では、Markdownの基本的な記法から応用的な使い方まで、実例を交えて詳しく解説します。

## 見出し

# H1見出し
## H2見出し  
### H3見出し
#### H4見出し
##### H5見出し
###### H6見出し

## テキスト装飾

**太字テキスト**  
*イタリックテキスト*  
~~取り消し線~~  
`インラインコード`

## リスト

### 順序なしリスト
- アイテム1
- アイテム2
  - サブアイテム1
  - サブアイテム2

### 順序ありリスト
1. 第一項目
2. 第二項目
3. 第三項目

## コードブロック

```javascript
function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('World');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## 表

| 項目 | 説明 | 例 |
|------|------|-----|
| 見出し | セクションのタイトル | # タイトル |
| リスト | 項目の列挙 | - アイテム |
| コード | プログラムコード | \`code\` |

## リンクと画像

[リンクテキスト](https://example.com)

![画像の代替テキスト](https://via.placeholder.com/300x200)

## 引用

> これは引用文です。
> 複数行にわたって引用することができます。

## まとめ

Markdownは覚えやすく、読みやすい記法です。この記事で紹介した記法をマスターして、効率的な文書作成を行いましょう。";
    }

    /**
     * タグを記事に関連付け
     */
    private function attachTags($article, $tagNames, $tags): void
    {
        foreach ($tagNames as $tagName) {
            $tag = $tags->where('name', $tagName)->first();
            if ($tag) {
                $article->tags()->attach($tag->id);
            }
        }
    }

    /**
     * 統計情報表示
     */
    private function showStatistics(): void
    {
        $totalArticles = Article::count();
        $paidArticles = Article::where('is_paid', true)->count();
        $freeArticles = Article::where('is_paid', false)->count();
        $draftArticles = Article::where('status', 'draft')->count();
        $publishedArticles = Article::where('status', 'published')->count();
        $averagePrice = Article::where('is_paid', true)->avg('price');

        $this->command->info('=== 記事統計 ===');
        $this->command->info("総記事数: {$totalArticles}");
        $this->command->info("有料記事: {$paidArticles}");
        $this->command->info("無料記事: {$freeArticles}");
        $this->command->info("下書き: {$draftArticles}");
        $this->command->info("公開済み: {$publishedArticles}");
        $this->command->info('平均価格: '.round($averagePrice).'円');

        // 年別統計
        $articles2024 = Article::whereBetween('created_at', ['2024-01-01', '2024-12-31'])->count();
        $articles2025 = Article::whereBetween('created_at', ['2025-01-01', '2025-12-31'])->count();

        $this->command->info('=== 年別統計 ===');
        $this->command->info("2024年: {$articles2024}記事");
        $this->command->info("2025年: {$articles2025}記事");
    }
}
