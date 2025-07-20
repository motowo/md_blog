<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ImprovedArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $tags = Tag::all();

        if ($users->isEmpty()) {
            $this->command->error('ユーザーが見つかりません。先にUserSeederを実行してください。');

            return;
        }

        if ($tags->isEmpty()) {
            $this->command->error('タグが見つかりません。先にTagSeederを実行してください。');

            return;
        }

        // 記事のテンプレート情報
        $articleTemplates = [
            [
                'title' => 'React Hooksを使った状態管理の実践',
                'template' => 'sample-react-hooks.md',
                'tags' => ['React', 'JavaScript', 'フロントエンド'],
                'is_paid' => false,
            ],
            [
                'title' => 'Laravel APIの設計とベストプラクティス',
                'template' => 'sample-laravel-api.md',
                'tags' => ['Laravel', 'PHP', 'バックエンド'],
                'is_paid' => true,
                'price' => 980,
            ],
            [
                'title' => 'TypeScript 型安全性の活用法',
                'template' => 'sample-typescript.md',
                'tags' => ['TypeScript', 'JavaScript'],
                'is_paid' => true,
                'price' => 1200,
            ],
            [
                'title' => 'Vue.js 3 Composition APIガイド',
                'template' => null,
                'tags' => ['Vue.js', 'JavaScript', 'フロントエンド'],
                'is_paid' => false,
            ],
            [
                'title' => 'Docker開発環境構築の完全マニュアル',
                'template' => null,
                'tags' => ['Docker', 'DevOps'],
                'is_paid' => true,
                'price' => 1500,
            ],
            [
                'title' => 'Next.js App Routerで始めるモダンWeb開発',
                'template' => null,
                'tags' => ['Next.js', 'React', 'フロントエンド'],
                'is_paid' => true,
                'price' => 890,
            ],
            [
                'title' => 'MySQL パフォーマンス最適化テクニック',
                'template' => null,
                'tags' => ['MySQL', 'データベース'],
                'is_paid' => true,
                'price' => 1350,
            ],
            [
                'title' => 'AWS Lambda サーバーレス開発入門',
                'template' => null,
                'tags' => ['AWS', 'サーバーレス', 'クラウド'],
                'is_paid' => false,
            ],
            [
                'title' => 'GraphQL API設計の実装パターン',
                'template' => null,
                'tags' => ['GraphQL', 'API'],
                'is_paid' => true,
                'price' => 780,
            ],
            [
                'title' => 'Python Django REST framework実践',
                'template' => null,
                'tags' => ['Python', 'Django', 'バックエンド'],
                'is_paid' => true,
                'price' => 1100,
            ],
            [
                'title' => 'モバイルアプリ開発：React Native + Expo',
                'template' => null,
                'tags' => ['React Native', 'モバイル'],
                'is_paid' => false,
            ],
            [
                'title' => 'Tailwind CSS モダンUIコンポーネント設計',
                'template' => null,
                'tags' => ['CSS', 'Tailwind', 'UI/UX'],
                'is_paid' => true,
                'price' => 650,
            ],
            [
                'title' => 'Git ワークフローとチーム開発ベストプラクティス',
                'template' => null,
                'tags' => ['Git', 'チーム開発'],
                'is_paid' => false,
            ],
            [
                'title' => 'Node.js マイクロサービス設計パターン',
                'template' => null,
                'tags' => ['Node.js', 'マイクロサービス', 'バックエンド'],
                'is_paid' => true,
                'price' => 1450,
            ],
            [
                'title' => 'Redis キャッシュ戦略とパフォーマンス向上',
                'template' => null,
                'tags' => ['Redis', 'キャッシュ', 'パフォーマンス'],
                'is_paid' => true,
                'price' => 950,
            ],
        ];

        // 過去3ヶ月から昨日までの日付範囲
        $startDate = Carbon::now()->subMonths(3);
        $endDate = Carbon::yesterday();
        $totalDays = $startDate->diffInDays($endDate) + 1;

        // 各日付に対してランダムにユーザーを選んで記事を作成
        $articlesCreated = 0;
        $contentBasePath = database_path('seeders/ArticleContents');

        for ($i = 0; $i < $totalDays && $articlesCreated < count($articleTemplates); $i++) {
            $articleDate = $startDate->copy()->addDays($i);

            // ランダムに時間を設定（朝7時から夜11時まで）
            $randomHour = rand(7, 23);
            $randomMinute = rand(0, 59);
            $articleDate->setTime($randomHour, $randomMinute);

            // ランダムにユーザーを選択
            $user = $users->random();

            // 記事テンプレートを取得
            $template = $articleTemplates[$articlesCreated];

            // コンテンツを読み込み
            $content = $this->getArticleContent($template['template'], $contentBasePath);

            // プレビューコンテンツ（有料記事の場合）
            $previewContent = null;
            if ($template['is_paid'] ?? false) {
                $previewContent = $this->generatePreviewContent($content);
            }

            // 1割の確率で下書きにする
            $isDraft = rand(1, 10) === 1;
            $status = $isDraft ? 'draft' : 'published';

            // 記事を作成
            $article = Article::create([
                'user_id' => $user->id,
                'title' => $template['title'],
                'content' => $content,
                'status' => $status,
                'is_paid' => $template['is_paid'] ?? false,
                'price' => $template['price'] ?? null,
                'preview_content' => $previewContent,
                'is_featured' => rand(1, 5) === 1, // 20%の確率で注目記事
                'created_at' => $articleDate,
                'updated_at' => $articleDate->copy()->addMinutes(rand(5, 120)), // 作成から最大2時間後に更新
            ]);

            // タグを付与（1-3個）
            $selectedTags = $this->selectTagsForArticle($template['tags'], $tags, rand(1, 3));
            $article->tags()->attach($selectedTags);

            // ファイル作成（記録用）
            $this->createContentFile($articleDate, $user, $content);

            $this->command->info("記事を作成しました: {$template['title']} by {$user->username} on {$articleDate->format('Y-m-d H:i')}");

            $articlesCreated++;
        }

        $this->command->info("合計 {$articlesCreated} 件の記事を作成しました");

        // 統計を表示
        $this->showStatistics();
    }

    /**
     * 記事コンテンツを取得
     */
    private function getArticleContent(?string $templateFile, string $basePath): string
    {
        if ($templateFile && File::exists("{$basePath}/{$templateFile}")) {
            return File::get("{$basePath}/{$templateFile}");
        }

        // テンプレートファイルがない場合はダミーコンテンツを生成
        return $this->generateDummyContent();
    }

    /**
     * ダミーコンテンツを生成（500-2000文字）
     */
    private function generateDummyContent(): string
    {
        $paragraphs = [
            'この記事では、最新の技術トレンドと実装方法について詳しく解説します。実際のプロジェクトで使える実践的なテクニックを中心に、初心者から上級者まで理解できるよう丁寧に説明していきます。',
            'まず基本的な概念から理解していきましょう。基礎をしっかりと身につけることで、より高度なテクニックへの理解が深まります。実際のコード例を交えながら、ステップバイステップで進めていきます。',
            '```javascript\nconst example = () => {\n  console.log("Hello, World!");\n};\n```',
            '次に、実装上の注意点とベストプラクティスについて説明します。パフォーマンスと保守性を両立させるために、どのような点に気をつけるべきかを具体的に見ていきます。',
            '実際のプロジェクトでは、様々な制約や要件があります。そういった現実的な状況でも適用できる柔軟なアプローチを提案します。チーム開発での協調性も重要な要素です。',
            'エラーハンドリングとデバッグ手法についても触れておきます。開発中に遭遇する一般的な問題とその解決策を事前に知っておくことで、効率的な開発が可能になります。',
            'パフォーマンスの最適化は、ユーザーエクスペリエンスに直接影響します。測定可能な指標を設定し、継続的な改善を行うことが重要です。',
            '最後に、今後の展望と学習リソースについて紹介します。技術は日々進歩しているため、継続的な学習と情報収集が不可欠です。信頼できる情報源を見つけることから始めましょう。',
        ];

        $targetWords = rand(100, 400); // 単語数ベースに変更
        $content = '';
        $wordCount = 0;

        while ($wordCount < $targetWords) {
            $paragraph = $paragraphs[array_rand($paragraphs)];
            $content .= $paragraph."\n\n";
            $wordCount += count(preg_split('/\s+/', strip_tags($paragraph)));
        }

        // UTF-8エンコーディングを確保
        return mb_convert_encoding($content, 'UTF-8', 'auto');
    }

    /**
     * プレビューコンテンツを生成
     */
    private function generatePreviewContent(string $content): string
    {
        $words = explode(' ', strip_tags($content));
        $previewWords = array_slice($words, 0, 50); // 最初の50単語

        return implode(' ', $previewWords).'...';
    }

    /**
     * 記事用のタグを選択
     */
    private function selectTagsForArticle(array $preferredTags, $allTags, int $count): array
    {
        $selectedTags = [];

        // 指定されたタグがある場合は優先的に選択
        foreach ($preferredTags as $tagName) {
            $tag = $allTags->where('name', $tagName)->first();
            if ($tag) {
                $selectedTags[] = $tag->id;
            }

            if (count($selectedTags) >= $count) {
                break;
            }
        }

        // 足りない分はランダムに選択
        while (count($selectedTags) < $count) {
            $randomTag = $allTags->random();
            if (! in_array($randomTag->id, $selectedTags)) {
                $selectedTags[] = $randomTag->id;
            }
        }

        return $selectedTags;
    }

    /**
     * コンテンツファイルを作成
     */
    private function createContentFile(Carbon $date, User $user, string $content): void
    {
        $filename = $date->format('YmdHi').'-'.$user->username.'.md';
        $filePath = database_path("seeders/ArticleContents/{$filename}");

        File::put($filePath, $content);
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
    }
}
