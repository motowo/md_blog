# 開発タスク

## 0. 開発環境
- **Node.js**: 20.x (LTS)
- **npm**: 10.x (Node.js 20.xに同梱)
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x
- **PHP**: 8.3.x
- **Laravel**: 11.x
- **MySQL**: 8.0.x
- **Docker / Docker Compose**: 最新の安定版

## 1. 開発フェーズ

### 1.1. フェーズ1: MVP (Minimum Viable Product) 開発
- **目的**: ITエンジニアとサイト運営者のコアニーズを満たす最小限の機能を実装し、早期にリリースする。
- **期間**: X週間
- **主要タスク**:
    - ユーザー認証機能（投稿ユーザー、運営者）
    - 高機能マークダウンエディタ
    - 記事投稿・編集・閲覧機能（タグ設定含む）
    - タグシステム（タグでの記事検索）
    - ダークモード対応
    - **[運営/オペレーター向け]** ユーザー・記事管理機能
    - **[運営/マネージャー向け]** 収益管理ダッシュボード
    - **有料記事の購入・閲覧機能（Mock決済）**

### 1.2. フェーズ2: 機能拡張
- **目的**: MVPのフィードバックを元に、ユーザー体験と運営効率を向上させる。
- **期間**: Y週間
- **主要タスク**:
    - プロフィール管理機能
    - 投稿ユーザー向けダッシュボード（収益確認）
    - 収益受け取り設定機能
    - サイト運営者向け収益分配管理
    - コメント機能
    - **[運営/マネージャー向け]** 重要指標可視化ダッシュボード

### 1.3. フェーズ3: さらなる拡張
- **目的**: コミュニティの活性化とマーケティング施策を強化する。
- **期間**: Z週間
- **主要タスク**:
    - サイト設定機能
    - **[運営/オペレーター向け]** タグ管理機能
    - **[運営/オペレーター向け]** 特集記事設定機能
    - お問い合わせ機能
    - お知らせ・アナウンス機能
    - **本番決済システムの導入**

## 2. 開発タスク詳細 (MVPフェーズ)

### 2.1. バックエンド (Laravel API)
| タスクID     | 機能名                         | 担当者 | 予定工数 (h) | 優先度 | 状態   | 備考                                     |
| :----------- | :----------------------------- | :----- | :----------- | :----- | :----- | :--------------------------------------- |
| MVP-BE-001   | DB設計とマイグレーション       | 未定   | 4            | 高     | 未着手 | `tags`, `article_tags`テーブル, `articles.is_featured`追加 |
| MVP-BE-002   | ユーザー登録API                | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-BE-003   | ログインAPI (Sanctum)          | 未定   | 8            | 高     | 未着手 | 投稿ユーザー用と運営者用の認証分離     |
| MVP-BE-004   | 記事作成API (タグ同時登録)     | 未定   | 12           | 高     | 未着手 |                                          |
| MVP-BE-005   | 記事更新API (タグ同時更新)     | 未定   | 12           | 高     | 未着手 |                                          |
| MVP-BE-006   | 記事一覧取得API (タグ絞り込み) | 未定   | 8            | 高     | 未着手 | 特集記事の取得も考慮                     |
| MVP-BE-007   | 記事詳細取得API                | 未定   | 4            | 高     | 未着手 |                                          |
| MVP-BE-008   | タグ一覧取得API                | 未定   | 4            | 高     | 未着手 |                                          |
| MVP-BE-009   | **記事購入API (Mock)**         | 未定   | 12           | 高     | 未着手 | 特定のテストカード番号で成功/失敗を返す  |
| MVP-BE-010   | [運営]ユーザー一覧・停止API    | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-BE-011   | [運営]記事一覧・削除API        | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-BE-012   | [運営]収益ダッシュボードAPI    | 未定   | 8            | 高     | 未着手 | サイト全体の売上などを集計               |

### 2.2. フロントエンド (React/TypeScript)
| タスクID     | 機能名                             | 担当者 | 予定工数 (h) | 優先度 | 状態   | 備考                                     |
| :----------- | :--------------------------------- | :----- | :----------- | :----- | :----- | :--------------------------------------- |
| MVP-FE-001   | UI: ダークモード/ライトモード切替  | 未定   | 8            | 高     | 未着手 | Tailwind CSSで実装                       |
| MVP-FE-002   | UI: ユーザー登録ページ             | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-FE-003   | UI: ログインページ                 | 未定   | 8            | 高     | 未着手 | 投稿ユーザー用と運営者用でUIを分ける     |
| MVP-FE-004   | UI: 高機能マークダウンエディタ導入 | 未定   | 16           | 高     | 未着手 | プレビュー, シンタックスハイライト, コピー |
| MVP-FE-005   | UI: 記事投稿・編集ページ           | 未定   | 12           | 高     | 未着手 | タグ入力機能を含む                       |
| MVP-FE-006   | UI: トップページ (記事一覧, タグ検索) | 未定   | 12           | 高     | 未着手 | 特集記事の表示エリアを追加               |
| MVP-FE-007   | UI: 記事詳細ページ                 | 未定   | 12           | 高     | 未着手 | コードブロック表示, 購入ボタン           |
| MVP-FE-008   | **機能: 記事購入処理 (Mock)**      | 未定   | 8            | 高     | 未着手 | Mock APIを呼び出し、結果に応じてUIを更新   |
| MVP-FE-009   | UI: [運営]ユーザー管理ページ       | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-FE-010   | UI: [運営]記事管理ページ           | 未定   | 8            | 高     | 未着手 |                                          |
| MVP-FE-011   | UI: [運営]収益管理ダッシュボード   | 未定   | 12           | 高     | 未着手 | グラフなどを用いて売上を可視化           |

## 関連ドキュメント

このタスクは以下のドキュメントと連携しています：

- [📋 要件定義書](requirements.md) - 各タスクの要件詳細
- [🏗️ 技術設計書](design.md) - 実装のための技術仕様
- [📊 実装状況](implementation.md) - 最新の完了状況
- [👩‍💻 開発者ガイド](developer-guide.md) - 開発手順とベストプラクティス
- [🔌 API リファレンス](api-reference.md) - API実装のための詳細仕様