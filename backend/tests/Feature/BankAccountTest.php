<?php

namespace Tests\Feature;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BankAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_bank_account()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bank-accounts', [
            'bank_name' => 'みずほ銀行',
            'branch_name' => '新宿支店',
            'account_type' => '普通',
            'account_number' => '1234567',
            'account_holder_name' => '山田太郎',
        ]);

        if ($response->status() !== 201) {
            dump($response->json());
        }

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'bank_name',
                    'branch_name',
                    'account_type',
                    'account_number',
                    'account_holder_name',
                    'is_active',
                ],
            ]);

        $this->assertDatabaseHas('bank_accounts', [
            'user_id' => $user->id,
            'bank_name' => 'みずほ銀行',
            'is_active' => true,
        ]);
    }

    public function test_user_can_get_bank_accounts()
    {
        $user = User::factory()->create();
        $bankAccount = BankAccount::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/bank-accounts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'bank_name',
                        'branch_name',
                        'account_type',
                        'account_number',
                        'account_holder_name',
                        'is_active',
                    ],
                ],
            ]);
    }

    public function test_user_can_update_bank_account()
    {
        $user = User::factory()->create();
        $bankAccount = BankAccount::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/bank-accounts/{$bankAccount->id}", [
            'bank_name' => '三菱UFJ銀行',
            'branch_name' => '渋谷支店',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data',
            ]);

        $this->assertDatabaseHas('bank_accounts', [
            'id' => $bankAccount->id,
            'bank_name' => '三菱UFJ銀行',
            'branch_name' => '渋谷支店',
        ]);
    }

    public function test_user_can_delete_bank_account()
    {
        $user = User::factory()->create();
        $bankAccount = BankAccount::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/bank-accounts/{$bankAccount->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('bank_accounts', [
            'id' => $bankAccount->id,
        ]);
    }

    public function test_user_can_activate_bank_account()
    {
        $user = User::factory()->create();
        $bankAccount1 = BankAccount::factory()->create(['user_id' => $user->id, 'is_active' => true]);
        $bankAccount2 = BankAccount::factory()->create(['user_id' => $user->id, 'is_active' => false]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/bank-accounts/{$bankAccount2->id}/activate");

        $response->assertStatus(200);

        // 新しくアクティブにした口座がアクティブになる
        $this->assertDatabaseHas('bank_accounts', [
            'id' => $bankAccount2->id,
            'is_active' => true,
        ]);

        // 以前アクティブだった口座が非アクティブになる
        $this->assertDatabaseHas('bank_accounts', [
            'id' => $bankAccount1->id,
            'is_active' => false,
        ]);
    }

    public function test_user_cannot_access_other_users_bank_accounts()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $bankAccount = BankAccount::factory()->create(['user_id' => $user2->id]);

        Sanctum::actingAs($user1);

        $response = $this->putJson("/api/bank-accounts/{$bankAccount->id}", [
            'bank_name' => '攻撃者の銀行',
        ]);

        $response->assertStatus(404);
    }

    public function test_bank_account_creation_requires_valid_data()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bank-accounts', [
            'bank_name' => '', // 必須フィールドが空
            'branch_name' => '新宿支店',
            'account_type' => '無効な種別', // 無効な値
            'account_number' => '1234567',
            'account_holder_name' => '山田太郎',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bank_name', 'account_type']);
    }

    public function test_user_model_has_bank_account_relationship()
    {
        $user = User::factory()->create();
        $bankAccount = BankAccount::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(BankAccount::class, $user->bankAccounts()->first());
        $this->assertEquals($bankAccount->id, $user->activeBankAccount()->id);
        $this->assertTrue($user->hasActiveBankAccount());
    }
}
