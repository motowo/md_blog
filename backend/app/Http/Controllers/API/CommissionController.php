<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CommissionSetting;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CommissionController extends Controller
{
    protected $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    /**
     * 手数料設定の一覧を取得
     */
    public function index(): JsonResponse
    {
        $settings = CommissionSetting::orderBy('applicable_from', 'desc')->get();

        return response()->json([
            'data' => $settings
        ]);
    }

    /**
     * 新しい手数料設定を作成
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rate' => 'required|numeric|min:0|max:100',
            'applicable_from_month' => 'required|date_format:Y-m',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        return \DB::transaction(function () use ($request) {
            // 指定された月の1日を日付文字列として設定
            $applicableFrom = $request->applicable_from_month . '-01';

            // 既存の有効な手数料設定（適用終了日がnull）を取得
            $existingSetting = CommissionSetting::where('is_active', true)
                ->whereNull('applicable_to')
                ->first();

            // 新しい設定を作成
            $setting = CommissionSetting::create([
                'rate' => $request->rate,
                'applicable_from' => $applicableFrom,
                'applicable_to' => null,
                'description' => $request->description,
                'is_active' => true,
            ]);

            // 既存設定の適用終了日を新しい設定の前日に設定
            if ($existingSetting) {
                // 新しい設定の前日を計算
                $startDate = \Carbon\Carbon::createFromFormat('Y-m-d', $applicableFrom);
                $applicableToForExisting = $startDate->subDay()->format('Y-m-d');

                $existingSetting->update([
                    'applicable_to' => $applicableToForExisting
                ]);
            }

            return response()->json([
                'message' => '手数料設定を作成しました',
                'data' => $setting
            ], 201);
        });
    }

    /**
     * 手数料設定を更新
     */
    public function update(Request $request, $id): JsonResponse
    {
        $setting = CommissionSetting::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rate' => 'sometimes|numeric|min:0|max:100',
            'applicable_to' => 'nullable|date|after:applicable_from',
            'description' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $setting->update($request->only(['rate', 'applicable_to', 'description', 'is_active']));

        return response()->json([
            'message' => '手数料設定を更新しました',
            'data' => $setting
        ]);
    }

    /**
     * 手数料設定を削除
     */
    public function destroy($id): JsonResponse
    {
        $setting = CommissionSetting::findOrFail($id);
        
        // 未来適用の設定のみ削除可能
        $today = now()->format('Y-m-d');
        if ($setting->applicable_from <= $today) {
            return response()->json([
                'message' => '過去または現在有効な設定は削除できません'
            ], 403);
        }
        
        return \DB::transaction(function () use ($setting) {
            // 削除する設定の前の設定を取得
            $previousSetting = CommissionSetting::where('is_active', true)
                ->where('applicable_to', \Carbon\Carbon::parse($setting->applicable_from)->subDay()->format('Y-m-d'))
                ->first();
            
            // 削除する設定の次の設定を取得
            $nextSetting = CommissionSetting::where('is_active', true)
                ->where('applicable_from', '>', $setting->applicable_from)
                ->orderBy('applicable_from')
                ->first();
            
            // 前の設定の終了日を調整
            if ($previousSetting) {
                if ($nextSetting) {
                    // 次の設定がある場合は、その前日まで延長
                    $previousSetting->update([
                        'applicable_to' => \Carbon\Carbon::parse($nextSetting->applicable_from)->subDay()->format('Y-m-d')
                    ]);
                } else {
                    // 次の設定がない場合は無期限に
                    $previousSetting->update([
                        'applicable_to' => null
                    ]);
                }
            }
            
            // 設定を削除
            $setting->delete();
            
            return response()->json([
                'message' => '手数料設定を削除しました'
            ]);
        });
    }


    /**
     * 月次支払い処理を実行
     */
    public function processMonthlyPayouts(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'year_month' => 'required|date_format:Y-m',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->commissionService->processMonthlyPayouts($request->year_month);

            // 詳細な処理結果メッセージを作成
            $messageDetails = [];
            
            if ($result['newly_created_count'] > 0) {
                $messageDetails[] = "{$result['newly_created_count']}件の新規支払い情報を作成";
            }
            
            if ($result['updated_count'] > 0) {
                $messageDetails[] = "{$result['updated_count']}件の未払い支払い情報を更新";
            }
            
            if ($result['skipped_count'] > 0) {
                $messageDetails[] = "{$result['skipped_count']}件の支払済み情報をスキップ";
            }
            
            $detailMessage = empty($messageDetails) ? '処理対象がありませんでした' : implode('、', $messageDetails);
            $actionMessage = ($result['newly_created_count'] > 0 || $result['updated_count'] > 0) 
                ? '「未払い一覧」タブで確認し、支払い確定処理を行ってください。' 
                : '';

            return response()->json([
                'message' => "月次支払い処理が完了しました。{$detailMessage}。{$actionMessage}",
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '処理中にエラーが発生しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 未払いの支払い一覧を取得
     */
    public function getPendingPayouts(): JsonResponse
    {
        $payouts = \App\Models\Payout::with('user')
            ->unpaid()
            ->orderBy('period', 'desc')
            ->get();

        return response()->json([
            'data' => $payouts
        ]);
    }

    /**
     * 振込履歴の月次サマリを取得
     */
    public function getMonthlySummary(): JsonResponse
    {
        $summaries = \App\Models\Payout::with('user')
            ->selectRaw('
                period,
                COUNT(*) as total_count,
                COUNT(CASE WHEN status = "paid" THEN 1 END) as paid_count,
                COUNT(CASE WHEN status = "unpaid" THEN 1 END) as unpaid_count,
                COUNT(CASE WHEN status = "failed" THEN 1 END) as failed_count,
                SUM(amount) as total_amount,
                SUM(CASE WHEN status = "paid" THEN amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = "unpaid" THEN amount ELSE 0 END) as unpaid_amount,
                SUM(gross_amount) as total_gross_amount,
                SUM(commission_amount) as total_commission_amount,
                AVG(commission_rate) as avg_commission_rate
            ')
            ->groupBy('period')
            ->orderBy('period', 'desc')
            ->get();

        return response()->json([
            'data' => $summaries
        ]);
    }

    /**
     * 指定月の振込詳細を取得
     */
    public function getMonthlyDetails(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|date_format:Y-m',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $payouts = \App\Models\Payout::with('user')
            ->where('period', $request->period)
            ->orderBy('created_at', 'desc')
            ->get();

        // 振込日を計算（翌月の15日）
        $periodDate = \Carbon\Carbon::createFromFormat('Y-m', $request->period);
        $payoutDate = $periodDate->copy()->addMonth()->day(15);
        
        // 土日の場合は前の平日に調整
        while ($payoutDate->isWeekend()) {
            $payoutDate->subDay();
        }

        return response()->json([
            'data' => $payouts,
            'payout_date' => $payoutDate->format('Y-m-d'),
            'payout_date_formatted' => $payoutDate->format('Y年n月j日'),
        ]);
    }

    /**
     * 支払いを確定する
     */
    public function confirmPayout(Request $request, $id): JsonResponse
    {
        $payout = \App\Models\Payout::findOrFail($id);

        if ($payout->status !== 'unpaid') {
            return response()->json([
                'message' => 'この支払いは既に処理済みです'
            ], 400);
        }

        $payout->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);

        return response()->json([
            'message' => '支払いを確定しました',
            'data' => $payout->load('user')
        ]);
    }

    /**
     * 複数の支払いを一括確定する
     */
    public function bulkConfirmPayouts(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payout_ids' => 'required|array',
            'payout_ids.*' => 'integer|exists:payouts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $payouts = \App\Models\Payout::whereIn('id', $request->payout_ids)
            ->where('status', 'unpaid')
            ->get();

        $updatedCount = $payouts->count();

        \App\Models\Payout::whereIn('id', $request->payout_ids)
            ->where('status', 'unpaid')
            ->update([
                'status' => 'paid',
                'paid_at' => now()
            ]);

        return response()->json([
            'message' => "{$updatedCount}件の支払いを確定しました"
        ]);
    }
}
