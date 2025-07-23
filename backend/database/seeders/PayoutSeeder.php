<?php

namespace Database\Seeders;

use App\Models\Payout;
use App\Services\CommissionService;
use Illuminate\Database\Seeder;

class PayoutSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存のPayoutデータを削除
        Payout::truncate();

        $this->command->info('タイムゾーン対応版で振込データを生成中...');

        // CommissionServiceを使用して履歴処理を実行
        $commissionService = app(CommissionService::class);

        // 2025年6月と7月の振込データを生成（タイムゾーン対応版）
        $months = ['2025-06', '2025-07'];

        foreach ($months as $yearMonth) {
            $result = $commissionService->processMonthlyPayouts($yearMonth);

            if ($result['processed_count'] > 0) {
                $this->command->info("シーダー: {$yearMonth} - {$result['processed_count']}件の振込データを作成（JST基準）");
            } else {
                $this->command->warn("シーダー: {$yearMonth} - 該当する売上データがありませんでした");
            }
        }

        // 1000円未満繰越ルールを適用
        $this->applyCarryOverRule();

        $this->command->info('タイムゾーン対応版の振込データのシードが完了しました');
    }

    /**
     * 1000円未満繰越ルールを適用
     */
    private function applyCarryOverRule(): void
    {
        // ユーザーごとに未払い振込データを処理
        $userIds = Payout::where('status', 'unpaid')
            ->distinct()
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            // 該当ユーザーの未払い振込を期間順に取得
            $payouts = Payout::where('user_id', $userId)
                ->where('status', 'unpaid')
                ->orderBy('period')
                ->get();

            $carryOverAmount = 0;

            foreach ($payouts as $payout) {
                $totalAmount = $payout->amount + $carryOverAmount;

                if ($totalAmount >= 1000) {
                    // 1000円以上なので振込対象
                    $payout->update([
                        'amount' => $totalAmount,
                        'status' => 'unpaid', // 振込待ち状態を維持
                    ]);

                    $carryOverAmount = 0;
                } else {
                    // 1000円未満なので繰越
                    $carryOverAmount = $totalAmount;
                }
            }
        }
    }
}
