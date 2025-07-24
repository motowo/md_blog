<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Database\Seeder;

class AvatarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $avatarService = new AvatarService();
        
        // アバターを持たないユーザーを取得
        $usersWithoutAvatar = User::whereDoesntHave('avatarFiles', function ($query) {
            $query->where('is_active', true);
        })->get();

        if ($usersWithoutAvatar->isEmpty()) {
            $this->command->info('すべてのユーザーは既にアバターを持っています。');
            return;
        }

        $this->command->info("アバターを持たないユーザー数: {$usersWithoutAvatar->count()}名");
        
        $createdCount = 0;
        $failedCount = 0;

        // 進行状況を表示
        $bar = $this->command->getOutput()->createProgressBar($usersWithoutAvatar->count());
        $bar->start();

        foreach ($usersWithoutAvatar as $user) {
            try {
                $avatarService->generateDefaultAvatar($user);
                $createdCount++;
                $this->command->info("\n✓ {$user->name} ({$user->email}) のアバターを生成しました");
            } catch (\Exception $e) {
                $failedCount++;
                $this->command->error("\n✗ {$user->name} ({$user->email}) のアバター生成に失敗: " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine(2);

        // 結果サマリー
        $this->command->info('=== アバター生成完了 ===');
        $this->command->info("成功: {$createdCount}個のランダムアバターを生成しました");
        
        if ($failedCount > 0) {
            $this->command->warn("失敗: {$failedCount}個のアバター生成に失敗しました");
        }

        // アバター統計を表示
        $this->showAvatarStatistics();
    }

    /**
     * アバター統計情報を表示
     */
    private function showAvatarStatistics(): void
    {
        $totalUsers = User::count();
        $usersWithAvatar = User::whereHas('avatarFiles', function ($query) {
            $query->where('is_active', true);
        })->count();
        $usersWithoutAvatar = $totalUsers - $usersWithAvatar;

        $this->command->info('=== アバター統計情報 ===');
        $this->command->info("総ユーザー数: {$totalUsers}名");
        $this->command->info("アバター設定済み: {$usersWithAvatar}名（" . round(($usersWithAvatar / $totalUsers) * 100, 1) . '%）');
        
        if ($usersWithoutAvatar > 0) {
            $this->command->warn("アバター未設定: {$usersWithoutAvatar}名（" . round(($usersWithoutAvatar / $totalUsers) * 100, 1) . '%）');
        } else {
            $this->command->info("✓ すべてのユーザーがアバターを持っています");
        }

        // デフォルトアバターの種類統計
        $defaultAvatarUsers = User::whereHas('avatarFiles', function ($query) {
            $query->where('is_active', true)->where('original_filename', 'default_avatar.png');
        })->count();

        if ($defaultAvatarUsers > 0) {
            $this->command->info("デフォルトアバター使用: {$defaultAvatarUsers}名（" . round(($defaultAvatarUsers / $usersWithAvatar) * 100, 1) . '%）');
        }
    }
}
