# MD Blog - ITエンジニア向け有料コンテンツ共有プラットフォーム

## 概要
ITエンジニアが技術記事を投稿し、有料コンテンツとして販売できるプラットフォームです。

## 実装状況（Mock決済システム完了）

詳細な実装状況については [実装状況ドキュメント](docs/implementation.md) をご確認ください。

### ✅ 主要完了機能
- **Docker環境**: フロントエンド、バックエンド、データベースのコンテナ化完了
- **認証システム**: Laravel Sanctum + React Context による完全な認証基盤
- **記事管理**: CRUD操作、Markdownエディタ、自動保存機能
- **決済システム**: Mock決済による有料記事購入フロー
- **ユーザー管理**: プロフィール、アバター、アクティビティヒートマップ（記事数フィルタリング機能付き）
- **管理者機能**: ダッシュボード、ユーザー管理、記事管理
- **UI統一化**: Badge色統一、コンポーネントスタイル標準化
- **クレジットカード管理**: ユーザーごと1枚の登録・管理機能
- **金額表示統一**: 共通部品化による一貫した整数表示（/src/utils/currency.ts）
- **売上・振込管理**: JST基準の正確なタイムゾーン処理による売上集計・振込管理機能

### 🚧 次期実装予定
- **Markdownエディタ拡張**: リアルタイムプレビュー、画像アップロード
- **検索機能**: キーワード・高度絞り込み、タグ検索
- **コメント機能**: CRUD操作、返信、通知システム

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

### テストデータ

包括的なテストデータの詳細については、[テストデータ仕様書](docs/test.md) をご確認ください。

#### クイックスタート用アカウント
- **管理者**: admin@md-blog.local / password123
- **一般ユーザー**: tanaka@example.com / taro2024（ヒートマップテスト用データ豊富）

**主要テストデータ概要:**
- 総記事数: 約580記事（2024-2025年6月末まで分散投稿）
- 有料/無料記事比率: 50%/50%
- 価格範囲: 300-2000円（10円単位）
- プロフィール設定率: 70%
- ヒートマップ専用テストユーザー: 田中太郎・佐藤花子

**テスト用クレジットカード番号:**
- 成功: `4242424242424242` (VISA)
- 失敗: `4000000000000002` (カード拒否)
- 残高不足: `4000000000009995`

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

# 振込データ再生成（タイムゾーン修正対応）
php artisan payout:regenerate
```

## API仕様

詳細なAPI仕様については以下をご確認ください：
- [技術設計書](docs/design.md) - API仕様の表形式一覧
- [Swagger仕様書](docs/swagger.yaml) - OpenAPI 3.0形式の完全なAPI仕様

### 主要エンドポイント

#### 認証API
- `POST /api/register` - ユーザー登録
- `POST /api/login` - ログイン
- `POST /api/logout` - ログアウト（認証必要）
- `GET /api/user` - ユーザー情報取得（認証必要）

#### 記事管理API
- `GET /api/articles` - 記事一覧取得
- `GET /api/articles/{id}` - 記事詳細取得
- `POST /api/articles` - 記事作成（認証必要）
- `PUT /api/articles/{id}` - 記事更新（認証必要・作成者のみ）
- `DELETE /api/articles/{id}` - 記事削除（認証必要・作成者のみ）

#### 決済API（Mock）
- `POST /api/payments` - 記事購入（Mock決済）
- `GET /api/payments` - 決済履歴取得

#### クレジットカード管理API
- `GET /api/credit-card` - 登録済みクレジットカード取得（認証必要）
- `POST /api/credit-card` - クレジットカード登録・更新（認証必要）
- `DELETE /api/credit-card` - クレジットカード削除（認証必要）

**テスト用カード番号:**
- 成功: `4242424242424242`
- カード拒否: `4000000000000002`
- 残高不足: `4000000000009995`

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
- **テストカバレッジ**: 全テスト成功（フロントエンド・Laravelテストスイート）
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

1. mainブランチから新しいブランチを作成 (`git checkout -b feature/xxx`)
2. Docker環境を起動 (`docker-compose up -d`)
3. テストを作成・実行（TDD）
4. GitHub Actionsで自動品質チェック（PR時）
5. Git にコミット（自動フォーマット実行）
6. プルリクエストを作成
7. CI/CDパイプラインで品質確認後マージ

詳細な開発ガイドラインは `CLAUDE.md` を参照してください。