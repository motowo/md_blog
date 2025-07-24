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
        // 1. Refine users table - change role to ENUM for better data integrity
        Schema::table('users', function (Blueprint $table) {
            // Change role from varchar to ENUM for better data integrity
            $table->enum('role', ['author', 'admin'])->default('author')->change();

            // Add index for frequently queried columns
            $table->index('role', 'idx_users_role');
            $table->index('is_active', 'idx_users_is_active');
            $table->index('profile_public', 'idx_users_profile_public');
            $table->index('last_login_at', 'idx_users_last_login_at');
        });

        // 2. Refine articles table - increase price precision for higher amounts
        Schema::table('articles', function (Blueprint $table) {
            // Change price from DECIMAL(8,2) to DECIMAL(10,2) for higher price support
            $table->decimal('price', 10, 2)->nullable()->change();

            // Add indexes for frequently queried columns
            $table->index('status', 'idx_articles_status');
            $table->index('is_paid', 'idx_articles_is_paid');
            $table->index(['status', 'is_paid'], 'idx_articles_status_is_paid');
            $table->index('created_at', 'idx_articles_created_at');
            $table->index(['user_id', 'status'], 'idx_articles_user_status');
        });

        // 3. Refine payments table - increase amount precision for consistency with articles
        Schema::table('payments', function (Blueprint $table) {
            // Change amount from DECIMAL(8,2) to DECIMAL(10,2) for consistency
            $table->decimal('amount', 10, 2)->change();

            // Add indexes for frequently queried columns
            $table->index('status', 'idx_payments_status');
            $table->index('paid_at', 'idx_payments_paid_at');
            $table->index(['user_id', 'status'], 'idx_payments_user_status');
            $table->index(['article_id', 'status'], 'idx_payments_article_status');
            $table->index(['user_id', 'paid_at'], 'idx_payments_user_paid_at');
        });

        // 4. Refine tags table - add indexes for performance
        Schema::table('tags', function (Blueprint $table) {
            // Add index for created_at for trending tag queries
            $table->index('created_at', 'idx_tags_created_at');
        });

        // 5. Refine article_tags table - add indexes for performance
        Schema::table('article_tags', function (Blueprint $table) {
            // Add index for tag_id to improve reverse lookup performance
            $table->index('tag_id', 'idx_article_tags_tag_id');
            $table->index('created_at', 'idx_article_tags_created_at');
        });

        // 6. Refine payouts table - add indexes for admin dashboard queries
        Schema::table('payouts', function (Blueprint $table) {
            // Add indexes for frequently queried columns in admin dashboard
            $table->index('status', 'idx_payouts_status');
            $table->index('period', 'idx_payouts_period');
            $table->index(['user_id', 'period'], 'idx_payouts_user_period');
            $table->index(['status', 'period'], 'idx_payouts_status_period');
        });

        // 7. Refine credit_cards table - add indexes for performance
        Schema::table('credit_cards', function (Blueprint $table) {
            // Add index for is_default for quick default card lookup
            $table->index('is_default', 'idx_credit_cards_is_default');
            $table->index('card_brand', 'idx_credit_cards_card_brand');
        });

        // 8. Refine bank_accounts table - add indexes for performance
        Schema::table('bank_accounts', function (Blueprint $table) {
            // Add indexes for admin queries and user account management
            $table->index(['user_id', 'is_active'], 'idx_bank_accounts_user_active');
            $table->index('verified_at', 'idx_bank_accounts_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes and revert changes in reverse order

        // 8. Revert bank_accounts table
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropIndex('idx_bank_accounts_user_active');
            $table->dropIndex('idx_bank_accounts_verified_at');
        });

        // 7. Revert credit_cards table
        Schema::table('credit_cards', function (Blueprint $table) {
            $table->dropIndex('idx_credit_cards_is_default');
            $table->dropIndex('idx_credit_cards_card_brand');
        });

        // 6. Revert payouts table
        Schema::table('payouts', function (Blueprint $table) {
            $table->dropIndex('idx_payouts_status');
            $table->dropIndex('idx_payouts_period');
            $table->dropIndex('idx_payouts_user_period');
            $table->dropIndex('idx_payouts_status_period');
        });

        // 5. Revert article_tags table
        Schema::table('article_tags', function (Blueprint $table) {
            $table->dropIndex('idx_article_tags_tag_id');
            $table->dropIndex('idx_article_tags_created_at');
        });

        // 4. Revert tags table
        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex('idx_tags_created_at');
        });

        // 3. Revert payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 8, 2)->change();
            $table->dropIndex('idx_payments_status');
            $table->dropIndex('idx_payments_paid_at');
            $table->dropIndex('idx_payments_user_status');
            $table->dropIndex('idx_payments_article_status');
            $table->dropIndex('idx_payments_user_paid_at');
        });

        // 2. Revert articles table
        Schema::table('articles', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->nullable()->change();
            $table->dropIndex('idx_articles_status');
            $table->dropIndex('idx_articles_is_paid');
            $table->dropIndex('idx_articles_status_is_paid');
            $table->dropIndex('idx_articles_created_at');
            $table->dropIndex('idx_articles_user_status');
        });

        // 1. Revert users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('author')->change();
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_is_active');
            $table->dropIndex('idx_users_profile_public');
            $table->dropIndex('idx_users_last_login_at');
        });
    }
};
