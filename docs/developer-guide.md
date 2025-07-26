# 開発者ガイド

## 📋 目次

- [開発環境構築](#開発環境構築)
- [開発フロー](#開発フロー)
- [コーディング規約](#コーディング規約)
- [テスト戦略](#テスト戦略)
- [デプロイメント](#デプロイメント)
- [トラブルシューティング](#トラブルシューティング)

## 🚀 開発環境構築

### 前提条件

#### 必須ソフトウェア
- **Docker Desktop**: 最新の安定版
- **Git**: 2.20以上
- **Node.js**: 20.x LTS（任意：ローカル開発用）
- **PHP**: 8.3.x（任意：ローカル開発用）

#### 推奨開発環境
- **IDE**: Visual Studio Code
- **拡張機能**:
  - Docker
  - PHP Intelephense
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - GitLens

### 詳細セットアップ手順

#### 1. リポジトリの準備

```bash
# リポジトリをクローン
git clone [repository-url]
cd md_blog

# メインブランチから新しいブランチを作成
git checkout -b feature/your-feature-name
```

#### 2. Docker環境の起動

```bash
# Docker環境を起動（初回は時間がかかります）
docker-compose up -d

# ログを確認
docker-compose logs -f

# 起動確認
docker-compose ps
```

#### 3. 初回セットアップの確認

```bash
# バックエンドコンテナに入る
docker-compose exec backend bash

# マイグレーション状態を確認
php artisan migrate:status

# テストデータの確認
php artisan tinker
> User::count(); // 31名（管理者含む）
> Article::count(); // 4,085記事
```

#### 4. フロントエンド開発環境の確認

```bash
# フロントエンドコンテナに入る
docker-compose exec frontend sh

# 依存関係の確認
npm list

# 開発サーバーの確認
npm run dev
```

### 環境変数設定

#### バックエンド環境変数
`.env.example`をコピーして`.env`を作成（Docker起動時に自動作成）

重要な環境変数：
```env
APP_ENV=local
APP_DEBUG=true
DB_HOST=mysql
DB_DATABASE=md_blog
DB_USERNAME=root
DB_PASSWORD=password
```

#### フロントエンド環境変数
必要に応じて`frontend/.env.local`を作成
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🔄 開発フロー

### ブランチ戦略

#### ブランチ命名規則
- **機能開発**: `feature/feature-name`
- **バグ修正**: `fix/bug-description`
- **ドキュメント**: `docs/document-update`
- **リファクタリング**: `refactor/component-name`

#### 推奨フロー

```bash
# 1. mainブランチを最新に更新
git checkout main
git pull origin main

# 2. 新しいブランチを作成
git checkout -b feature/your-feature

# 3. Docker環境を起動
docker-compose up -d

# 4. 開発作業を実行
# ... 開発 ...

# 5. テストを実行
docker-compose exec frontend npm run test
docker-compose exec backend php artisan test

# 6. コード品質チェック
docker-compose exec frontend npm run lint
docker-compose exec backend ./vendor/bin/pint --test

# 7. コミット
git add .
git commit -m "feat: 新機能の実装"

# 8. プッシュ
git push -u origin feature/your-feature

# 9. プルリクエストを作成
```

### コミットメッセージ規約

#### 形式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### タイプ
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの動作に影響しない変更（スペース、フォーマット等）
- **refactor**: バグ修正や機能追加ではないコード変更
- **test**: テストの追加や修正
- **chore**: ビルドプロセスやツールの変更

#### 例
```bash
git commit -m "feat(article): 記事検索機能を実装

- キーワード検索機能を追加
- タグフィルタリング機能を追加
- ページネーション対応

Closes #123"
```

## 📝 コーディング規約

### TypeScript・React

#### ファイル構成
```
frontend/src/
├── components/          # 再利用可能コンポーネント
├── pages/              # ページコンポーネント
├── services/           # API通信
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── hooks/              # カスタムフック
└── styles/             # スタイル関連
```

#### 命名規則
- **コンポーネント**: PascalCase (`ArticleCard.tsx`)
- **ファイル名**: PascalCase (コンポーネント)、camelCase (その他)
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **CSS クラス**: kebab-case

#### コンポーネント設計原則

```typescript
// ❌ 悪い例
function Article(props: any) {
  // 型定義なし、propsが曖昧
}

// ✅ 良い例
interface ArticleProps {
  id: number;
  title: string;
  author: User;
  onEdit?: () => void;
}

function Article({ id, title, author, onEdit }: ArticleProps) {
  // 明確な型定義、分割代入
}
```

#### Hooks使用ガイドライン

```typescript
// ✅ カスタムフック例
function useArticles(filters: ArticleFilters) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 記事取得ロジック
  }, [filters]);

  return { articles, loading, error };
}
```

### Laravel・PHP

#### ファイル構成
```
backend/
├── app/
│   ├── Http/Controllers/   # コントローラー
│   ├── Models/            # Eloquentモデル
│   ├── Services/          # ビジネスロジック
│   └── Requests/          # リクエストバリデーション
├── database/
│   ├── migrations/        # マイグレーション
│   └── seeders/          # シーダー
└── routes/               # ルート定義
```

#### 命名規則
- **クラス**: PascalCase
- **メソッド**: camelCase
- **変数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **テーブル**: snake_case（複数形）
- **カラム**: snake_case

#### コントローラー設計原則

```php
// ✅ 良い例
class ArticleController extends Controller
{
    public function __construct(
        private ArticleService $articleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validated();
        $articles = $this->articleService->getFilteredArticles($filters);
        
        return response()->json([
            'data' => $articles,
            'meta' => [
                'total' => $articles->total(),
                'current_page' => $articles->currentPage(),
            ]
        ]);
    }
}
```

#### サービス層パターン

```php
// ✅ サービス層例
class ArticleService
{
    public function createArticle(array $data, User $author): Article
    {
        DB::transaction(function () use ($data, $author) {
            $article = $author->articles()->create($data);
            
            if (isset($data['tags'])) {
                $article->tags()->sync($data['tags']);
            }
            
            return $article;
        });
    }
}
```

### データベース設計

#### マイグレーション規約

```php
// ✅ マイグレーション例
public function up()
{
    Schema::create('articles', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('title');
        $table->longText('content');
        $table->enum('status', ['published', 'draft'])->default('draft');
        $table->boolean('is_paid')->default(false);
        $table->decimal('price', 10, 0)->nullable();
        $table->timestamps();
        
        // インデックス
        $table->index(['status', 'created_at']);
        $table->index(['user_id', 'status']);
    });
}
```

#### モデル設計原則

```php
// ✅ モデル例
class Article extends Model
{
    protected $fillable = [
        'title', 'content', 'status', 'is_paid', 'price'
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'price' => 'decimal:0',
        'created_at' => 'datetime:Y-m-d H:i:s',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // スコープ
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
```

## 🧪 テスト戦略

### フロントエンドテスト

#### テストツール
- **Jest**: ユニットテスト
- **React Testing Library**: コンポーネントテスト
- **MSW**: APIモック

#### テスト実行

```bash
# 全テスト実行
docker-compose exec frontend npm run test

# ウォッチモード
docker-compose exec frontend npm run test:watch

# カバレッジ
docker-compose exec frontend npm run test:coverage
```

#### テスト例

```typescript
// ✅ コンポーネントテスト例
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';

describe('ArticleCard', () => {
  it('記事タイトルが表示される', () => {
    const article = {
      id: 1,
      title: 'テスト記事',
      author: { name: 'テスト太郎' }
    };

    render(<ArticleCard article={article} />);
    
    expect(screen.getByText('テスト記事')).toBeInTheDocument();
  });
});
```

### バックエンドテスト

#### テストタイプ
- **Unit Test**: 単体テスト
- **Feature Test**: 機能テスト
- **Integration Test**: 統合テスト

#### テスト実行

```bash
# 全テスト実行
docker-compose exec backend php artisan test

# 特定テスト実行
docker-compose exec backend php artisan test --filter=ArticleTest

# カバレッジ
docker-compose exec backend php artisan test --coverage
```

#### テスト例

```php
// ✅ 機能テスト例
class ArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_認証ユーザーは記事を作成できる()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->postJson('/api/articles', [
                'title' => 'テスト記事',
                'content' => 'テスト内容',
                'status' => 'published'
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'title', 'content']
            ]);

        $this->assertDatabaseHas('articles', [
            'title' => 'テスト記事',
            'user_id' => $user->id
        ]);
    }
}
```

## 🚀 デプロイメント

### 本番環境準備

#### 環境変数設定
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_HOST=production-db-host
DB_DATABASE=md_blog_production
DB_USERNAME=production-user
DB_PASSWORD=secure-password
```

#### ビルドコマンド

```bash
# フロントエンドビルド
docker-compose exec frontend npm run build

# バックエンド最適化
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### ステージング環境

```bash
# ステージング環境へのデプロイ
git push origin main

# 自動デプロイ後の確認
curl https://staging.your-domain.com/api/health
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. Docker関連

**問題**: コンテナが起動しない
```bash
# ログを確認
docker-compose logs backend

# ボリュームをクリア
docker-compose down -v
docker-compose up -d
```

**問題**: データベース接続エラー
```bash
# MySQLの起動を確認
docker-compose exec mysql mysqladmin ping -h localhost -u root -p

# 接続テスト
docker-compose exec backend php artisan db:monitor
```

#### 2. フロントエンド関連

**問題**: APIエラー
```bash
# バックエンドの状態確認
curl http://localhost:8000/api/health

# ネットワーク確認
docker-compose exec frontend ping backend
```

**問題**: Node.jsモジュールエラー
```bash
# node_modulesを再インストール
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
```

#### 3. バックエンド関連

**問題**: マイグレーションエラー
```bash
# マイグレーション状態確認
docker-compose exec backend php artisan migrate:status

# ロールバック
docker-compose exec backend php artisan migrate:rollback
```

**問題**: 権限エラー
```bash
# 権限修正
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
docker-compose exec backend chmod -R 755 storage bootstrap/cache
```

### パフォーマンス最適化

#### データベースクエリ最適化
```bash
# クエリログ有効化
docker-compose exec backend php artisan tinker
> DB::enableQueryLog();
> // 処理実行
> DB::getQueryLog();
```

#### キャッシュ最適化
```bash
# アプリケーションキャッシュ
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:cache

# OPcacheステータス確認
docker-compose exec backend php -i | grep opcache
```

### デバッグツール

#### Laravel Telescope（開発環境）
```bash
# Telescope インストール
docker-compose exec backend composer require laravel/telescope --dev
docker-compose exec backend php artisan telescope:install
docker-compose exec backend php artisan migrate

# アクセス: http://localhost:8000/telescope
```

#### React DevTools
ブラウザ拡張機能「React Developer Tools」をインストール

### ログ管理

#### ログの確認
```bash
# アプリケーションログ
docker-compose exec backend tail -f storage/logs/laravel.log

# Dockerログ
docker-compose logs -f --tail=100 backend

# フロントエンドログ
docker-compose logs -f --tail=100 frontend
```

## 📚 参考資料

### 公式ドキュメント
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### プロジェクト固有リソース
- [API リファレンス](api-reference.md)
- [データベース設計](design.md#データ設計)
- [テストデータ仕様](test.md)

このガイドが開発の助けになることを願っています。不明な点があれば、プロジェクトメンバーまでお気軽にお尋ねください。