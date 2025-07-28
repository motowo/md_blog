## 開発フロー

### 基本ルール

- すべて日本語でレスポンスします
- git ブランチを作成し開発をスタートします
- 1タスクごとに実施してください
- Docker Composeを使用した開発環境で作業します
- 仕様は要件定義 (docs/01_requirements.md) 及び、 技術設計書(docs/02_design.md)に記載されています
- 実装タスクはdocs/04_tasks.mdに記載されています

### 新しい開発開始時の手順

1. mainブランチに切り替える (`git checkout main`)
2. 最新のmainブランチを取得 (`git pull origin main`)
3. mainブランチから新しいブランチを作成 (`git checkout -b feature/xxx`)
4. Docker環境を起動 (`docker-compose up -d`)
5. 開発を開始する

### タスク開始時の手順

1. 仕様を満たすテストを作成する
2. テストが失敗することを確認する(TDD)

### タスク完了時の手順

1. コードをフォーマッターにかけ、コードの体裁を整える
2. テストを実行してください。エラーなくテストが実行できることを確認する
3. README.mdに仕様を記載する(更新する)
4. Git に commit する。タスクの内容をコメントに記載する

### 開発完了時の手順

1. Linter を実行してコード品質をチェック (`docker-compose exec frontend npm run lint`)
2. Formatter を実行してコード整形 (`docker-compose exec frontend npm run format`)
3. テストを実行してエラーがないことを確認 (`docker-compose exec frontend npm run test`)
4. 全チェックが通ったら、Git に pushする (`git push -u origin feature/xxx`)
5. プルリクエストに記載する内容の提案をだしてください

## テスト戦略

- 各サービスは独立してテスト可能
- TDD（テスト駆動開発）を採用
- ユニットテスト

## コード品質

- TypeScript を使用（フロントエンド・バックエンド共通）
- ESLint + Prettier でコード品質管理
- Git commit 前に自動フォーマット実行


## フォーマッター・リンター

- npm run format: Prettier でコード整形
- npm run lint: ESLint でコード品質チェック
- npm run test: Jest でテスト実行

## Docker環境

### 主要コマンド
- `docker-compose up -d`: 環境起動
- `docker-compose down`: 環境停止
- `docker-compose exec frontend sh`: frontendコンテナにアクセス
- `docker-compose logs -f frontend`: ログ確認

### 注意事項
- 開発時はホットリロードが有効
- node_modulesはDockerボリュームで管理
- ポートは8080で公開
