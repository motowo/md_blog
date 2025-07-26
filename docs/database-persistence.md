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

## 重要な注意事項

- **本番環境では絶対に`--force`オプションを使用しない**
- **定期的なバックアップを実施する**
- **ボリュームの削除は慎重に行う**
- **テスト環境と本番環境のデータベースを明確に分離する**