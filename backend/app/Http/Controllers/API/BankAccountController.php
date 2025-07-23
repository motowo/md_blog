<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
{
    /**
     * ユーザーの振込口座一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $bankAccounts = $request->user()->bankAccounts()->latest()->get();

        return response()->json([
            'data' => $bankAccounts,
        ]);
    }

    /**
     * 振込口座を作成
     */
    public function store(Request $request): JsonResponse
    {
        // 1口座制限の確認
        if ($request->user()->bankAccounts()->count() >= 1) {
            return response()->json([
                'message' => '登録できる振込口座は1件までです。既存の口座を削除してから新しい口座を登録してください。',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'required|string|max:255',
            'account_type' => 'required|in:普通,当座',
            'account_number' => 'required|string|regex:/^\d{6,8}$/',
            'account_holder_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $validator->errors(),
            ], 422);
        }

        // 既存のアクティブな口座を非アクティブにする（万が一のため）
        $request->user()->bankAccounts()->update(['is_active' => false]);

        $bankAccount = $request->user()->bankAccounts()->create([
            'bank_name' => $request->bank_name,
            'branch_name' => $request->branch_name,
            'account_type' => $request->account_type,
            'account_number' => $request->account_number,
            'account_holder_name' => $request->account_holder_name,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => '振込口座を登録しました',
            'data' => $bankAccount,
        ], 201);
    }

    /**
     * 振込口座を更新
     */
    public function update(Request $request, $id): JsonResponse
    {
        $bankAccount = $request->user()->bankAccounts()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'bank_name' => 'sometimes|string|max:255',
            'branch_name' => 'sometimes|string|max:255',
            'account_type' => 'sometimes|in:普通,当座',
            'account_number' => 'sometimes|string|regex:/^\d{6,8}$/',
            'account_holder_name' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bankAccount->update($request->only([
            'bank_name',
            'branch_name',
            'account_type',
            'account_number',
            'account_holder_name',
        ]));

        return response()->json([
            'message' => '振込口座を更新しました',
            'data' => $bankAccount,
        ]);
    }

    /**
     * 振込口座を削除
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $bankAccount = $request->user()->bankAccounts()->findOrFail($id);

        $bankAccount->delete();

        return response()->json([
            'message' => '振込口座を削除しました',
        ]);
    }

    /**
     * 振込口座をアクティブにする
     */
    public function activate(Request $request, $id): JsonResponse
    {
        $bankAccount = $request->user()->bankAccounts()->findOrFail($id);

        // 他のアクティブな口座を非アクティブにする
        $request->user()->bankAccounts()->where('id', '!=', $id)->update(['is_active' => false]);

        $bankAccount->update(['is_active' => true]);

        return response()->json([
            'message' => '振込口座をアクティブにしました',
            'data' => $bankAccount,
        ]);
    }
}
