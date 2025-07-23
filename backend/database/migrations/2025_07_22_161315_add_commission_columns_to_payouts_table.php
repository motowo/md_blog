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
        Schema::table('payouts', function (Blueprint $table) {
            $table->decimal('gross_amount', 10, 2)->nullable()->after('amount')->comment('総売上金額');
            $table->decimal('commission_amount', 10, 2)->nullable()->after('gross_amount')->comment('手数料金額');
            $table->decimal('commission_rate', 5, 2)->nullable()->after('commission_amount')->comment('適用手数料率（%）');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payouts', function (Blueprint $table) {
            $table->dropColumn(['gross_amount', 'commission_amount', 'commission_rate']);
        });
    }
};
