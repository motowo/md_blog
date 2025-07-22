<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Mock決済のテストカード番号と結果のマッピング
     */
    private const MOCK_CARDS = [
        '4242424242424242' => 'success',      // 成功
        '4000000000000002' => 'card_declined', // カード拒否
        '4000000000009995' => 'insufficient_funds', // 残高不足
    ];

    /**
     * 記事を購入する（Mock決済）
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'article_id' => ['required', 'exists:articles,id'],
            'use_saved_card' => ['sometimes', 'boolean'],
            'card_number' => ['required_without:use_saved_card', 'string', 'regex:/^\d{16}$/'],
            'card_name' => ['required_without:use_saved_card', 'string', 'max:255'],
            'expiry_month' => ['required_without:use_saved_card', 'string', 'regex:/^\d{2}$/'],
            'expiry_year' => ['required_without:use_saved_card', 'string', 'regex:/^\d{4}$/'],
            'cvv' => ['required', 'string', 'regex:/^\d{3}$/'],
        ]);

        $article = Article::findOrFail($validated['article_id']);

        // 記事の購入可能性をチェック
        if (! $article->is_paid) {
            return response()->json([
                'errors' => ['article_id' => ['無料記事は購入できません。']],
            ], 422);
        }

        if ($article->status !== 'published') {
            return response()->json([
                'errors' => ['article_id' => ['公開されていない記事は購入できません。']],
            ], 422);
        }

        // 既に購入済みかチェック
        $existingPayment = Payment::where('user_id', auth()->id())
            ->where('article_id', $article->id)
            ->where('status', 'success')
            ->first();

        if ($existingPayment) {
            return response()->json([
                'message' => 'この記事は既に購入済みです。',
            ], 422);
        }

        // 登録済みカードを使用する場合
        if ($request->input('use_saved_card')) {
            $creditCard = auth()->user()->creditCard;
            
            if (!$creditCard) {
                return response()->json([
                    'errors' => ['card' => ['クレジットカードが登録されていません。']],
                ], 422);
            }
            
            $cardNumber = $creditCard->card_number;
        } else {
            $cardNumber = $validated['card_number'];
        }

        // Mock決済処理
        $cardResult = self::MOCK_CARDS[$cardNumber] ?? 'success';
        $transactionId = 'MOCK_'.Str::upper(Str::random(16));

        DB::beginTransaction();
        try {
            $payment = Payment::create([
                'user_id' => auth()->id(),
                'article_id' => $article->id,
                'amount' => $article->price,
                'status' => $cardResult === 'success' ? 'success' : 'failed',
                'transaction_id' => $transactionId,
                'paid_at' => $cardResult === 'success' ? now() : null,
            ]);

            if ($cardResult !== 'success') {
                DB::commit(); // 失敗レコードも保存する

                $errorMessages = [
                    'card_declined' => 'カードが拒否されました。別のカードをお試しください。',
                    'insufficient_funds' => 'カードの残高が不足しています。',
                ];

                return response()->json([
                    'message' => $errorMessages[$cardResult] ?? '決済処理中にエラーが発生しました。',
                ], 400);
            }

            DB::commit();

            return response()->json([
                'data' => [
                    'id' => $payment->id,
                    'article_id' => $payment->article_id,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'transaction_id' => $payment->transaction_id,
                    'paid_at' => $payment->paid_at->toIso8601String(),
                ],
                'message' => '記事の購入が完了しました。',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => '決済処理中にエラーが発生しました。',
            ], 500);
        }
    }

    /**
     * 決済履歴を取得する
     */
    public function index(Request $request)
    {
        $payments = Payment::with('article:id,title,price')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }
}
