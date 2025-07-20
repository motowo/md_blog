# MD Blog - ITエンジニア向け有料コンテンツ共有プラットフォーム

## 概要
ITエンジニアが技術記事を投稿し、有料コンテンツとして販売できるプラットフォームです。

## 実装状況（認証API連携完了）

### ✅ 完了機能
- **Docker環境構築**: フロントエンド、バックエンド、データベースのコンテナ化
- **フロントエンド基盤**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Laravel基盤**: Laravel 11.x完全初期化、全依存関係設定、日本語ロケール対応
- **データベース設計**: 7テーブル完全構築（users, articles, tags, article_tags, payments, comments, payouts）
- **認証システム**: Laravel Sanctum実装、トークンベース認証API完成
- **API基盤**: 認証関連エンドポイント（登録・ログイン・ログアウト・ユーザー情報取得）
- **記事CRUD API**: 記事の作成・読取・更新・削除の完全実装、権限制御、バリデーション
- **タグ管理API**: タグCRUD、記事タグ付け、タグ検索機能、管理者権限制御
- **CI/CD環境**: GitHub Actions（フロントエンドのみ、PR品質チェック、Dependabot）
- **フロントエンドUI**: TailwindCSS v4シンプル設計、完全再構築
  - **ホームページ**: サービス紹介、機能説明、認証状態対応表示
  - **ログイン画面**: バリデーション付きフォーム、日本語エラーハンドリング、管理者アカウント表示
  - **ユーザー登録画面**: バリデーション、パスワード確認、日本語エラーメッセージ
  - **ダークモード**: ライト/ダークモード完全対応、切り替えボタン、localStorage保存
  - **UIコンポーネント**: Button、Input、Card、Layout（基本コンポーネント）
  - **レスポンシブ**: 基本的なモバイル対応
- **認証API連携**: フロントエンド・バックエンド完全連携、トークンベース認証
  - **APIクライアント**: Axios設定、自動トークン付与、エラーハンドリング
  - **認証コンテキスト**: React Context API、ローカルストレージ連携
  - **保護ルート**: 認証・ロールベースアクセス制御
  - **エラー日本語化**: 全認証・バリデーションエラーの日本語変換
  - **管理者アカウント**: テスト用管理者（admin@md-blog.local / password123）
- **記事一覧画面実装**: ページネーション、検索、タグフィルター付き
  - **ArticleListPage**: React Router連携、URL状態管理
  - **ArticleCard**: 再利用可能カードコンポーネント、サムネイル・価格表示対応
  - **記事API連携**: 公開記事取得、レスポンス処理、エラーハンドリング
  - **UI/UX**: レスポンシブデザイン、ローディング、エラー表示
- **コード品質**: ESLint、Prettier、Laravel Pint、17テスト全成功（React側）

### 🚧 次期実装予定（MVP機能開発）
- 記事詳細画面（Markdown表示）
- 記事投稿・編集画面（Markdownエディタ）
- 記事検索機能
- ユーザープロフィール管理
- 決済システム（有料記事販売）
- コメント機能

## 技術スタック
- **フロントエンド**: React.js (v19.x), TypeScript (v5.x), TailwindCSS (v4.x), Vite
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
- フロントエンド: http://localhost/ (ポート80)
- バックエンド API: http://localhost:8000

### テスト用アカウント

#### 管理者アカウント
- **Email**: admin@md-blog.local
- **Password**: password123
- **権限**: 全機能アクセス可能（記事管理、タグ管理、ユーザー管理）

認証機能をテストする際はこのアカウントをご利用ください。

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

# コード品質チェック
./vendor/bin/pint --test

# コード整形
./vendor/bin/pint

# テスト実行
php artisan test

# キャッシュクリア
php artisan cache:clear
```

## API仕様

### 認証API

#### ユーザー登録
```bash
POST /api/register
Content-Type: application/json

