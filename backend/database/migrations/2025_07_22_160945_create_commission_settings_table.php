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
        Schema::create('commission_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('rate', 5, 2)->comment('手数料率（%）');
            $table->date('applicable_from')->comment('適用開始日');
            $table->date('applicable_to')->nullable()->comment('適用終了日');
            $table->boolean('is_active')->default(true)->comment('有効フラグ');
            $table->string('description')->nullable()->comment('説明');
            $table->timestamps();

            // インデックス
            $table->index(['applicable_from', 'applicable_to']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_settings');
    }
};
