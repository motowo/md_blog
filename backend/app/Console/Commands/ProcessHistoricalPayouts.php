<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Payout;
use App\Services\CommissionService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ProcessHistoricalPayouts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payouts:process-historical';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '過去の決済データから振込データを生成し、1000円未満繰越ルールを適用';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('過去の決済データから振込データを生成します...');

        $commissionService = app(CommissionService::class);

        // 決済データがある最初の月から現在月まで処理
        $firstPayment = Payment::where('status', 'success')->orderBy('paid_at')->first();
        if (! $firstPayment) {
            $this->info('処理対象の決済データがありません。');

            return 0;
        }

        $startMonth = Carbon::parse($firstPayment->paid_at)->startOfMonth();
        $currentMonth = Carbon::now()->startOfMonth();

        $processedMonths = 0;
        $month = $startMonth->copy();

        while ($month <= $currentMonth) {
            $yearMonth = $month->format('Y-m');
            $this->info("処理中: {$yearMonth}");

            try {
                // 月次処理を実行
                $result = $commissionService->processMonthlyPayouts($yearMonth);

                if ($result['processed_count'] > 0) {
                    $this->info("  - {$result['processed_count']}件の振込データを作成しました");
                    $processedMonths++;
                } else {
                    $this->info('  - 該当月の売上はありません');
                }
            } catch (\Exception $e) {
                $this->error("  - エラー: {$e->getMessage()}");
            }

            $month->addMonth();
        }

        $this->info("完了: {$processedMonths}ヶ月分の振込データを処理しました");

        // 1000円未満繰越ルールを適用
        $this->info('1000円未満繰越ルールを適用しています...');
        $this->applyCarryOverRule();

        return 0;
    }

    /**
     * 1000円未満繰越ルールを適用
     */
    private function applyCarryOverRule()
    {
        // ユーザーごとに未払い振込データを処理
        $userIds = Payout::where('status', 'unpaid')
            ->distinct()
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            $this->info("ユーザーID {$userId} の繰越処理中...");

            // 該当ユーザーの未払い振込を期間順に取得
            $payouts = Payout::where('user_id', $userId)
                ->where('status', 'unpaid')
                ->orderBy('period')
                ->get();

            $carryOverAmount = 0;
            $scheduledPayouts = [];

            foreach ($payouts as $payout) {
                $totalAmount = $payout->amount + $carryOverAmount;

                if ($totalAmount >= 1000) {
                    // 1000円以上なので振込対象
                    $payout->update([
                        'amount' => $totalAmount,
                        'status' => 'unpaid', // 振込待ち状態を維持
                    ]);

                    $scheduledPayouts[] = $payout->period;
                    $carryOverAmount = 0;
                } else {
                    // 1000円未満なので繰越
                    // 実際の振込額は0円だが、記録は残す
                    $this->info("  - {$payout->period}: {$totalAmount}円 → 繰越");
                    $carryOverAmount = $totalAmount;
                }
            }

            if (count($scheduledPayouts) > 0) {
                $this->info('  - 振込対象月: '.implode(', ', $scheduledPayouts));
            }

            if ($carryOverAmount > 0) {
                $this->info("  - 繰越残高: {$carryOverAmount}円");
            }
        }

        $this->info('繰越処理が完了しました');
    }
}
