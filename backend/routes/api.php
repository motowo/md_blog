<?php

use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 認証不要のルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 記事関連のルート（認証不要：一覧・詳細）
Route::get('articles', [ArticleController::class, 'index']);
Route::get('articles/{article}', [ArticleController::class, 'show']);

// 記事関連のルート（認証必要：作成・更新・削除）
Route::middleware('auth:sanctum')->group(function () {
    Route::post('articles', [ArticleController::class, 'store']);
    Route::put('articles/{article}', [ArticleController::class, 'update']);
    Route::delete('articles/{article}', [ArticleController::class, 'destroy']);
});

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
