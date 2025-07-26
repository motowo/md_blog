<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CreditCard;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;

class CreditCardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // テスト用クレジットカードデータを作成
        $users = User::whereIn('email', [
            'tanaka@example.com',
            'sato@example.com',
        ])->get();

        foreach ($users as $user) {
            // 既存のクレジットカードがあるかチェック
            $existingCard = CreditCard::where('user_id', $user->id)->first();

            if (! $existingCard) {
                // 各ユーザーにクレジットカードを1枚登録
                $creditCard = CreditCard::create([
                    'user_id' => $user->id,
                    'card_number' => '4242424242424242', // テスト用カード
                    'card_name' => $user->name,
                    'expiry_month' => '12',
                    'expiry_year' => '2027',
                    'is_default' => true,
                ]);

                echo "クレジットカードを作成しました: {$user->name} ({$user->email})\n";
            } else {
                echo "クレジットカードは既に登録済みです: {$user->name} ({$user->email})\n";
            }
        }

        // 田中太郎に決済履歴を追加（サンプル購入）
        $tanakaUser = User::where('email', 'tanaka@example.com')->first();
        $sampleArticle = Article::where('is_paid', true)->first();

        if ($tanakaUser && $sampleArticle) {
            // 既存の決済履歴をチェック
            $existingPayment = Payment::where('user_id', $tanakaUser->id)
                ->where('article_id', $sampleArticle->id)
                ->first();

            if (! $existingPayment) {
                $commissionAmount = (int) ($sampleArticle->price * 0.10); // 10%手数料
                $payoutAmount = $sampleArticle->price - $commissionAmount;

                Payment::create([
                    'user_id' => $tanakaUser->id,
                    'article_id' => $sampleArticle->id,
                    'amount' => $sampleArticle->price,
                    'commission_amount' => $commissionAmount,
                    'payout_amount' => $payoutAmount,
                    'status' => 'completed',
                    'payment_method' => 'credit_card',
                    'transaction_id' => 'test_fixed_transaction_001',
                    'paid_at' => now(),
                    'payout_completed_at' => now()->addDays(7),
                ]);

                echo "決済履歴を作成しました: {$tanakaUser->name} が「{$sampleArticle->title}」を購入\n";
            } else {
                echo "決済履歴は既に存在します: {$tanakaUser->name} が「{$sampleArticle->title}」を購入済み\n";
            }
        }

        echo "=== クレジットカード・決済データ作成完了 ===\n";
        echo "クレジットカード登録済み: 2名（田中太郎・佐藤花子）\n";
        echo "決済履歴: 1件（田中太郎による購入済み記事あり）\n";
        echo "テスト用カード番号: 4242424242424242 (VISA)\n";
    }
}
