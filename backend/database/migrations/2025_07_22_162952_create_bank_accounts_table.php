<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bank_name')->comment('銀行名');
            $table->string('branch_name')->comment('支店名');
            $table->string('account_type')->comment('口座種別（普通・当座）');
            $table->string('account_number')->comment('口座番号');
            $table->string('account_holder_name')->comment('口座名義');
            $table->boolean('is_active')->default(true)->comment('有効フラグ');
            $table->timestamp('verified_at')->nullable()->comment('確認日時');
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
