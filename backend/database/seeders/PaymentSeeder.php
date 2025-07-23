<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CommissionSetting;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 2024年6月以降の有料記事のみ対象
        $paidArticles = Article::where('is_paid', true)
            ->where('created_at', '>=', Carbon::create(2024, 6, 1))
            ->orderBy('created_at')
            ->get();

        if ($paidArticles->isEmpty()) {
            $this->command->info('2024年6月以降の有料記事が存在しないため、決済データをスキップします');

            return;
        }

        // ユーザー（購入者）を取得（投稿なしユーザーも含む）
        $buyers = User::where('role', 'author')->get();

        if ($buyers->isEmpty()) {
            $this->command->info('購入者となるユーザーが存在しないため、決済データをスキップします');

            return;
        }

        // 手数料設定を確認
        $commissionSettings = CommissionSetting::orderBy('created_at')->get();

        $paymentCount = 0;
        $commissionBoundaryTests = 0;

        foreach ($paidArticles as $articleIndex => $article) {
            // 記事投稿から1週間以内の購入データを作成
            $articleDate = Carbon::parse($article->created_at);
            $purchaseWindowStart = $articleDate;
            $purchaseWindowEnd = $articleDate->copy()->addWeek();

            // 各記事に対して固定アルゴリズムで購入者を設定（記事人気度に応じて0-8人）
            $popularity = $this->calculateArticlePopularity($article, $articleIndex);
            $purchaseCount = min(8, max(0, $popularity));

            // 手数料境界テスト: 特定の記事で手数料変更前後の購入を作成
            $isCommissionBoundaryTest = ($articleIndex % 50 === 0) && $commissionBoundaryTests < 5;

            for ($i = 0; $i < $purchaseCount; $i++) {
                $buyerIndex = ($articleIndex * 7 + $i * 3) % $buyers->count(); // 固定アルゴリズム
                $buyer = $buyers[$buyerIndex];

                // 自分の記事は購入できない
                if ($buyer->id === $article->user_id) {
                    $buyerIndex = ($buyerIndex + 1) % $buyers->count();
                    $buyer = $buyers[$buyerIndex];
                }

                // 重複購入をチェック
                if (Payment::where('user_id', $buyer->id)->where('article_id', $article->id)->exists()) {
                    continue;
                }

                // 購入日時を記事投稿から1週間以内に固定設定
                $dayOffset = ($i % 7); // 0-6日の範囲
                $hourOffset = (8 + ($i * 3) % 12); // 8-19時の範囲
                $purchaseDate = $purchaseWindowStart->copy()->addDays($dayOffset)->setTime($hourOffset, 0);

                // 手数料境界テスト：手数料変更タイミング前後で購入
                if ($isCommissionBoundaryTest && $i < 2) {
                    $commissionChangeDate = Carbon::create(2024, 12, 1); // 仮の手数料変更日
                    if ($i === 0) {
                        // 変更前購入
                        $purchaseDate = $commissionChangeDate->copy()->subDays(1)->setTime(14, 0);
                    } else {
                        // 変更後購入
                        $purchaseDate = $commissionChangeDate->copy()->addDays(1)->setTime(14, 0);
                    }
                    $commissionBoundaryTests++;
                }

                // 購入日が未来日の場合は現在日時に調整
                if ($purchaseDate->gt(now())) {
                    $purchaseDate = now()->subDays(rand(1, 30));
                }

                Payment::create([
                    'user_id' => $buyer->id,
                    'article_id' => $article->id,
                    'amount' => $article->price,
                    'transaction_id' => 'txn_fixed_'.str_pad($articleIndex, 4, '0', STR_PAD_LEFT).'_'.str_pad($i, 2, '0', STR_PAD_LEFT),
                    'status' => 'success',
                    'paid_at' => $purchaseDate,
                    'created_at' => $purchaseDate,
                    'updated_at' => $purchaseDate,
                ]);

                $paymentCount++;
            }
        }

        $this->command->info("決済データを作成しました: {$paymentCount}件");
        $this->command->info("手数料境界テスト: {$commissionBoundaryTests}件");

        // 統計情報を表示
        $this->showPaymentStatistics();
    }

    /**
     * 記事の人気度を計算（固定アルゴリズム）
     */
    private function calculateArticlePopularity($article, $index): int
    {
        // 価格帯による基本人気度
        $basePopularity = 0;
        if ($article->price <= 500) {
            $basePopularity = 6; // 低価格は人気
        } elseif ($article->price <= 1000) {
            $basePopularity = 4; // 中価格
        } else {
            $basePopularity = 2; // 高価格は購入者少ない
        }

        // 投稿者のアクティビティレベルによる補正
        $authorEmailSuffix = substr($article->user->email, 0, 1);
        $authorPopularityBonus = 0;

        // 固定パターンでの人気度ボーナス
        if (in_array($authorEmailSuffix, ['t', 's', 'i'])) { // 田中、佐藤、伊藤等
            $authorPopularityBonus = 2;
        } elseif (in_array($authorEmailSuffix, ['y', 'n', 'm'])) { // 山田、中村、松本等
            $authorPopularityBonus = 1;
        }

        // インデックスベースのランダム要素（固定）
        $randomFactor = ($index % 5) - 2; // -2 to +2の範囲

        return max(0, $basePopularity + $authorPopularityBonus + $randomFactor);
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

        // 月別統計（直近6ヶ月）
        $this->command->info('=== 月別統計 ===');
        for ($i = 0; $i < 6; $i++) {
            $month = now()->subMonths($i);
            $monthlyPayments = Payment::whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->count();
            $monthlyRevenue = Payment::whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->sum('amount');

            if ($monthlyPayments > 0) {
                $this->command->info("{$month->format('Y-m')}: {$monthlyPayments}件, ¥".number_format($monthlyRevenue));
            }
        }

        // 手数料境界テスト確認
        $commissionTestPayments = Payment::where('transaction_id', 'like', 'txn_fixed_%')
            ->whereIn('paid_at', [
                Carbon::create(2024, 11, 30, 14, 0),
                Carbon::create(2024, 12, 2, 14, 0),
            ])
            ->count();

        if ($commissionTestPayments > 0) {
            $this->command->info('=== 手数料境界テストデータ ===');
            $this->command->info("手数料変更前後の購入: {$commissionTestPayments}件");
        }

        // 期間内購入テスト確認
        $weeklyPurchases = Payment::join('articles', 'payments.article_id', '=', 'articles.id')
            ->whereRaw('payments.paid_at BETWEEN articles.created_at AND DATE_ADD(articles.created_at, INTERVAL 7 DAY)')
            ->count();

        $this->command->info('=== 購入期間テスト ===');
        $this->command->info("記事投稿1週間以内購入: {$weeklyPurchases}件 / {$totalPayments}件");
        $this->command->info('適合率: '.round(($weeklyPurchases / max(1, $totalPayments)) * 100, 1).'%');
    }
}
