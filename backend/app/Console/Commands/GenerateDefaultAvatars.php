<?php

namespace App\Console\Commands;

use App\Services\AvatarService;
use Illuminate\Console\Command;

class GenerateDefaultAvatars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'avatars:generate-default {--limit=100 : 一度に処理するユーザー数} {--dry-run : 実際の生成を行わずに対象ユーザー数のみ表示}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'アバターを持たないユーザーにデフォルトアバターを生成';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        $isDryRun = $this->option('dry-run');

        $avatarService = new AvatarService;

        if ($isDryRun) {
            // ドライラン: 対象ユーザー数のみ表示
            $count = \App\Models\User::whereDoesntHave('avatarFiles', function ($query) {
                $query->where('is_active', true);
            })->count();

            $this->info("【ドライラン】アバターを持たないユーザー数: {$count} 人");

            if ($limit && $count > $limit) {
                $this->info("今回処理される予定: {$limit} 人");
                $this->info('残り: '.($count - $limit).' 人');
            }

            return Command::SUCCESS;
        }

        $this->info('デフォルトアバターの生成を開始します...');

        // プログレスバーの準備
        $totalUsers = \App\Models\User::whereDoesntHave('avatarFiles', function ($query) {
            $query->where('is_active', true);
        })->count();

        if ($totalUsers === 0) {
            $this->info('アバターを持たないユーザーはいません。');

            return Command::SUCCESS;
        }

        $processCount = $limit ? min($limit, $totalUsers) : $totalUsers;
        $this->info("対象ユーザー数: {$totalUsers} 人");
        $this->info("今回処理数: {$processCount} 人");

        $bar = $this->output->createProgressBar($processCount);
        $bar->start();

        // アバター生成処理
        $createdCount = 0;
        $users = \App\Models\User::whereDoesntHave('avatarFiles', function ($query) {
            $query->where('is_active', true);
        })->limit($limit)->get();

        foreach ($users as $user) {
            try {
                $avatarService->generateDefaultAvatar($user);
                $createdCount++;
                $bar->advance();
            } catch (\Exception $e) {
                $this->error("\nユーザー {$user->id} ({$user->username}) のアバター生成に失敗: ".$e->getMessage());
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info('処理完了!');
        $this->info("成功: {$createdCount} 個のアバターを生成しました");

        if ($createdCount < $users->count()) {
            $failedCount = $users->count() - $createdCount;
            $this->warn("失敗: {$failedCount} 個のアバター生成に失敗しました");
        }

        // 残りのユーザー数を表示
        $remainingUsers = \App\Models\User::whereDoesntHave('avatarFiles', function ($query) {
            $query->where('is_active', true);
        })->count();

        if ($remainingUsers > 0) {
            $this->info("残りのアバター未設定ユーザー: {$remainingUsers} 人");
        }

        return Command::SUCCESS;
    }
}
