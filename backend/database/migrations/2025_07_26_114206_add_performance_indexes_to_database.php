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
        // 記事テーブルのパフォーマンス改善インデックス
        Schema::table('articles', function (Blueprint $table) {
            // 全文検索インデックス（MySQL 5.6以降）
            $table->fullText(['title', 'content'], 'articles_fulltext_search');

            // 複合インデックス（よく使われる検索条件）
            $table->index(['status', 'created_at'], 'articles_status_created_idx');
            $table->index(['user_id', 'status', 'created_at'], 'articles_user_status_created_idx');
            $table->index(['is_paid', 'status'], 'articles_paid_status_idx');
        });

        // 決済テーブルのパフォーマンス改善インデックス
        Schema::table('payments', function (Blueprint $table) {
            // 振込管理で頻繁に使用される検索条件
            $table->index('payout_completed_at', 'payments_payout_completed_idx');
            $table->index(['status', 'created_at'], 'payments_status_created_idx');
            $table->index(['status', 'payout_completed_at'], 'payments_status_payout_idx');

            // 売上集計で使用される複合インデックス
            $table->index(['user_id', 'status', 'created_at'], 'payments_user_status_created_idx');
        });

        // ユーザーテーブルのパフォーマンス改善インデックス
        Schema::table('users', function (Blueprint $table) {
            // 検索機能で使用される複合インデックス
            $table->index(['role', 'profile_public'], 'users_role_public_idx');
            $table->index(['role', 'is_active'], 'users_role_active_idx');
        });

        // 記事タグ中間テーブルのパフォーマンス改善
        Schema::table('article_tags', function (Blueprint $table) {
            // タグ検索で使用される複合インデックス
            $table->index(['tag_id', 'created_at'], 'article_tags_tag_created_idx');
        });

        // タグテーブルのパフォーマンス改善
        Schema::table('tags', function (Blueprint $table) {
            // スラッグ検索の高速化
            $table->index('name', 'tags_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropFullText('articles_fulltext_search');
            $table->dropIndex('articles_status_created_idx');
            $table->dropIndex('articles_user_status_created_idx');
            $table->dropIndex('articles_paid_status_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_payout_completed_idx');
            $table->dropIndex('payments_status_created_idx');
            $table->dropIndex('payments_status_payout_idx');
            $table->dropIndex('payments_user_status_created_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_public_idx');
            $table->dropIndex('users_role_active_idx');
        });

        Schema::table('article_tags', function (Blueprint $table) {
            $table->dropIndex('article_tags_tag_created_idx');
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex('tags_name_idx');
        });
    }
};
