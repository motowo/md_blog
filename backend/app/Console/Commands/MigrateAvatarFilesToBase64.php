<?php

namespace App\Console\Commands;

use App\Models\AvatarFile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateAvatarFilesToBase64 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'avatars:migrate-to-base64 {--dry-run : 実際の変更を行わずに確認のみ}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '既存のアバターファイルをBASE64形式に変換してデータベースに保存';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->info('【ドライラン】実際の変更は行いません。');
        }

        // file_pathが設定されていてbase64_dataが未設定のレコードを取得
        $avatarFiles = AvatarFile::whereNotNull('file_path')
            ->whereNull('base64_data')
            ->get();

        if ($avatarFiles->isEmpty()) {
            $this->info('移行対象のアバターファイルはありません。');

            return Command::SUCCESS;
        }

        $this->info("移行対象: {$avatarFiles->count()} 件のアバターファイル");

        $successCount = 0;
        $errorCount = 0;

        foreach ($avatarFiles as $avatarFile) {
            try {
                $this->info("処理中: ID {$avatarFile->id} - {$avatarFile->original_filename}");

                // ファイルの存在確認
                if (! Storage::disk('public')->exists($avatarFile->file_path)) {
                    $this->error("  ファイルが見つかりません: {$avatarFile->file_path}");
                    $errorCount++;

                    continue;
                }

                // ファイルを読み込んでBASE64に変換
                $fileContent = Storage::disk('public')->get($avatarFile->file_path);
                $base64Data = 'data:'.$avatarFile->mime_type.';base64,'.base64_encode($fileContent);

                if (! $isDryRun) {
                    // データベースを更新
                    $avatarFile->update([
                        'base64_data' => $base64Data,
                    ]);

                    // 元のファイルを削除（オプション）
                    // Storage::disk('public')->delete($avatarFile->file_path);

                    $this->info('  ✓ 変換完了');
                } else {
                    $fileSize = strlen($fileContent);
                    $base64Size = strlen($base64Data);
                    $this->info('  元のファイルサイズ: '.number_format($fileSize).' bytes');
                    $this->info('  BASE64サイズ: '.number_format($base64Size).' bytes');
                }

                $successCount++;

            } catch (\Exception $e) {
                $this->error('  エラー: '.$e->getMessage());
                $errorCount++;
            }
        }

        $this->newLine();
        $this->info('処理完了');
        $this->info("成功: {$successCount} 件");

        if ($errorCount > 0) {
            $this->error("エラー: {$errorCount} 件");
        }

        if ($isDryRun) {
            $this->info("\n実際に移行を実行するには、--dry-run オプションを外して再実行してください。");
        }

        return Command::SUCCESS;
    }
}
