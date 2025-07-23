<?php

namespace Database\Seeders;

use App\Models\CommissionSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CommissionSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存のレコードがある場合は削除して再作成
        CommissionSetting::truncate();
        
        // 手数料設定の履歴を作成（タイムゾーンを意識しないシンプルな日付）
        
        // 1. 初期手数料設定（10%）- 1970年1月1日から2023年12月31日まで
        CommissionSetting::create([
            'rate' => 10.00,
            'applicable_from' => '1970-01-01',
            'applicable_to' => '2023-12-31',
            'is_active' => true,
            'description' => '初期手数料設定（10%） - システム開始時から適用',
        ]);
        
        // 2. 手数料変更（5%）- 2024年1月1日から2024年12月31日まで
        CommissionSetting::create([
            'rate' => 5.00,
            'applicable_from' => '2024-01-01',
            'applicable_to' => '2024-12-31',
            'is_active' => true,
            'description' => '手数料引き下げ（5%） - 2024年限定キャンペーン',
        ]);
        
        // 3. 手数料復帰（10%）- 2025年1月1日から無期限
        CommissionSetting::create([
            'rate' => 10.00,
            'applicable_from' => '2025-01-01',
            'applicable_to' => null,
            'is_active' => true,
            'description' => '手数料設定復帰（10%） - 通常料金に戻る',
        ]);
    }
}
