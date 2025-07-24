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
        // Change articles table price field to DECIMAL(10,0) - no decimal places
        Schema::table('articles', function (Blueprint $table) {
            $table->decimal('price', 10, 0)->nullable()->change();
        });

        // Change payments table amount field to DECIMAL(10,0) - no decimal places
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 10, 0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert articles table price field back to DECIMAL(10,2)
        Schema::table('articles', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->change();
        });

        // Revert payments table amount field back to DECIMAL(10,2)
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->change();
        });
    }
};
