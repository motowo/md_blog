<?php

use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\UserController as APIUserController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
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

// 記事詳細（オプション認証：ログイン済みの場合は認証情報を取得）
Route::get('articles/{article}', [ArticleController::class, 'show']);

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

    // 決済関連のルート
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments', [PaymentController::class, 'index']);
});
