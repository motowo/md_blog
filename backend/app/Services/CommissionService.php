<?php

namespace App\Services;

use App\Models\CommissionSetting;
use App\Models\Payment;
use App\Models\Payout;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CommissionService
{
    /**
     * 月次の支払い処理を実行
     *
     * @param string $yearMonth Y-m形式の年月
     * @return array 処理結果
     */
    public function processMonthlyPayouts($yearMonth)
    {
        $startDate = Carbon::parse($yearMonth . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        return DB::transaction(function () use ($startDate, $endDate, $yearMonth) {
            // 該当月の成功した決済を著者ごとに集計
            $authorPayments = Payment::query()
                ->select(
                    'articles.user_id',
                    DB::raw('SUM(payments.amount) as total_amount'),
                    DB::raw('COUNT(payments.id) as payment_count')
                )
                ->join('articles', 'payments.article_id', '=', 'articles.id')
                ->where('payments.status', 'success')
                ->whereBetween('payments.paid_at', [$startDate, $endDate])
                ->groupBy('articles.user_id')
                ->get();

            $results = [];

            foreach ($authorPayments as $authorPayment) {
                // 手数料率を取得（月末時点の設定を使用）
                $commissionSetting = CommissionSetting::getActiveSettingForDate($endDate->format('Y-m-d'));
                
                if (!$commissionSetting) {
                    throw new \Exception('手数料設定が見つかりません');
                }

                $grossAmount = $authorPayment->total_amount;
                $commissionRate = $commissionSetting->rate;
                $commissionAmount = round($grossAmount * ($commissionRate / 100), 2);
                $netAmount = $grossAmount - $commissionAmount;

                // Payoutレコードを作成または更新
                $payout = Payout::updateOrCreate(
                    [
                        'user_id' => $authorPayment->user_id,
                        'period' => $yearMonth,
                    ],
                    [
                        'gross_amount' => $grossAmount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                        'amount' => $netAmount,
                        'status' => 'unpaid',
                    ]
                );

                $results[] = [
                    'user_id' => $authorPayment->user_id,
                    'gross_amount' => $grossAmount,
                    'commission_amount' => $commissionAmount,
                    'net_amount' => $netAmount,
                    'payment_count' => $authorPayment->payment_count,
                ];
            }

            return [
                'success' => true,
                'processed_count' => count($results),
                'payouts' => $results,
            ];
        });
    }

    /**
     * 特定期間の手数料収入を計算
     *
     * @param string $startDate Y-m-d形式の開始日
     * @param string $endDate Y-m-d形式の終了日
     * @return array
     */
    public function calculateCommissionRevenue($startDate, $endDate)
    {
        $payouts = Payout::query()
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->get();

        $totalCommission = $payouts->sum('commission_amount');
        $totalGross = $payouts->sum('gross_amount');

        return [
            'total_commission' => $totalCommission,
            'total_gross' => $totalGross,
            'average_commission_rate' => $totalGross > 0 ? round(($totalCommission / $totalGross) * 100, 2) : 0,
            'payout_count' => $payouts->count(),
        ];
    }

    /**
     * 過去のデータに手数料を適用
     *
     * @return array
     */
    public function applyCommissionToHistoricalData()
    {
        return DB::transaction(function () {
            // 既存のPayoutレコードを取得
            $payouts = Payout::whereNull('commission_rate')->get();
            $updatedCount = 0;

            foreach ($payouts as $payout) {
                // 該当期間の手数料設定を取得
                $periodDate = Carbon::parse($payout->period . '-01')->endOfMonth();
                $commissionSetting = CommissionSetting::getActiveSettingForDate($periodDate->format('Y-m-d'));

                if (!$commissionSetting) {
                    // デフォルトの手数料率（10%）を使用
                    $commissionRate = 10.00;
                } else {
                    $commissionRate = $commissionSetting->rate;
                }

                // 現在のamountを総売上として扱う
                $grossAmount = $payout->amount;
                $commissionAmount = round($grossAmount * ($commissionRate / 100), 2);
                $netAmount = $grossAmount - $commissionAmount;

                $payout->update([
                    'gross_amount' => $grossAmount,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'amount' => $netAmount,
                ]);

                $updatedCount++;
            }

            return [
                'success' => true,
                'updated_count' => $updatedCount,
            ];
        });
    }
}