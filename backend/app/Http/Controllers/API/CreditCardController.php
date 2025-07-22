<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CreditCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditCardController extends Controller
{
    /**
     * 登録されているクレジットカード情報を取得
     */
    public function show()
    {
        $creditCard = Auth::user()->creditCard;

        if (! $creditCard) {
            return response()->json([
                'data' => null,
                'message' => 'クレジットカードが登録されていません',
            ], 200);
        }

        return response()->json([
            'data' => [
                'id' => $creditCard->id,
                'card_brand' => $creditCard->card_brand,
                'last_four' => $creditCard->last_four,
                'masked_card_number' => $creditCard->masked_card_number,
                'card_name' => $creditCard->card_name,
                'expiry_month' => $creditCard->expiry_month,
                'expiry_year' => $creditCard->expiry_year,
                'is_default' => $creditCard->is_default,
                'created_at' => $creditCard->created_at,
                'updated_at' => $creditCard->updated_at,
            ],
        ]);
    }

    /**
     * クレジットカードを登録・更新
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'card_number' => ['required', 'string', 'regex:/^\d{16}$/'],
            'card_name' => ['required', 'string', 'max:255'],
            'expiry_month' => ['required', 'string', 'regex:/^\d{2}$/'],
            'expiry_year' => ['required', 'string', 'regex:/^\d{4}$/'],
            'cvv' => ['required', 'string', 'regex:/^\d{3}$/'], // CVVは保存しないが検証は行う
        ]);

        // 有効期限の検証
        $currentYear = date('Y');
        $currentMonth = date('m');
        if ($validated['expiry_year'] < $currentYear ||
            ($validated['expiry_year'] == $currentYear && $validated['expiry_month'] < $currentMonth)) {
            return response()->json([
                'errors' => ['expiry_month' => ['カードの有効期限が切れています']],
            ], 422);
        }

        // 既存のカードがあれば更新、なければ新規作成
        $creditCard = Auth::user()->creditCard ?? new CreditCard(['user_id' => Auth::id()]);

        $creditCard->fill([
            'card_number' => $validated['card_number'],
            'card_name' => $validated['card_name'],
            'expiry_month' => $validated['expiry_month'],
            'expiry_year' => $validated['expiry_year'],
        ]);

        $creditCard->save();

        return response()->json([
            'data' => [
                'id' => $creditCard->id,
                'card_brand' => $creditCard->card_brand,
                'last_four' => $creditCard->last_four,
                'masked_card_number' => $creditCard->masked_card_number,
                'card_name' => $creditCard->card_name,
                'expiry_month' => $creditCard->expiry_month,
                'expiry_year' => $creditCard->expiry_year,
                'is_default' => $creditCard->is_default,
                'created_at' => $creditCard->created_at,
                'updated_at' => $creditCard->updated_at,
            ],
            'message' => 'クレジットカードを登録しました',
        ], 201);
    }

    /**
     * クレジットカードを削除
     */
    public function destroy()
    {
        $creditCard = Auth::user()->creditCard;

        if (! $creditCard) {
            return response()->json([
                'message' => 'クレジットカードが登録されていません',
            ], 404);
        }

        $creditCard->delete();

        return response()->json([
            'message' => 'クレジットカードを削除しました',
        ]);
    }
}
