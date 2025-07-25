<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;

class CheckArticleEncoding extends Command
{
    protected $signature = 'article:check-encoding {id}';

    protected $description = 'Check UTF-8 encoding of an article';

    public function handle()
    {
        $id = $this->argument('id');
        $article = Article::find($id);

        if (! $article) {
            $this->error("Article {$id} not found");

            return 1;
        }

        $this->info("Article ID: {$article->id}");
        $this->info("Title: {$article->title}");
        $this->info('Content length: '.strlen($article->content));

        // UTF-8チェック
        $isValidUtf8 = mb_check_encoding($article->content, 'UTF-8');
        $this->info('Content Valid UTF-8: '.($isValidUtf8 ? 'Yes' : 'No'));

        if (! $isValidUtf8) {
            $this->error('Invalid UTF-8 detected in content!');

            // 無効な文字を探す
            $content = $article->content;
            for ($i = 0; $i < min(strlen($content), 1000); $i++) {
                $char = substr($content, $i, 1);
                if (! mb_check_encoding($char, 'UTF-8')) {
                    $this->error("Invalid character at position {$i}: ".bin2hex($char));
                    $this->info('Context: '.substr($content, max(0, $i - 10), 21));
                    break;
                }
            }
        }

        // タイトルもチェック
        $isTitleValidUtf8 = mb_check_encoding($article->title, 'UTF-8');
        $this->info('Title Valid UTF-8: '.($isTitleValidUtf8 ? 'Yes' : 'No'));

        // その他のフィールドもチェック
        $excerpt = $article->preview_content ?? '';
        $isExcerptValidUtf8 = mb_check_encoding($excerpt, 'UTF-8');
        $this->info('Preview Content Valid UTF-8: '.($isExcerptValidUtf8 ? 'Yes' : 'No'));

        return 0;
    }
}
