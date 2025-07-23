<?php

namespace App\Services;

use App\Helpers\TimeZoneHelper;
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
     * @param  string  $yearMonth  Y-m形式の年月
     * @return array 処理結果
     */
    public function processMonthlyPayouts($yearMonth)
    {
        return DB::transaction(function () use ($yearMonth) {
            // 既存の支払いデータをチェック
            $existingPayouts = Payout::where('period', $yearMonth)->get();
            $processedUserIds = [];
            $skippedUserIds = [];

            foreach ($existingPayouts as $existingPayout) {
                if ($existingPayout->status === 'paid') {
                    // 支払済みのユーザーはスキップ
                    $skippedUserIds[] = $existingPayout->user_id;
                } else {
                    // 未払いまたは失敗の場合は再処理対象
                    $processedUserIds[] = $existingPayout->user_id;
                }
            }

            // TimeZoneHelperを使用してJSTベースの月範囲を取得
            [$sql, $startUTC, $endUTC] = TimeZoneHelper::monthRangeFilterSql('payments.paid_at', $yearMonth);

            // 該当月の成功した決済を著者ごとに集計
            $authorPayments = Payment::query()
                ->select(
                    'articles.user_id',
                    DB::raw('SUM(payments.amount) as total_amount'),
                    DB::raw('COUNT(payments.id) as payment_count')
                )
                ->join('articles', 'payments.article_id', '=', 'articles.id')
                ->where('payments.status', 'success')
                ->whereRaw($sql, [$startUTC, $endUTC])
                ->groupBy('articles.user_id')
                ->get();

            $results = [];
            $newlyProcessedUserIds = [];
            $updatedUserIds = [];

            foreach ($authorPayments as $authorPayment) {
                $userId = $authorPayment->user_id;

                // 支払済みのユーザーはスキップ
                if (in_array($userId, $skippedUserIds)) {
                    continue;
                }

                // 手数料率を取得（月末時点の設定を使用）
                $endDate = Carbon::parse($yearMonth.'-01', TimeZoneHelper::JAPAN_TIMEZONE)->endOfMonth();
                $commissionSetting = CommissionSetting::getActiveSettingForDate($endDate->format('Y-m-d'));

                if (! $commissionSetting) {
                    throw new \Exception('手数料設定が見つかりません');
                }

                $grossAmount = $authorPayment->total_amount;
                $commissionRate = $commissionSetting->rate;
                $commissionAmount = round($grossAmount * ($commissionRate / 100), 2);
                $netAmount = $grossAmount - $commissionAmount;

                // 既存レコードがあるかチェック
                $existingPayout = Payout::where('user_id', $userId)
                    ->where('period', $yearMonth)
                    ->first();

                if ($existingPayout) {
                    // 既存レコードを更新（未払いまたは失敗の場合のみ）
                    $existingPayout->update([
                        'gross_amount' => $grossAmount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                        'amount' => $netAmount,
                        'status' => 'unpaid',
                        'paid_at' => null, // 失敗から未払いに戻す場合に備えて
                    ]);
                    $updatedUserIds[] = $userId;
                } else {
                    // 新規作成
                    Payout::create([
                        'user_id' => $userId,
                        'period' => $yearMonth,
                        'gross_amount' => $grossAmount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                        'amount' => $netAmount,
                        'status' => 'unpaid',
                    ]);
                    $newlyProcessedUserIds[] = $userId;
                }

                $results[] = [
                    'user_id' => $userId,
                    'gross_amount' => $grossAmount,
                    'commission_amount' => $commissionAmount,
                    'net_amount' => $netAmount,
                    'payment_count' => $authorPayment->payment_count,
                    'action' => $existingPayout ? 'updated' : 'created',
                ];
            }

            $totalProcessed = count($newlyProcessedUserIds) + count($updatedUserIds);
            $totalSkipped = count($skippedUserIds);

            return [
                'success' => true,
                'processed_count' => $totalProcessed,
                'newly_created_count' => count($newlyProcessedUserIds),
                'updated_count' => count($updatedUserIds),
                'skipped_count' => $totalSkipped,
                'payouts' => $results,
            ];
        });
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
                $periodDate = Carbon::parse($payout->period.'-01')->endOfMonth();
                $commissionSetting = CommissionSetting::getActiveSettingForDate($periodDate->format('Y-m-d'));

                if (! $commissionSetting) {
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
