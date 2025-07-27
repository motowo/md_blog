# MD Blog - ITエンジニア向け有料コンテンツ共有プラットフォーム

## 🚀 クイックスタート

### 前提条件
- Docker Desktop がインストールされていること
- Git がインストールされていること

### セットアップ手順

1. **リポジトリをクローン**
```bash
git clone [repository-url]
cd md_blog
```

2. **Docker環境を起動**
```bash
docker-compose up -d
```

初回起動時は、以下の処理が自動で実行されます：
- Laravelプロジェクトの初期化
- 依存パッケージのインストール
- データベースのマイグレーション
- テストデータの投入

3. **アプリケーションへのアクセス**
- フロントエンド: http://localhost/ (ポート80)
- バックエンド API: http://localhost:8000
- phpMyAdmin: http://localhost:8080

### テストアカウント

#### 管理者アカウント
- **Email**: admin@md-blog.local
- **Password**: password123

#### 一般ユーザーアカウント（推奨）
- **田中太郎**: tanaka@example.com / taro2024（360記事、ヒートマップテスト用）
- **佐藤花子**: sato@example.com / hanako123（330記事、フロントエンド専門）

#### Mock決済テストカード
- **成功**: `4242424242424242`
- **カード拒否**: `4000000000000002`
- **残高不足**: `4000000000009995`

## ⭐ 主要機能ハイライト

### ✅ 完了済み機能
- **記事管理**: 高機能Markdownエディタ、自動保存、シンタックスハイライト（27言語対応）
- **決済システム**: Mock決済による有料記事購入、クレジットカード管理
- **検索・フィルタリング**: キーワード検索、複数タグ検索、組み合わせ検索
- **ユーザー管理**: プロフィール、カスタムアバター、アクティビティヒートマップ
- **管理者機能**: ユーザー・記事・振込管理、統計ダッシュボード、管理画面UI修正
- **UI/UX**: ダークモード、レスポンシブデザイン、トップページカルーセル
- **記事購入フロー**: 有料記事の直接遷移機能、購入履歴からの記事アクセス機能改善

### 🚧 開発中・計画中
- **コメント機能**: 記事へのコメント投稿・返信システム
- **画像アップロード**: Markdownエディタでの画像挿入機能
- **本番決済**: 実際の決済システム統合

## 🛠️ 技術スタック

- **フロントエンド**: React.js (v19), TypeScript (v5), TailwindCSS (v4), Vite
- **バックエンド**: PHP (v8.3), Laravel (v11)
- **データベース**: MySQL (v8.0)
- **コンテナ**: Docker / Docker Compose
- **認証**: Laravel Sanctum
- **品質管理**: ESLint, Prettier, Laravel Pint, GitHub Actions

## 📁 プロジェクト構造

```
md_blog/
├── README.md              # プロジェクト概要（本ファイル）
├── docker-compose.yml     # Docker環境定義
├── docs/                  # プロジェクトドキュメント
│   ├── developer-guide.md # 開発者向け完全ガイド
│   ├── api-reference.md   # REST API仕様書
│   └── ...               # 各種ドキュメント
├── frontend/             # React フロントエンド
│   ├── src/
│   │   ├── components/   # 再利用可能コンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── utils/        # API通信・ユーティリティ
│   │   └── types/        # TypeScript型定義
│   └── package.json      # npm依存関係
└── backend/              # Laravel バックエンド
    ├── app/
    │   ├── Http/Controllers/API/  # API コントローラー
    │   ├── Models/       # Eloquent モデル
    │   └── Services/     # ビジネスロジック
    ├── database/
    │   ├── migrations/   # データベース設計
    │   └── seeders/      # テストデータ
    └── composer.json     # PHP依存関係
```

詳細な構造と開発手順は [開発者ガイド](docs/developer-guide.md) をご確認ください。

## 📚 ドキュメント

### 📋 プロジェクト仕様
- [📋 要件定義書](docs/requirements.md) - システム要件と機能仕様
- [🏗️ 技術設計書](docs/design.md) - API・データベース設計
- [📊 実装状況](docs/implementation.md) - 詳細な開発進捗
- [📝 開発タスク](docs/tasks.md) - 開発計画とタスク管理

### 🔧 開発者向け
- [👩‍💻 開発者ガイド](docs/developer-guide.md) - 開発環境・フロー完全ガイド
- [🔌 API リファレンス](docs/api-reference.md) - REST API仕様書
- [🗄️ データベース管理ガイド](docs/database-persistence.md) - マイグレーション・Seeder完全ガイド

### 🧪 テスト・品質
- [🧪 テストデータ仕様](docs/test.md) - テストアカウント・データの詳細仕様
- [⚡ パフォーマンステストガイド](docs/performance-test.md) - 大規模データ生成・負荷テスト

## 🔄 開発フロー

1. mainブランチから新しいブランチを作成 (`git checkout -b feature/xxx`)
2. Docker環境を起動 (`docker-compose up -d`)
3. 開発・テスト実行
4. プルリクエストを作成
5. CI/CDパイプラインで品質確認後マージ

詳細な開発ガイドラインは [開発者ガイド](docs/developer-guide.md) を参照してください。

## 🎯 プロジェクト統計

### 基本データ
- **総記事数**: 4,114記事（有料1,827件、無料2,287件）
- **ユーザー数**: 2,231名（日本人ユーザー、ローマ字ユーザー名）
- **決済データ**: 9,866件の購入履歴（2020-2025年の幅広い期間）
- **パフォーマンステスト**: 大規模データ生成対応（分割バッチ処理）

### テストデータの特徴
- **文字エンコーディング**: UTF8MB4対応（絵文字・多言語サポート）
- **期間分散**: 2020年1月〜2025年7月の時系列データ
- **手数料境界テスト**: 料率変更前後のテストケース完備
- **エラーケーステスト**: SQLインジェクション・XSS・極端値テスト
- **パフォーマンステスト**: 大規模データでの動作検証対応

## 📞 サポート

- **開発ガイド**: [docs/developer-guide.md](docs/developer-guide.md)
- **トラブルシューティング**: [docs/database-persistence.md](docs/database-persistence.md)
- **API仕様**: [docs/api-reference.md](docs/api-reference.md)