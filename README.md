# MD Blog - ITエンジニア向け有料コンテンツ共有プラットフォーム

## 概要
ITエンジニアが技術記事を投稿し、有料コンテンツとして販売できるプラットフォームです。

## 実装状況（環境構築フェーズ完了）

### ✅ 完了機能
- **Docker環境構築**: フロントエンド、バックエンド、データベースのコンテナ化
- **フロントエンド基盤**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **バックエンド基盤**: PHP 8.3 + Laravel 11の基本構造
- **データベース**: MySQL 8.0の初期設定
- **開発環境**: ESLint + Prettier設定、ホットリロード対応

### 🚧 次期実装予定
- Laravelプロジェクトの完全初期化
- データベースマイグレーション（ユーザー、記事、タグ等）
- 認証システム（Laravel Sanctum）
- 基本的なAPIエンドポイント

## 技術スタック
- **フロントエンド**: React.js (v19.x), TypeScript (v5.x), Tailwind CSS (v4.x), Vite
- **バックエンド**: PHP (v8.3.x), Laravel (v11.x)
- **データベース**: MySQL (v8.0.x)
- **コンテナ**: Docker / Docker Compose

## 環境構築

### 前提条件
- Docker Desktop がインストールされていること
- Git がインストールされていること

### セットアップ手順

1. リポジトリをクローン
```bash
git clone [repository-url]
cd md_blog
```

2. Docker環境を起動
```bash
docker-compose up -d
```

初回起動時は、以下の処理が自動で実行されます：
- Laravelプロジェクトの初期化
- 依存パッケージのインストール
- データベースのマイグレーション

3. アプリケーションへのアクセス
- フロントエンド: http://localhost
- バックエンド API: http://localhost:8000

### 開発コマンド

#### フロントエンド
```bash
# コンテナに入る
docker-compose exec frontend sh

# リンター実行
npm run lint

# フォーマッター実行
npm run format

# テスト実行
npm run test
```

#### バックエンド
```bash
# コンテナに入る
docker-compose exec backend bash

# マイグレーション実行
php artisan migrate

# キャッシュクリア
php artisan cache:clear
```

### Docker環境の管理

```bash
# 環境を停止
docker-compose down

# 環境を再起動
docker-compose restart

# ログを確認
docker-compose logs -f [service-name]

# 全てのコンテナとボリュームを削除（データも削除されます）
docker-compose down -v
```

## 開発フロー

1. mainブランチから新しいブランチを作成
2. Docker環境を起動して開発
3. テストを作成・実行（TDD）
4. コードをフォーマット
5. Git にコミット
6. プルリクエストを作成

詳細は `CLAUDE.md` を参照してください。