{
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "author"
}
```

#### ログイン
```bash
POST /api/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "password123"
}
```

#### ログアウト（認証必要）
```bash
POST /api/logout
Authorization: Bearer {token}
```

#### ユーザー情報取得（認証必要）
```bash
GET /api/user
Authorization: Bearer {token}
```

### 記事API

#### 記事一覧取得
```bash
GET /api/articles
```

#### 記事詳細取得
```bash
GET /api/articles/{id}
```

#### 記事作成（認証必要）
```bash
POST /api/articles
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "記事タイトル",
    "content": "記事本文",
    "thumbnail_url": "https://example.com/image.jpg",
    "status": "draft",
    "is_paid": false,
    "price": 1000,
    "preview_content": "プレビュー内容",
    "is_featured": false
}
```

#### 記事更新（認証必要・作成者のみ）
```bash
PUT /api/articles/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "更新後タイトル",
    "content": "更新後本文",
    "status": "published"
}
```

#### 記事削除（認証必要・作成者のみ）
```bash
DELETE /api/articles/{id}
Authorization: Bearer {token}
```

#### タグによる記事絞り込み
```bash
GET /api/articles?tag={slug}
```

### タグAPI

#### タグ一覧取得
```bash
GET /api/tags
```

#### タグ詳細取得
```bash
GET /api/tags/{id}
```

#### タグ作成（認証必要・管理者のみ）
```bash
POST /api/tags
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Laravel",
    "slug": "laravel"
}
```

#### タグ更新（認証必要・管理者のみ）
```bash
PUT /api/tags/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Laravel Framework",
    "slug": "laravel-framework"
}
```

#### タグ削除（認証必要・管理者のみ）
```bash
DELETE /api/tags/{id}
Authorization: Bearer {token}
```

#### 記事へのタグ付け（認証必要・記事作成者のみ）
```bash
POST /api/articles/{id}/tags
Authorization: Bearer {token}
Content-Type: application/json

{
    "tag_ids": [1, 2, 3]
}
```

#### 記事からのタグ削除（認証必要・記事作成者のみ）
```bash
DELETE /api/articles/{id}/tags/{tag_id}
Authorization: Bearer {token}
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

## CI/CD環境

### GitHub Actions
本プロジェクトでは以下のGitHub Actionsワークフローが設定されています：

#### 1. プルリクエスト品質チェック (`.github/workflows/pr-check.yml`)
- feature/**ブランチからmainへのPR時に自動実行
- フロントエンド・バックエンドの変更を自動検出
- ESLint、Prettier、Laravel Pint、PHPUnitを実行
- セキュリティスキャン（Trivy）を含む

#### 2. 自動フォーマット (`.github/workflows/format-auto.yml`)
- feature/**ブランチへのpush時に自動実行
- コードを自動フォーマットして自動コミット・プッシュ
- フロントエンド（Prettier）とバックエンド（Laravel Pint）両対応

#### 3. 依存関係自動更新 (`.github/dependabot.yml`)
- npm、Composer、Docker、GitHub Actionsの週次更新
- 自動PRによる依存関係管理

### 品質管理
- **テストカバレッジ**: 26テスト（138アサーション）すべて成功
- **コード品質**: ESLint + Prettier（フロントエンド）、Laravel Pint（バックエンド）
- **セキュリティ**: Trivy脆弱性スキャン、トークンベース認証、役割ベースアクセス制御
- **依存関係**: Dependabot自動更新

## 認証機能詳細

### フロントエンド認証
- **ユーザー登録**: ユーザー名重視設計、名前は任意入力
- **ログイン**: メールアドレス・パスワード認証
- **認証状態管理**: React Context API + localStorage
- **保護ルート**: 認証・ロールベースアクセス制御
- **UIコンポーネント**: 再利用可能なButton、Input、Alert

### バックエンド認証
- **Laravel Sanctum**: トークンベース認証API
- **セキュリティ**: CSRF無効化、適切なCORS設定
- **役割管理**: 投稿者（デフォルト）・管理者
- **管理者アカウント**: Seederで安全に作成

## 開発フロー

1. mainブランチから新しいブランチを作成
2. Docker環境を起動して開発
3. テストを作成・実行（TDD）
4. GitHub Actionsで自動品質チェック
5. Git にコミット（自動フォーマット実行）
6. プルリクエストを作成
7. CI/CDパイプラインで品質確認後マージ

詳細は `CLAUDE.md` を参照してください。