#!/bin/bash
set -e

echo "Starting Docker entrypoint script..."

# アプリケーションキーを生成（存在しない場合）
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# アプリケーションキーを生成
echo "Generating application key..."
php artisan key:generate --force

# データベース接続を待機
echo "Waiting for database connection..."
until php artisan db:monitor > /dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 3
done

echo "Database is up!"

# マイグレーションの状態を確認
echo "Checking migration status..."
MIGRATION_STATUS=$(php artisan migrate:status 2>&1 || true)

# データベースが空の場合、またはマイグレーションが未実行の場合のみマイグレーションとシーダーを実行
if echo "$MIGRATION_STATUS" | grep -q "Migration table not found" || echo "$MIGRATION_STATUS" | grep -q "No migrations found"; then
    echo "Database appears to be empty. Running migrations and seeders..."
    
    # マイグレーション実行
    php artisan migrate --force
    
    # シーダー実行
    echo "Running database seeders..."
    php artisan db:seed --force
    
    echo "Database initialization completed!"
else
    # 既存のマイグレーションがある場合は、未実行のマイグレーションのみ実行
    PENDING_MIGRATIONS=$(php artisan migrate:status | grep "Pending" || true)
    
    if [ ! -z "$PENDING_MIGRATIONS" ]; then
        echo "Found pending migrations. Running migrations..."
        php artisan migrate --force
    else
        echo "All migrations are up to date."
    fi
fi

# ストレージリンクを作成
php artisan storage:link 2>/dev/null || true

# キャッシュをクリア
echo "Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Laravel開発サーバーを起動
echo "Starting Laravel development server..."
exec php artisan serve --host=0.0.0.0 --port=8000