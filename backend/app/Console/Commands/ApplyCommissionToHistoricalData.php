<?php

namespace App\Console\Commands;

use App\Services\CommissionService;
use Illuminate\Console\Command;

class ApplyCommissionToHistoricalData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'commission:apply-historical';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '既存の支払いデータに手数料を適用します';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('既存データへの手数料適用を開始します...');

        $commissionService = app(CommissionService::class);

        try {
            $result = $commissionService->applyCommissionToHistoricalData();

            if ($result['success']) {
                $this->info('✅ 手数料適用が完了しました');
                $this->info("更新されたレコード数: {$result['updated_count']}件");
            } else {
                $this->error('❌ 手数料適用に失敗しました');
            }
        } catch (\Exception $e) {
            $this->error('エラーが発生しました: '.$e->getMessage());

            return 1;
        }

        return 0;
    }
}
