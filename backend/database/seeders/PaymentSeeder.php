<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CommissionSetting;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 有料記事のみ対象
        $paidArticles = Article::where('is_paid', true)->get();

        if ($paidArticles->isEmpty()) {
            $this->command->info('有料記事が存在しないため、決済データをスキップします');

            return;
        }

        // ユーザー（購入者）を取得
        $buyers = User::where('role', 'author')->get();

        if ($buyers->isEmpty()) {
            $this->command->info('購入者となるユーザーが存在しないため、決済データをスキップします');

            return;
        }

        $paymentCount = 0;

        foreach ($paidArticles as $article) {
            // 各記事に対してランダムに購入者を設定（0-5人）
            $purchaseCount = rand(0, 5);

            for ($i = 0; $i < $purchaseCount; $i++) {
                $buyer = $buyers->random();

                // 自分の記事は購入できない
                if ($buyer->id === $article->user_id) {
                    continue;
                }

                // 重複購入をチェック
                if (Payment::where('user_id', $buyer->id)->where('article_id', $article->id)->exists()) {
                    continue;
                }

                // 過去30日間のランダムな日時で決済を作成
                $purchaseDate = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

                Payment::create([
                    'user_id' => $buyer->id,
                    'article_id' => $article->id,
                    'amount' => $article->price,
                    'transaction_id' => 'txn_test_'.uniqid(),
                    'status' => 'success',
                    'paid_at' => $purchaseDate,
                    'created_at' => $purchaseDate,
                    'updated_at' => $purchaseDate,
                ]);

                $paymentCount++;
            }
        }

        $this->command->info("決済データを作成しました: {$paymentCount}件");

        // 統計情報を表示
        $this->showPaymentStatistics();
    }

    /**
     * 決済統計情報を表示
     */
    private function showPaymentStatistics(): void
    {
        $totalPayments = Payment::count();
        $totalRevenue = Payment::where('status', 'success')->sum('amount');

        // 手数料設定を取得
        $commissionSetting = CommissionSetting::where('is_active', true)->first();
        $commissionRate = $commissionSetting ? $commissionSetting->rate : 10;

        $commissionAmount = $totalRevenue * ($commissionRate / 100);
        $authorAmount = $totalRevenue - $commissionAmount;

        $this->command->info('=== 決済統計 ===');
        $this->command->info("総決済数: {$totalPayments}件");
        $this->command->info('総売上: ¥'.number_format($totalRevenue));
        $this->command->info("手数料収入（{$commissionRate}%）: ¥".number_format($commissionAmount));
        $this->command->info('著者収入: ¥'.number_format($authorAmount));

        // 月別統計
        $this->showMonthlyStatistics();
    }

    /**
     * 月別統計情報を表示
     */
    private function showMonthlyStatistics(): void
    {
        $monthlyStats = Payment::selectRaw('
            DATE_FORMAT(created_at, "%Y-%m") as month,
            COUNT(*) as payment_count,
            SUM(amount) as total_amount
        ')
            ->where('status', 'success')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        $this->command->info('=== 月別統計 ===');
        foreach ($monthlyStats as $stat) {
            $this->command->info("{$stat->month}: {$stat->payment_count}件, ¥".number_format($stat->total_amount));
        }
    }
}
