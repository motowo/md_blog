#!/bin/bash

# Laravelプロジェクトをダウンロード
if [ ! -f "composer.json" ]; then
    echo "Setting up Laravel project..."
    composer create-project laravel/laravel temp "11.*" --prefer-dist
    mv temp/* temp/.[^.]* . 2>/dev/null || true
    rmdir temp
fi

# 環境変数ファイルをコピー
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# アプリケーションキーを生成
php artisan key:generate

# データベースマイグレーションを実行
php artisan migrate --force

echo "Laravel setup completed!"