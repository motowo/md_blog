# データベース永続化に関するドキュメント

## 問題の原因と解決策

### 原因
1. **マイグレーションの重複実行**: 以前のDockerfileでは、コンテナ起動時に毎回`php artisan migrate --force`が実行されていました
2. **データベース状態の未確認**: データベースが既に初期化されているかどうかを確認せずにマイグレーションを実行
3. **Seederの未実行**: テストデータが手動で投入された場合、コンテナ再起動時に再作成されない

### 実装した解決策

#### 1. スマートなエントリーポイントスクリプト
`backend/docker-entrypoint.sh`を作成し、以下の機能を実装：

- **データベース接続待機**: MySQLが完全に起動するまで待機
- **マイグレーション状態確認**: 既存のマイグレーションがあるかチェック
- **条件付き初期化**: データベースが空の場合のみマイグレーションとSeederを実行
- **増分マイグレーション**: 既存データがある場合は、未実行のマイグレーションのみ実行

#### 2. Docker構成の改善
- Dockerfileを更新してカスタムエントリーポイントを使用
- docker-compose.ymlからコマンドを削除（エントリーポイントで処理）

## データ管理のベストプラクティス

### 1. データのバックアップ
```bash
# データベースのバックアップ
docker-compose exec mysql mysqldump -u root -ppassword md_blog > backup.sql

# バックアップのリストア
docker-compose exec -T mysql mysql -u root -ppassword md_blog < backup.sql
```

### 2. ボリュームの確認
```bash
# ボリュームの一覧表示
docker volume ls

# ボリュームの詳細確認
docker volume inspect md_blog_mysql_data
```

### 3. データの完全リセット（必要な場合のみ）
```bash
# ⚠️ 警告: すべてのデータが削除されます
docker-compose down -v
docker-compose up -d
```

### 4. 開発環境のデータ初期化
```bash
# Seederを使用してテストデータを再投入
docker-compose exec backend php artisan db:seed
```

## トラブルシューティング

### データが消えた場合
1. ボリュームが正しくマウントされているか確認
2. コンテナのログを確認: `docker-compose logs backend`
3. マイグレーション状態を確認: `docker-compose exec backend php artisan migrate:status`

### データベース接続エラー
1. MySQLコンテナが起動しているか確認: `docker-compose ps`
2. 環境変数が正しく設定されているか確認
3. ネットワーク接続を確認: `docker-compose exec backend ping mysql`

## マイグレーションの追加手順

### 1. 新しいマイグレーションファイルの作成
```bash
# モデルと一緒に作成
docker-compose exec backend php artisan make:model ModelName -m

# マイグレーションのみ作成
docker-compose exec backend php artisan make:migration create_table_name_table

# テーブル変更用マイグレーション
docker-compose exec backend php artisan make:migration add_column_to_table_name_table
```

### 2. マイグレーションファイルの編集
```php
// database/migrations/xxxx_xx_xx_xxxxxx_create_table_name_table.php
public function up()
{
    Schema::create('table_name', function (Blueprint $table) {
        $table->id();
        $table->string('column_name');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('table_name');
}
```

### 3. マイグレーションの実行
```bash
# 未実行のマイグレーションを実行
docker-compose exec backend php artisan migrate

# 特定のマイグレーションのロールバック
docker-compose exec backend php artisan migrate:rollback --step=1

# すべてをロールバックして再実行（開発環境のみ）
docker-compose exec backend php artisan migrate:fresh
```

## Seederの追加手順

### 1. Seederファイルの作成
```bash
docker-compose exec backend php artisan make:seeder UserSeeder
```

### 2. Seederの実装
```php
// database/seeders/UserSeeder.php
public function run()
{
    User::factory()->count(10)->create();
    
    // または個別にデータを作成
    User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => Hash::make('password'),
    ]);
}
```

### 3. DatabaseSeederへの登録
```php
// database/seeders/DatabaseSeeder.php
public function run()
{
    $this->call([
        UserSeeder::class,
        ArticleSeeder::class,
        // 他のSeederをここに追加
    ]);
}
```

### 4. Seederの実行
```bash
# すべてのSeederを実行
docker-compose exec backend php artisan db:seed

# 特定のSeederのみ実行
docker-compose exec backend php artisan db:seed --class=UserSeeder

# マイグレーションとSeederを同時に実行（開発環境のみ）
docker-compose exec backend php artisan migrate:fresh --seed
```

## マイグレーション・Seeder使用時の注意点

### 開発環境での注意点
1. **データの保護**
   - `migrate:fresh`はすべてのテーブルを削除するため、重要なテストデータがある場合は事前にバックアップ
   - 本番データのコピーを使用している場合は特に注意

2. **チーム開発での同期**
   - 新しいマイグレーションを追加したら、必ずチームメンバーに共有
   - マイグレーションファイル名の日時は変更しない（実行順序が狂う）

3. **Seederの冪等性**
   - Seederは複数回実行されても問題ないように設計する
   - 既存データのチェックを入れる
   ```php
   if (User::where('email', 'admin@example.com')->doesntExist()) {
       User::create([...]);
   }
   ```

### 本番環境での注意点
1. **絶対にやってはいけないこと**
   - `migrate:fresh`や`migrate:refresh`の使用
   - `--force`オプションの無闇な使用
   - 未テストのマイグレーションの実行

2. **推奨される手順**
   - ステージング環境で十分にテスト
   - データベースのバックアップを取得
   - メンテナンスモードに切り替え
   ```bash
   php artisan down
   php artisan migrate
   php artisan up
   ```

3. **ロールバック戦略**
   - `down()`メソッドを必ず実装
   - データの復元が可能か確認
   - 外部キー制約の順序に注意

### Docker環境特有の注意点
1. **コンテナ再起動時の動作**
   - `docker-entrypoint.sh`により、未実行のマイグレーションのみ自動実行
   - Seederは初回のみ実行（既存データがある場合はスキップ）

2. **開発データのリセット**
   ```bash
   # データベースを完全にリセットしたい場合
   docker-compose down -v
   docker-compose up -d
   ```

3. **マイグレーション状態の確認**
   ```bash
   # 現在のマイグレーション状態を確認
   docker-compose exec backend php artisan migrate:status
   ```

## 重要な注意事項

- **本番環境では絶対に`--force`オプションを使用しない**
- **定期的なバックアップを実施する**
- **ボリュームの削除は慎重に行う**
- **テスト環境と本番環境のデータベースを明確に分離する**
- **マイグレーションは必ずバージョン管理に含める**
- **Seederファイルには機密情報を含めない**