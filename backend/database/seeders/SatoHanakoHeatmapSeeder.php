<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SatoHanakoHeatmapSeeder extends Seeder
{
    /**
     * 佐藤花子用のヒートマップテストデータを作成
     * 凡例の全パターンをテストできるデータを生成
     */
    public function run(): void
    {
        $satoUser = User::where('email', 'sato@example.com')->first();
        if (!$satoUser) {
            $this->command->error('佐藤花子のユーザーが見つかりません。UserSeederを先に実行してください。');
            return;
        }

        // タグを取得（存在しない場合は作成）
        $tags = $this->getOrCreateTags();

        // 既存の佐藤花子の記事をすべて削除（重複を避けるため）
        Article::where('user_id', $satoUser->id)->delete();

        $this->command->info("佐藤花子用のヒートマップテストデータを作成開始...");

        // テストデータのパターン定義
        $testPatterns = [
            // 1記事パターン
            ['date' => '2025-01-01', 'articles' => [['title' => '新年の抱負', 'is_paid' => false, 'price' => null]]],
            ['date' => '2025-01-02', 'articles' => [['title' => 'プレミアム記事1', 'is_paid' => true, 'price' => 500]]],
            
            // 2記事パターン
            ['date' => '2025-01-05', 'articles' => [
                ['title' => '無料記事A', 'is_paid' => false, 'price' => null],
                ['title' => '無料記事B', 'is_paid' => false, 'price' => null]
            ]],
            ['date' => '2025-01-06', 'articles' => [
                ['title' => '有料記事A', 'is_paid' => true, 'price' => 800],
                ['title' => '有料記事B', 'is_paid' => true, 'price' => 1200]
            ]],
            ['date' => '2025-01-07', 'articles' => [
                ['title' => '混合記事・無料', 'is_paid' => false, 'price' => null],
                ['title' => '混合記事・有料', 'is_paid' => true, 'price' => 600]
            ]],
            
            // 3記事パターン
            ['date' => '2025-01-10', 'articles' => [
                ['title' => '3記事・全無料A', 'is_paid' => false, 'price' => null],
                ['title' => '3記事・全無料B', 'is_paid' => false, 'price' => null],
                ['title' => '3記事・全無料C', 'is_paid' => false, 'price' => null]
            ]],
            ['date' => '2025-01-11', 'articles' => [
                ['title' => '3記事・全有料A', 'is_paid' => true, 'price' => 1000],
                ['title' => '3記事・全有料B', 'is_paid' => true, 'price' => 1500],
                ['title' => '3記事・全有料C', 'is_paid' => true, 'price' => 800]
            ]],
            ['date' => '2025-01-12', 'articles' => [
                ['title' => '3記事・1有料A', 'is_paid' => true, 'price' => 700], // 33%有料（シアン系）
                ['title' => '3記事・1有料B', 'is_paid' => false, 'price' => null],
                ['title' => '3記事・1有料C', 'is_paid' => false, 'price' => null]
            ]],
            ['date' => '2025-01-13', 'articles' => [
                ['title' => '3記事・2有料A', 'is_paid' => true, 'price' => 900], // 67%有料（紫系）
                ['title' => '3記事・2有料B', 'is_paid' => true, 'price' => 1100],
                ['title' => '3記事・2有料C', 'is_paid' => false, 'price' => null]
            ]],
            
            // 4記事パターン（半々テスト）
            ['date' => '2025-01-15', 'articles' => [
                ['title' => '4記事・半々A有料', 'is_paid' => true, 'price' => 600], // 50%有料（紫系）
                ['title' => '4記事・半々B有料', 'is_paid' => true, 'price' => 800],
                ['title' => '4記事・半々C無料', 'is_paid' => false, 'price' => null],
                ['title' => '4記事・半々D無料', 'is_paid' => false, 'price' => null]
            ]],
            
            // 5記事パターン（比率テスト）
            ['date' => '2025-01-20', 'articles' => [
                ['title' => '5記事・4有料A', 'is_paid' => true, 'price' => 500], // 80%有料（緑系）
                ['title' => '5記事・4有料B', 'is_paid' => true, 'price' => 700],
                ['title' => '5記事・4有料C', 'is_paid' => true, 'price' => 900],
                ['title' => '5記事・4有料D', 'is_paid' => true, 'price' => 1000],
                ['title' => '5記事・4有料E無料', 'is_paid' => false, 'price' => null]
            ]],

            // 年をまたぐパターン（2024年データ）
            ['date' => '2024-12-25', 'articles' => [['title' => 'クリスマス記事', 'is_paid' => false, 'price' => null]]],
            ['date' => '2024-12-31', 'articles' => [
                ['title' => '2024年まとめ・有料', 'is_paid' => true, 'price' => 1500],
                ['title' => '2024年まとめ・無料', 'is_paid' => false, 'price' => null]
            ]],

            // その他の月のデータ
            ['date' => '2025-03-01', 'articles' => [['title' => '3月記事', 'is_paid' => false, 'price' => null]]],
            ['date' => '2025-06-15', 'articles' => [
                ['title' => '夏至記事A', 'is_paid' => true, 'price' => 800],
                ['title' => '夏至記事B', 'is_paid' => true, 'price' => 1200],
                ['title' => '夏至記事C', 'is_paid' => true, 'price' => 1000]
            ]],
            ['date' => '2025-09-23', 'articles' => [
                ['title' => '秋分の日記事', 'is_paid' => true, 'price' => 600]
            ]],
            ['date' => '2025-12-24', 'articles' => [
                ['title' => 'クリスマスイブ・有料', 'is_paid' => true, 'price' => 900],
                ['title' => 'クリスマスイブ・無料', 'is_paid' => false, 'price' => null],
                ['title' => 'クリスマスイブ・特別', 'is_paid' => true, 'price' => 1500],
                ['title' => 'クリスマスイブ・プレゼント', 'is_paid' => false, 'price' => null]
            ]],
        ];

        $totalArticles = 0;
        $paidArticles = 0;
        $freeArticles = 0;

        foreach ($testPatterns as $pattern) {
            $date = Carbon::parse($pattern['date']);
            
            foreach ($pattern['articles'] as $index => $articleData) {
                $content = $this->generateArticleContent($articleData['title'], $date);
                
                $article = Article::create([
                    'user_id' => $satoUser->id,
                    'title' => $articleData['title'],
                    'content' => $content,
                    'status' => 'published',
                    'is_paid' => $articleData['is_paid'],
                    'price' => $articleData['price'],
                    'created_at' => $date->copy()->addMinutes($index * 30), // 同じ日でも少し時間をずらす
                    'updated_at' => $date->copy()->addMinutes($index * 30),
                ]);

                // ランダムなタグを関連付け
                $randomTags = $tags->random(rand(2, 4));
                $article->tags()->attach($randomTags->pluck('id'));

                $totalArticles++;
                if ($articleData['is_paid']) {
                    $paidArticles++;
                } else {
                    $freeArticles++;
                }
            }
        }

        $this->command->info("=== 佐藤花子用ヒートマップテストデータ作成完了 ===");
        $this->command->info("作成した記事数: {$totalArticles}記事");
        $this->command->info("- 有料記事: {$paidArticles}記事");
        $this->command->info("- 無料記事: {$freeArticles}記事");
        $this->command->info("");
        $this->command->info("テスト可能な凡例パターン:");
        $this->command->info("✅ 投稿なし（グレー）");
        $this->command->info("✅ 1記事・無料（青300）");
        $this->command->info("✅ 1記事・有料（緑300）");
        $this->command->info("✅ 2記事・無料（青400）");
        $this->command->info("✅ 2記事・有料（緑400）");
        $this->command->info("✅ 2記事・混合（紫/シアン400）");
        $this->command->info("✅ 3記事以上・無料（青500）");
        $this->command->info("✅ 3記事以上・有料（緑500）");
        $this->command->info("✅ 3記事以上・混合（紫/シアン500）");
        $this->command->info("✅ 4記事・半々（紫系50%）");
        $this->command->info("✅ 5記事・80%有料（緑系）");
    }

    private function getOrCreateTags()
    {
        $tagSlugs = ['javascript', 'typescript', 'react', 'vue', 'php', 'laravel', 'nodejs', 'python', 'django', 'docker', 'mysql', 'api-design'];
        
        foreach ($tagSlugs as $slug) {
            Tag::firstOrCreate(
                ['slug' => $slug],
                ['name' => ucfirst(str_replace('-', ' ', $slug))]
            );
        }

        return Tag::whereIn('slug', $tagSlugs)->get();
    }

    private function generateArticleContent(string $title, Carbon $date): string
    {
        $dateStr = $date->format('Y年n月j日');
        
        return "# {$title}

{$dateStr}に投稿されたテスト記事です。

この記事では、ヒートマップの表示テストを行うためのサンプルコンテンツを提供します。

## 概要

ヒートマップの色分けと凡例表示のテストを目的として作成されました。

## 詳細内容

記事の種別（有料/無料）と投稿数の組み合わせによって、ヒートマップ上で異なる色が表示されることを確認できます。

### コード例

```javascript
const testData = {
  date: '{$date->format('Y-m-d')}',
  title: '{$title}',
  type: 'heatmap-test'
};

console.log('ヒートマップテストデータ:', testData);
```

## まとめ

このテストデータにより、ヒートマップの全ての色パターンと凡例の表示を確認することができます。

" . file_get_contents(database_path('seeders/ArticleContents/202505061904-sato_hanako.md'));
    }
}