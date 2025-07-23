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
        Schema::table('commission_settings', function (Blueprint $table) {
            $table->datetime('applicable_from')->change()->comment('適用開始日時');
            $table->datetime('applicable_to')->nullable()->change()->comment('適用終了日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_settings', function (Blueprint $table) {
            $table->date('applicable_from')->change()->comment('適用開始日');
            $table->date('applicable_to')->nullable()->change()->comment('適用終了日');
        });
    }
};
