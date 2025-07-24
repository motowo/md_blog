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
        // Remove unused profile_image_url column from users table
        // The system now uses avatar_path for user avatars instead
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profile_image_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back profile_image_url column if needed to rollback
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable();
        });
    }
};
