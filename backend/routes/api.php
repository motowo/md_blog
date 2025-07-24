<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BankAccountController;
use App\Http\Controllers\API\CommissionController;
use App\Http\Controllers\API\CreditCardController;
use App\Http\Controllers\API\SalesController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\UserController as APIUserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 認証不要のルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// タグ関連のルート（認証不要：一覧・詳細）
Route::get('tags', [TagController::class, 'index']);
Route::get('tags/{tag}', [TagController::class, 'show']);

// 記事関連のルート（認証不要：一覧）
Route::get('articles', [ArticleController::class, 'index']);
Route::get('articles/recent', [ArticleController::class, 'recent']);
Route::get('articles/trending', [ArticleController::class, 'trending']);

// 記事詳細（オプション認証：ログイン済みの場合は認証情報を取得）
Route::get('articles/{article}', [ArticleController::class, 'show']);

// ユーザー関連のルート（認証不要：公開プロフィール）
Route::get('users', [UserController::class, 'publicUsersList']);
Route::get('users/{username}', [UserController::class, 'publicProfile']);

// タグ関連のルート（認証必要・管理者のみ：作成・更新・削除）
Route::middleware('auth:sanctum')->group(function () {
    Route::post('tags', [TagController::class, 'store']);
    Route::put('tags/{tag}', [TagController::class, 'update']);
    Route::delete('tags/{tag}', [TagController::class, 'destroy']);
});

// 記事関連のルート（認証必要：作成・更新・削除）
Route::middleware('auth:sanctum')->group(function () {
    Route::post('articles', [ArticleController::class, 'store']);
    Route::put('articles/{article}', [ArticleController::class, 'update']);
    Route::delete('articles/{article}', [ArticleController::class, 'destroy']);

    // 記事とタグの関連付け
    Route::post('articles/{article}/tags', [ArticleController::class, 'attachTags']);
    Route::delete('articles/{article}/tags/{tag}', [ArticleController::class, 'detachTag']);
});

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ユーザー関連のルート
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    Route::get('/user/avatars', [UserController::class, 'getAvatarFiles']);
    Route::put('/user/avatars/{avatarFile}/crop', [UserController::class, 'updateAvatarCrop']);
    Route::delete('/user/avatars/{avatarFile}', [UserController::class, 'deleteAvatar']);
    Route::get('/user/activity', [UserController::class, 'getArticleActivity']);
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::delete('/user/account', [UserController::class, 'deleteAccount']);
    Route::get('/user/articles', [APIUserController::class, 'articles']);

    // 管理者用: 他のユーザーの情報取得
    Route::get('/user/{user}/activity', [UserController::class, 'getArticleActivity'])->middleware('admin');
    Route::get('/user/{user}/articles', [APIUserController::class, 'articles'])->middleware('admin');

    // 決済関連のルート
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments', [PaymentController::class, 'index']);

    // クレジットカード管理
    Route::get('/credit-card', [CreditCardController::class, 'show']);
    Route::post('/credit-card', [CreditCardController::class, 'store']);
    Route::delete('/credit-card', [CreditCardController::class, 'destroy']);

    // 振込口座管理
    Route::get('/bank-accounts', [BankAccountController::class, 'index']);
    Route::post('/bank-accounts', [BankAccountController::class, 'store']);
    Route::put('/bank-accounts/{id}', [BankAccountController::class, 'update']);
    Route::delete('/bank-accounts/{id}', [BankAccountController::class, 'destroy']);
    Route::patch('/bank-accounts/{id}/activate', [BankAccountController::class, 'activate']);

    // 売上管理
    Route::get('/sales', [SalesController::class, 'index']);
    Route::get('/sales/monthly', [SalesController::class, 'monthlySummary']);
    Route::get('/sales/payouts', [SalesController::class, 'payouts']);
    Route::get('/sales/payout-schedule', [SalesController::class, 'payoutSchedule']);

    // 管理者専用ルート
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        // ユーザー管理
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{user}', [AdminController::class, 'getUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);

        // 記事管理
        Route::get('/articles', [AdminController::class, 'getArticles']);
        Route::get('/articles/{article}', [AdminController::class, 'getArticle']);
        Route::put('/articles/{article}', [AdminController::class, 'updateArticle']);
        Route::delete('/articles/{article}', [AdminController::class, 'deleteArticle']);

        // ダッシュボード・統計
        Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/dashboard/revenue', [AdminController::class, 'getRevenueDetails']);

        // 手数料管理
        Route::get('/commission-settings', [CommissionController::class, 'index']);
        Route::post('/commission-settings', [CommissionController::class, 'store']);
        Route::put('/commission-settings/{setting}', [CommissionController::class, 'update']);
        Route::delete('/commission-settings/{setting}', [CommissionController::class, 'destroy']);
        Route::post('/process-monthly-payouts', [CommissionController::class, 'processMonthlyPayouts']);

        // 振込管理
        Route::get('/pending-payouts', [CommissionController::class, 'getPendingPayouts']);
        Route::get('/payouts/monthly-summary', [CommissionController::class, 'getMonthlySummary']);
        Route::get('/payouts/monthly-details', [CommissionController::class, 'getMonthlyDetails']);
        Route::patch('/payouts/{id}/confirm', [CommissionController::class, 'confirmPayout']);
        Route::post('/payouts/bulk-confirm', [CommissionController::class, 'bulkConfirmPayouts']);
    });
});
