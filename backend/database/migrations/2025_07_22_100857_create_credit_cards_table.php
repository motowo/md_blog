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
        Schema::create('credit_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('card_number', 16); // Mockなので平文で保存（本番環境では暗号化必須）
            $table->string('card_name');
            $table->string('expiry_month', 2);
            $table->string('expiry_year', 4);
            $table->string('last_four', 4); // 表示用の下4桁
            $table->string('card_brand')->default('VISA'); // カードブランド（VISA, Mastercard等）
            $table->boolean('is_default')->default(true);
            $table->timestamps();

            // ユーザーごとに1枚のみ
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_cards');
    }
};
