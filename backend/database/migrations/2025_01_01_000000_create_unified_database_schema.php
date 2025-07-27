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
        // Users table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['author', 'admin', 'user'])->default('author');
            $table->string('avatar_path')->nullable();
            $table->text('bio')->nullable();
            $table->text('career_description')->nullable();
            $table->string('x_url')->nullable();
            $table->string('github_url')->nullable();
            $table->boolean('profile_public')->default(true);
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->timestamp('last_login_at')->nullable();

            // インデックス
            $table->index('role');
            $table->index('is_active');
            $table->index('profile_public');
            $table->index('last_login_at');
            
            // パフォーマンス改善インデックス
            $table->index(['role', 'profile_public'], 'users_role_public_idx');
            $table->index(['role', 'is_active'], 'users_role_active_idx');
        });

        // Password reset tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Cache table
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        // Cache locks table
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // Jobs table
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        // Job batches table
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        // Failed jobs table
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // Personal access tokens table (Laravel Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Tags table
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();

            // インデックス
            $table->index('created_at');
            
            // パフォーマンス改善インデックス
            $table->index('name', 'tags_name_idx');
        });

        // Articles table
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('content');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->boolean('is_paid')->default(false);
            $table->decimal('price', 10, 0)->nullable(); // 整数精度（小数点なし）
            $table->text('preview_content')->nullable();
            $table->timestamps();

            // インデックス
            $table->index('status');
            $table->index('is_paid');
            $table->index(['status', 'is_paid']);
            $table->index('created_at');
            $table->index(['user_id', 'status']);
            
            // パフォーマンス改善インデックス
            $table->fullText(['title', 'content'], 'articles_fulltext_search');
            $table->index(['status', 'created_at'], 'articles_status_created_idx');
            $table->index(['user_id', 'status', 'created_at'], 'articles_user_status_created_idx');
            $table->index(['is_paid', 'status'], 'articles_paid_status_idx');
        });

        // Article tags table (pivot table)
        Schema::create('article_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['article_id', 'tag_id']);

            // インデックス
            $table->index('tag_id');
            $table->index('created_at');
            
            // パフォーマンス改善インデックス
            $table->index(['tag_id', 'created_at'], 'article_tags_tag_created_idx');
        });

        // Commission settings table
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

        // Payments table (統合された最新構造)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 0); // 整数精度（小数点なし）
            $table->decimal('commission_amount', 10, 0)->nullable()->comment('手数料金額');
            $table->decimal('payout_amount', 10, 0)->nullable()->comment('著者振込金額');
            $table->string('transaction_id')->unique();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('payment_method')->nullable()->comment('決済方法');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('payout_completed_at')->nullable()->comment('振込完了日時');
            $table->timestamps();

            // インデックス
            $table->index('status');
            $table->index('paid_at');
            $table->index(['user_id', 'status']);
            $table->index(['article_id', 'status']);
            $table->index(['user_id', 'paid_at']);
            $table->index('payout_completed_at');
            
            // パフォーマンス改善インデックス
            $table->index(['status', 'created_at'], 'payments_status_created_idx');
            $table->index(['status', 'payout_completed_at'], 'payments_status_payout_idx');
            $table->index(['user_id', 'status', 'created_at'], 'payments_user_status_created_idx');
        });

        // Payouts table
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('period');
            $table->decimal('amount', 10, 2);
            $table->decimal('gross_amount', 10, 2)->nullable()->comment('総売上金額');
            $table->decimal('commission_amount', 10, 2)->nullable()->comment('手数料金額');
            $table->decimal('commission_rate', 5, 2)->nullable()->comment('適用手数料率（%）');
            $table->enum('status', ['unpaid', 'paid', 'failed'])->default('unpaid');
            $table->timestamp('paid_at')->nullable();
            $table->json('bank_account_info')->nullable();
            $table->timestamps();

            // インデックス
            $table->index('status');
            $table->index('period');
            $table->index(['user_id', 'period']);
            $table->index(['status', 'period']);
        });

        // Bank accounts table
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bank_name')->comment('銀行名');
            $table->string('branch_name')->comment('支店名');
            $table->string('account_type')->comment('口座種別（普通・当座）');
            $table->string('account_number')->comment('口座番号');
            $table->string('account_holder_name')->comment('口座名義');
            $table->boolean('is_active')->default(true)->comment('有効フラグ');
            $table->timestamp('verified_at')->nullable()->comment('確認日時');
            $table->timestamps();

            // インデックス
            $table->index('user_id');
            $table->index('is_active');
            $table->index(['user_id', 'is_active']);
            $table->index('verified_at');
        });

        // Credit cards table
        Schema::create('credit_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('card_number');
            $table->string('card_name');
            $table->integer('expiry_month');
            $table->integer('expiry_year');
            $table->string('last_four', 4);
            $table->string('card_brand')->default('VISA');
            $table->boolean('is_default')->default(true);
            $table->timestamps();

            // インデックス
            $table->unique('user_id');
            $table->index('is_default');
            $table->index('card_brand');
        });

        // Avatar files table (最新のBASE64構造)
        Schema::create('avatar_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->json('crop_data')->nullable();
            $table->longText('base64_data')->nullable()->comment('BASE64エンコードされた画像データ');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            // インデックス
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avatar_files');
        Schema::dropIfExists('credit_cards');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('commission_settings');
        Schema::dropIfExists('article_tags');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
