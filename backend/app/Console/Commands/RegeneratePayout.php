<?php

namespace App\Console\Commands;

use App\Models\Payout;
use App\Services\CommissionService;
use Illuminate\Console\Command;

class RegeneratePayout extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payout:regenerate {--month=all : 特定の月のみ再生成 (例: 2025-07)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'タイムゾーン修正に対応した振込データを再生成します';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('振込データの再生成を開始します...');
        
        $month = $this->option('month');
        
        if ($month !== 'all') {
            // 特定の月のみ再生成
            $this->regenerateMonth($month);
        } else {
            // 既存の振込データから月を特定して全て再生成
            $this->regenerateAll();
        }
        
        $this->info('振込データの再生成が完了しました');
    }
    
    /**
     * 特定の月の振込データを再生成
     */
    private function regenerateMonth(string $yearMonth): void
    {
        $this->info("月 {$yearMonth} の振込データを再生成中...");
        
        // 該当月の既存の振込データを削除
        Payout::where('period', $yearMonth)->delete();
        
        // CommissionServiceを使用して再生成
        $commissionService = app(CommissionService::class);
        $result = $commissionService->processMonthlyPayouts($yearMonth);
        
        if ($result['processed_count'] > 0) {
            $this->info("  → {$result['processed_count']}件の振込データを作成しました");
        } else {
            $this->warn("  → 該当する売上データがありませんでした");
        }
    }
    
    /**
     * すべての振込データを再生成
     */
    private function regenerateAll(): void
    {
        // 既存の振込データから期間を特定
        $periods = Payout::distinct()->pluck('period')->sort()->values();
        
        if ($periods->isEmpty()) {
            $this->warn('既存の振込データが見つかりません');
            return;
        }
        
        $this->info('既存の期間: ' . $periods->implode(', '));
        
        // 全データを削除
        $this->info('既存の振込データを削除中...');
        Payout::truncate();
        
        // 各期間ごとに再生成
        $commissionService = app(CommissionService::class);
        
        foreach ($periods as $period) {
            $this->regenerateMonth($period);
        }
        
        // 1000円未満繰越ルールを適用
        $this->info('繰越ルールを適用中...');
        $this->applyCarryOverRule();
    }
    
    /**
     * 1000円未満繰越ルールを適用
     */
    private function applyCarryOverRule(): void
    {
        // ユーザーごとに未払い振込データを処理
        $userIds = Payout::where('status', 'unpaid')
            ->distinct()
            ->pluck('user_id');
            
        foreach ($userIds as $userId) {
            // 該当ユーザーの未払い振込を期間順に取得
            $payouts = Payout::where('user_id', $userId)
                ->where('status', 'unpaid')
                ->orderBy('period')
                ->get();
                
            $carryOverAmount = 0;
            
            foreach ($payouts as $payout) {
                $totalAmount = $payout->amount + $carryOverAmount;
                
                if ($totalAmount >= 1000) {
                    // 1000円以上なので振込対象
                    $payout->update([
                        'amount' => $totalAmount,
                        'status' => 'unpaid' // 振込待ち状態を維持
                    ]);
                    
                    $carryOverAmount = 0;
                } else {
                    // 1000円未満なので繰越
                    $carryOverAmount = $totalAmount;
                }
            }
        }
        
        $this->info('繰越ルールの適用が完了しました');
    }
}