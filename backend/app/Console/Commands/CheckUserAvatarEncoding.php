<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;

class CheckUserAvatarEncoding extends Command
{
    protected $signature = 'user:check-avatar-encoding {article_id}';
    protected $description = 'Check UTF-8 encoding of user avatar data for an article';

    public function handle()
    {
        $articleId = $this->argument('article_id');
        $article = Article::with(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
            $query->active();
        }])->find($articleId);

        if (!$article) {
            $this->error("Article {$articleId} not found");
            return 1;
        }

        $this->info("Article ID: {$article->id}");
        $this->info("User ID: {$article->user->id}");
        $this->info("User name: {$article->user->name}");

        // ユーザー情報のUTF-8チェック
        $fields = ['name', 'username', 'avatar_path'];
        foreach ($fields as $field) {
            $value = $article->user->{$field} ?? '';
            $isValid = mb_check_encoding($value, 'UTF-8');
            $this->info("User {$field} Valid UTF-8: " . ($isValid ? 'Yes' : 'No'));
            if (!$isValid) {
                $this->error("Invalid UTF-8 in user {$field}: " . bin2hex($value));
            }
        }

        // アバターファイルのチェック
        if ($article->user->avatarFiles) {
            foreach ($article->user->avatarFiles as $avatarFile) {
                $this->info("Avatar File ID: {$avatarFile->id}");
                
                $avatarFields = ['file_path', 'original_name', 'file_data'];
                foreach ($avatarFields as $field) {
                    $value = $avatarFile->{$field} ?? '';
                    $isValid = mb_check_encoding($value, 'UTF-8');
                    $this->info("Avatar {$field} Valid UTF-8: " . ($isValid ? 'Yes' : 'No'));
                    
                    if (!$isValid) {
                        $this->error("Invalid UTF-8 in avatar {$field}");
                        $this->error("Length: " . strlen($value));
                        $this->error("First 100 bytes hex: " . bin2hex(substr($value, 0, 100)));
                    }
                }
            }
        } else {
            $this->info("No avatar files found");
        }

        // JSON エンコードテスト
        try {
            $jsonData = [
                'data' => $article,
                'is_preview' => true,
            ];
            $json = json_encode($jsonData, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            $this->info("JSON encoding successful");
        } catch (\JsonException $e) {
            $this->error("JSON encoding failed: " . $e->getMessage());
        }

        return 0;
    }
}