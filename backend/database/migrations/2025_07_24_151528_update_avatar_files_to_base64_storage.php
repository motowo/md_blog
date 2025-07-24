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
            // BASE64データを保存するカラムを追加
            $table->longText('base64_data')->nullable()->after('file_path');

            // 既存のファイルパス関連カラムをnullableに変更
            $table->string('stored_filename')->nullable()->change();
            $table->string('file_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('avatar_files', function (Blueprint $table) {
            // BASE64データカラムを削除
            $table->dropColumn('base64_data');

            // ファイルパス関連カラムを元に戻す
            $table->string('stored_filename')->nullable(false)->change();
            $table->string('file_path')->nullable(false)->change();
        });
    }
};
