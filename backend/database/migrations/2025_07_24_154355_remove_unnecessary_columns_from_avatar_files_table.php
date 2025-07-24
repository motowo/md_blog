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
        Schema::table('avatar_files', function (Blueprint $table) {
            // BASE64化により不要になったカラムを削除
            $table->dropColumn(['stored_filename', 'file_path']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('avatar_files', function (Blueprint $table) {
            // カラムを復元（後方互換性のため）
            $table->string('stored_filename')->nullable()->after('original_filename');
            $table->string('file_path')->nullable()->after('stored_filename');
        });
    }
};
