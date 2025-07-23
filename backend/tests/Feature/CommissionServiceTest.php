<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\CommissionSetting;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use App\Services\CommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // 基本的な手数料設定を作成
        CommissionSetting::create([
            'rate' => 10.00,
            'applicable_from' => '2025-01-01',
            'applicable_to' => null,
            'is_active' => true,
            'description' => 'テスト用手数料設定',
        ]);
    }

    public function test_commission_setting_can_be_retrieved_for_date()
    {
        $setting = CommissionSetting::getActiveSettingForDate('2025-07-22');

        $this->assertNotNull($setting);
        $this->assertEquals(10.00, $setting->rate);
        $this->assertEquals('2025-01-01', $setting->applicable_from->format('Y-m-d'));
    }

    public function test_current_commission_setting_can_be_retrieved()
    {
        $setting = CommissionSetting::getCurrentSetting();

        $this->assertNotNull($setting);
        $this->assertEquals(10.00, $setting->rate);
    }

    public function test_commission_calculation()
    {
        $service = new CommissionService;

        // テストユーザーと記事を作成
        $author = User::factory()->create(['role' => 'author']);
        $article = Article::factory()->create([
            'user_id' => $author->id,
            'is_paid' => true,
            'price' => 1000,
        ]);

        // 決済を作成
        Payment::factory()->create([
            'user_id' => User::factory()->create()->id,
            'article_id' => $article->id,
            'amount' => 1000,
            'status' => 'success',
            'paid_at' => now(),
        ]);

        // 月次支払い処理を実行
        $result = $service->processMonthlyPayouts(now()->format('Y-m'));

        $this->assertTrue($result['success']);
        $this->assertEquals(1, $result['processed_count']);

        // Payoutが正しく作成されているか確認
        $payout = Payout::where('user_id', $author->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals(1000, $payout->gross_amount);
        $this->assertEquals(100, $payout->commission_amount);
        $this->assertEquals(900, $payout->amount);
        $this->assertEquals(10.00, $payout->commission_rate);
    }

    public function test_historical_data_commission_application()
    {
        $service = new CommissionService;

        // 手数料情報のない既存のPayoutを直接DB挿入で作成
        $user = User::factory()->create();
        $payout = new Payout([
            'user_id' => $user->id,
            'period' => '2025-01',
            'amount' => 1000,
            'status' => 'unpaid',
        ]);
        $payout->save();

        $result = $service->applyCommissionToHistoricalData();

        $this->assertTrue($result['success']);
        $this->assertEquals(1, $result['updated_count']);

        // 更新されたデータを確認
        $payout->refresh();
        $this->assertEquals(1000, $payout->gross_amount);
        $this->assertEquals(100, $payout->commission_amount);
        $this->assertEquals(900, $payout->amount);
        $this->assertEquals(10.00, $payout->commission_rate);
    }

    public function test_multiple_commission_settings_with_periods()
    {
        // 期間限定の手数料設定を追加
        CommissionSetting::create([
            'rate' => 15.00,
            'applicable_from' => '2025-06-01',
            'applicable_to' => '2025-08-31',
            'is_active' => true,
            'description' => 'サマーキャンペーン手数料',
        ]);

        // 6月の設定を取得
        $juneSetting = CommissionSetting::getActiveSettingForDate('2025-06-15');
        $this->assertEquals(15.00, $juneSetting->rate);

        // 9月の設定を取得（元の10%設定に戻る）
        $septemberSetting = CommissionSetting::getActiveSettingForDate('2025-09-15');
        $this->assertEquals(10.00, $septemberSetting->rate);
    }
}
