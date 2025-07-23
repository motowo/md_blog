<?php

namespace App\Http\Controllers\API;

use App\Helpers\TimeZoneHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\PayoutResource;
use App\Http\Resources\SaleResource;
use App\Models\CommissionSetting;
use App\Models\Payment;
use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SalesController extends Controller
{
    /**
     * 売上履歴を取得
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // 共通の条件を定義
        $commonConditions = function ($query) use ($user, $request) {
            $query->join('articles', 'payments.article_id', '=', 'articles.id')
                ->where('articles.user_id', $user->id)
                ->where('payments.status', 'success');

            if ($request->has('month')) {
                $month = $request->input('month'); // YYYY-MM形式
                // JST基準での正確な月範囲フィルタリング
                [$sql, $startUTC, $endUTC] = TimeZoneHelper::monthRangeFilterSql('payments.paid_at', $month);
                $query->whereRaw($sql, [$startUTC, $endUTC]);
            }
        };

        // 集計情報（全データ対象）
        $summaryQuery = Payment::query();
        $commonConditions($summaryQuery);

        $summaryData = $summaryQuery->selectRaw('
            SUM(payments.amount) as total_sales,
            COUNT(payments.id) as total_count
        ')->first();

        $summary = [
            'total_sales' => $summaryData->total_sales ?? 0,
            'total_count' => $summaryData->total_count ?? 0,
        ];

        if ($summary['total_sales'] > 0) {
            // 平均手数料率を計算
            $avgCommissionRate = 10; // デフォルト値
            $summary['total_commission'] = $summary['total_sales'] * ($avgCommissionRate / 100);
            $summary['total_net'] = $summary['total_sales'] - $summary['total_commission'];
        } else {
            $summary['total_commission'] = 0;
            $summary['total_net'] = 0;
        }

        // ページネーション用クエリ（表示用）
        $query = Payment::query()
            ->select([
                'payments.*',
                'articles.title as article_title',
                'articles.price as article_price',
            ])
            ->with(['user', 'article']);

        $commonConditions($query);

        // ページネーション（pageパラメータを明示的に指定）
        $page = $request->input('page', 1);
        $sales = $query->orderBy('payments.paid_at', 'desc')->paginate(20, ['*'], 'page', $page);

        // 各売上に手数料情報を追加
        $sales->getCollection()->transform(function ($sale) {
            // 売上時点の手数料率を取得
            $commissionSetting = CommissionSetting::getActiveSettingForDate($sale->paid_at);
            $commissionRate = $commissionSetting ? $commissionSetting->rate : 10;

            $sale->commission_rate = $commissionRate;
            $sale->commission_amount = $sale->amount * ($commissionRate / 100);
            $sale->net_amount = $sale->amount - $sale->commission_amount;

            return $sale;
        });

        return response()->json([
            'data' => [
                'data' => SaleResource::collection($sales->items()),
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
            'summary' => $summary,
        ]);
    }

    /**
     * 月別売上集計を取得
     */
    public function monthlySummary(Request $request)
    {
        $user = Auth::user();

        $monthlySales = Payment::query()
            ->join('articles', 'payments.article_id', '=', 'articles.id')
            ->where('articles.user_id', $user->id)
            ->where('payments.status', 'success')
            ->selectRaw('
                '.TimeZoneHelper::monthFilterSql('payments.paid_at').' as month,
                COUNT(*) as sales_count,
                SUM(payments.amount) as total_amount
            ')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12) // 直近12ヶ月
            ->get();

        // 各月に手数料情報を追加
        $monthlySales->transform(function ($month) {
            // その月の手数料率を取得（月初日で判定）
            $date = $month->month.'-01';
            $commissionSetting = CommissionSetting::getActiveSettingForDate($date);
            $commissionRate = $commissionSetting ? $commissionSetting->rate : 10;

            $month->commission_rate = $commissionRate;
            $month->commission_amount = $month->total_amount * ($commissionRate / 100);
            $month->net_amount = $month->total_amount - $month->commission_amount;

            return $month;
        });

        return response()->json([
            'data' => $monthlySales,
        ]);
    }

    /**
     * 振込履歴を取得
     */
    public function payouts(Request $request)
    {
        $user = Auth::user();

        $payouts = Payout::where('user_id', $user->id)
            ->orderBy('period', 'desc')
            ->paginate(12);

        // 集計情報
        $summary = [
            'total_gross' => Payout::where('user_id', $user->id)->sum('gross_amount'),
            'total_commission' => Payout::where('user_id', $user->id)->sum('commission_amount'),
            'total_net' => Payout::where('user_id', $user->id)->sum('amount'),
            'total_paid' => Payout::where('user_id', $user->id)->where('status', 'paid')->sum('amount'),
            'pending_amount' => Payout::where('user_id', $user->id)->where('status', 'unpaid')->sum('amount'),
        ];

        return response()->json([
            'data' => [
                'data' => PayoutResource::collection($payouts->items()),
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'per_page' => $payouts->perPage(),
                'total' => $payouts->total(),
            ],
            'summary' => $summary,
        ]);
    }

    /**
     * 振込予定を取得（繰越含む）
     */
    public function payoutSchedule(Request $request)
    {
        $user = Auth::user();

        // 未払いの振込データを取得
        $unpaidPayouts = Payout::where('user_id', $user->id)
            ->where('status', 'unpaid')
            ->orderBy('period', 'asc')
            ->get();

        // 繰越計算
        $carryOverAmount = 0;
        $schedule = [];

        foreach ($unpaidPayouts as $payout) {
            $totalAmount = $payout->amount + $carryOverAmount;

            if ($totalAmount >= 1000) {
                // 振込予定日を計算（翌月15日、営業日調整）
                $paymentDate = $this->calculatePaymentDate($payout->period);

                $schedule[] = [
                    'period' => $payout->period,
                    'payout_amount' => $payout->amount,
                    'carry_over_amount' => $carryOverAmount,
                    'total_amount' => $totalAmount,
                    'scheduled_date' => $paymentDate,
                    'status' => 'scheduled',
                ];

                $carryOverAmount = 0;
            } else {
                // 1000円未満は繰越
                $schedule[] = [
                    'period' => $payout->period,
                    'payout_amount' => $payout->amount,
                    'carry_over_amount' => $carryOverAmount,
                    'total_amount' => $totalAmount,
                    'scheduled_date' => null,
                    'status' => 'carry_over',
                ];

                $carryOverAmount = $totalAmount;
            }
        }

        return response()->json([
            'data' => $schedule,
            'carry_over_balance' => $carryOverAmount,
        ]);
    }

    /**
     * 振込予定日を計算（翌月15日、営業日調整）
     */
    private function calculatePaymentDate($period)
    {
        // period形式: YYYY-MM
        $year = substr($period, 0, 4);
        $month = substr($period, 5, 2);

        // 翌月を計算
        $paymentMonth = intval($month) + 1;
        $paymentYear = intval($year);

        if ($paymentMonth > 12) {
            $paymentMonth = 1;
            $paymentYear++;
        }

        // 15日の日付を作成
        $paymentDate = sprintf('%04d-%02d-15', $paymentYear, $paymentMonth);

        // 営業日調整（簡易版：土日のみ考慮）
        $timestamp = strtotime($paymentDate);
        $dayOfWeek = date('w', $timestamp);

        // 土曜日（6）の場合は金曜日に
        if ($dayOfWeek == 6) {
            $timestamp = strtotime('-1 day', $timestamp);
        }
        // 日曜日（0）の場合は金曜日に
        elseif ($dayOfWeek == 0) {
            $timestamp = strtotime('-2 days', $timestamp);
        }

        // TODO: 日本の祝日API連携で祝日も考慮する

        return date('Y-m-d', $timestamp);
    }
}
