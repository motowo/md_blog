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
        // 初期手数料設定（10%）
        CommissionSetting::create([
            'rate' => 10.00,
            'applicable_from' => '2025-01-01',
            'applicable_to' => null,
            'is_active' => true,
            'description' => '初期手数料設定（10%）',
        ]);
    }
}
