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
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if ($request->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
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
            'applicable_from' => 'required|date|after_or_equal:today',
            'applicable_to' => 'nullable|date|after:applicable_from',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // 重複する期間がないかチェック
        $existingSettings = CommissionSetting::where('is_active', true)
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('applicable_from', '<=', $request->applicable_from)
                      ->where(function ($q2) use ($request) {
                          $q2->whereNull('applicable_to')
                             ->orWhere('applicable_to', '>=', $request->applicable_from);
                      });
                });
            })
            ->exists();

        if ($existingSettings) {
            return response()->json([
                'message' => '指定された期間に既に有効な手数料設定が存在します'
            ], 409);
        }

        $setting = CommissionSetting::create([
            'rate' => $request->rate,
            'applicable_from' => $request->applicable_from,
            'applicable_to' => $request->applicable_to,
            'description' => $request->description,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => '手数料設定を作成しました',
            'data' => $setting
        ], 201);
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
     * 手数料レポートを取得
     */
    public function report(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $report = $this->commissionService->calculateCommissionRevenue(
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'data' => $report
        ]);
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

            return response()->json([
                'message' => '月次支払い処理が完了しました',
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
