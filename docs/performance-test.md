# ⚡ パフォーマンステストガイド

このドキュメントでは、MDブログシステムのパフォーマンステストとベンチマーク実行方法について説明します。

## 📊 テストデータ規模

### デフォルト設定
- **ユーザー数**: 1,000名
- **記事数**: 10,000件
- **決済数**: 25,000件

### 大規模テスト推奨値
- **ユーザー数**: 10,000名
- **記事数**: 100,000件
- **決済数**: 250,000件

## 🚀 分割実行コマンド

大量データを生成する際は、メモリ効率とタイムアウト対策のため、分割実行を推奨します。

### 1️⃣ ユーザーデータ生成

```bash
# 1,000名のユーザーを500名ずつバッチ処理
docker-compose exec backend php artisan seed:performance users --batch-size=500

# 10,000名のユーザーを1,000名ずつバッチ処理
docker-compose exec backend php artisan seed:performance users --users=10000 --batch-size=1000

# オフセットを使用した再開（5,000名目から開始）
docker-compose exec backend php artisan seed:performance users --offset=5000 --limit=5000 --batch-size=1000
```

### 2️⃣ 記事データ生成

```bash
# 10,000記事を500件ずつバッチ処理
docker-compose exec backend php artisan seed:performance articles --batch-size=500

# 100,000記事を1,000件ずつバッチ処理
docker-compose exec backend php artisan seed:performance articles --articles=100000 --batch-size=1000

# 特定範囲のみ生成（50,000件目から20,000件）
docker-compose exec backend php artisan seed:performance articles --offset=50000 --limit=20000 --batch-size=1000
```

### 3️⃣ 決済データ生成

```bash
# 25,000件の決済を1,000件ずつバッチ処理
docker-compose exec backend php artisan seed:performance payments --batch-size=1000

# 250,000件の決済を2,000件ずつバッチ処理
docker-compose exec backend php artisan seed:performance payments --payments=250000 --batch-size=2000

# 中断後の再開（100,000件目から）
docker-compose exec backend php artisan seed:performance payments --offset=100000 --limit=150000 --batch-size=2000
```

### 4️⃣ 一括実行（小規模データのみ推奨）

```bash
# デフォルト設定で全データ生成
docker-compose exec backend php artisan seed:performance all

# カスタム設定で全データ生成（小規模のみ）
docker-compose exec backend php artisan seed:performance all --users=100 --articles=1000 --payments=2500
```

## 🔧 環境変数による制御

`.env`ファイルで以下の設定が可能です：

```env
# パフォーマンステストデータ規模
PERF_TEST_USERS=1000
PERF_TEST_ARTICLES=10000
PERF_TEST_PAYMENTS=25000
PERF_TEST_BATCH_SIZE=500
```

## 📈 パフォーマンス指標

### レスポンスタイム目標
- **記事一覧API**: < 200ms (1万件データ)
- **記事詳細API**: < 100ms
- **検索API**: < 500ms (全文検索)
- **ユーザー一覧API**: < 300ms

### 同時接続数
- **通常時**: 100同時接続
- **ピーク時**: 500同時接続
- **最大想定**: 1000同時接続

## 🧪 負荷テストツール

### Apache Bench (ab)

```bash
# 記事一覧APIの負荷テスト（100並列、1000リクエスト）
ab -n 1000 -c 100 -H "Accept: application/json" http://localhost:8080/api/articles

# 認証付きAPIのテスト
ab -n 1000 -c 100 -H "Authorization: Bearer YOUR_TOKEN" -H "Accept: application/json" http://localhost:8080/api/user
```

### JMeter テストプラン

`tests/jmeter/`ディレクトリに以下のテストプランを用意：
- `article-list-load-test.jmx` - 記事一覧負荷テスト
- `search-performance-test.jmx` - 検索機能負荷テスト
- `payment-stress-test.jmx` - 決済処理ストレステスト

## 🔍 パフォーマンスモニタリング

### MySQLスロークエリログ

```bash
# スロークエリログの有効化
docker-compose exec mysql mysql -u root -proot_password -e "SET GLOBAL slow_query_log = 'ON';"
docker-compose exec mysql mysql -u root -proot_password -e "SET GLOBAL long_query_time = 0.1;"

# ログの確認
docker-compose exec mysql tail -f /var/log/mysql/slow.log
```

### Laravel Debugbarでのプロファイリング

開発環境では自動的に有効化されています：
- SQLクエリ数と実行時間
- メモリ使用量
- 実行時間の詳細

## ⚡ パフォーマンス最適化Tips

### 1. インデックスの確認

```sql
-- 既存インデックスの確認
SHOW INDEX FROM articles;
SHOW INDEX FROM users;
SHOW INDEX FROM payments;

-- クエリ実行計画の確認
EXPLAIN SELECT * FROM articles WHERE status = 'published' AND created_at > '2025-01-01';
```

### 2. Eager Loadingの活用

```php
// N+1問題を避ける
$articles = Article::with(['user', 'tags', 'payments'])->paginate(20);
```

### 3. キャッシュの活用

```php
// Redisキャッシュの利用
$articles = Cache::remember('articles.page.' . $page, 3600, function () {
    return Article::with(['user', 'tags'])->paginate(20);
});
```

## 🚨 トラブルシューティング

### メモリ不足エラー

```bash
# PHPメモリ制限の確認
docker-compose exec backend php -i | grep memory_limit

# 一時的な増加
docker-compose exec backend php -d memory_limit=2G artisan seed:performance articles
```

### タイムアウトエラー

```bash
# 実行時間制限の解除
docker-compose exec backend php -d max_execution_time=0 artisan seed:performance payments
```

### データベース接続エラー

```bash
# 接続数の確認
docker-compose exec mysql mysql -u root -proot_password -e "SHOW VARIABLES LIKE 'max_connections';"

# 接続数の増加（一時的）
docker-compose exec mysql mysql -u root -proot_password -e "SET GLOBAL max_connections = 500;"
```

## 📊 ベンチマーク結果記録

テスト実行後は以下の情報を記録してください：

1. **環境情報**
   - CPUコア数、メモリ容量
   - MySQLバージョン、設定
   - PHPバージョン、設定

2. **テスト条件**
   - データ量（ユーザー数、記事数、決済数）
   - 並列数、リクエスト数
   - テストシナリオ

3. **測定結果**
   - 平均レスポンスタイム
   - 95パーセンタイル値
   - スループット（req/sec）
   - エラー率

## 🔗 関連ドキュメント

- [データベース管理ガイド](database-persistence.md) - インデックス設計の詳細
- [API リファレンス](api-reference.md) - 各APIエンドポイントの仕様
- [開発者ガイド](developer-guide.md) - 開発環境のセットアップ