<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 管理者以外の全ユーザーに銀行口座を設定
        $authors = User::where('role', 'author')->get();

        foreach ($authors as $key => $author) {
            // 70%のユーザーに振込口座を設定（有料記事を投稿できるように）
            if ($key % 10 < 7) {
                BankAccount::create([
                    'user_id' => $author->id,
                    'bank_name' => $this->getBankName($key),
                    'branch_name' => $this->getBranchName($key),
                    'account_type' => $key % 2 === 0 ? '普通' : '当座',
                    'account_number' => str_pad((1000000 + $key * 111), 7, '0', STR_PAD_LEFT),
                    'account_holder_name' => $author->name,
                    'is_active' => true,
                    'verified_at' => now()->subDays(rand(1, 30)),
                ]);

                $this->command->info("振込口座を作成しました: {$author->name} ({$author->email})");
            } else {
                $this->command->info("振込口座なし: {$author->name} ({$author->email})");
            }
        }

        $totalAuthors = $authors->count();
        $withBankAccounts = BankAccount::count();
        $percentage = $totalAuthors > 0 ? round(($withBankAccounts / $totalAuthors) * 100, 1) : 0;

        $this->command->info('=== 振込口座統計 ===');
        $this->command->info("総著者数: {$totalAuthors}");
        $this->command->info("振込口座設定済み: {$withBankAccounts}名（{$percentage}%）");
    }

    /**
     * キーに基づいて銀行名を取得
     */
    private function getBankName(int $key): string
    {
        $banks = [
            'みずほ銀行',
            '三菱UFJ銀行',
            '三井住友銀行',
            'りそな銀行',
            '楽天銀行',
            'ゆうちょ銀行',
            'イオン銀行',
            'セブン銀行',
        ];

        return $banks[$key % count($banks)];
    }

    /**
     * キーに基づいて支店名を取得
     */
    private function getBranchName(int $key): string
    {
        $branches = [
            '新宿支店',
            '渋谷支店',
            '池袋支店',
            '品川支店',
            '上野支店',
            '秋葉原支店',
            '銀座支店',
            '丸の内支店',
            '本店',
            '中央支店',
        ];

        return $branches[$key % count($branches)];
    }
}
