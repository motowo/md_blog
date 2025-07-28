# API リファレンス

## 📋 目次

- [概要](#概要)
- [認証](#認証)
- [共通仕様](#共通仕様)
- [認証API](#認証api)
- [記事管理API](#記事管理api)
- [ユーザー管理API](#ユーザー管理api)
- [タグ管理API](#タグ管理api)
- [決済API](#決済api)
- [管理者API](#管理者api)
- [エラーハンドリング](#エラーハンドリング)

## 📖 概要

MD Blog REST API v1の完全リファレンスです。このAPIはLaravel 11とLaravel Sanctumを使用して構築されています。

### ベースURL
```
http://localhost:8000/api
```

### 認証方式
- **Laravel Sanctum**: トークンベース認証
- **Bearer Token**: `Authorization: Bearer {token}`

### データ形式
- **リクエスト**: `application/json`
- **レスポンス**: `application/json`

## 🔐 認証

### トークンの取得
ログインエンドポイントで認証トークンを取得し、以降のリクエストで使用します。

```bash
# ログイン
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# レスポンス例
{
  "user": { "id": 1, "name": "ユーザー名" },
  "token": "1|abc123..."
}
```

### トークンの使用
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Accept: application/json"
```

## 📏 共通仕様

### レスポンス形式

#### 成功レスポンス
```json
{
  "data": {}, // または []
  "meta": {   // ページネーション時のみ
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

#### エラーレスポンス
```json
{
  "message": "エラーメッセージ",
  "errors": {
    "field_name": ["具体的なエラー内容"]
  }
}
```

### ページネーション
```bash
GET /api/articles?page=2&per_page=15
```

### フィルタリング・検索
```bash
GET /api/articles?search=React&tags=javascript,frontend&status=published
```

## 🔑 認証API

### ユーザー登録

**エンドポイント**: `POST /api/register`

**リクエスト**:
```json
{
  "name": "田中太郎",
  "username": "tanaka_taro",
  "email": "tanaka@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "author"
}
```

**レスポンス** (201 Created):
```json
{
  "user": {
    "id": 1,
    "name": "田中太郎",
    "username": "tanaka_taro",
    "email": "tanaka@example.com",
    "role": "author",
    "created_at": "2025-01-26T10:00:00Z"
  },
  "token": "1|abc123..."
}
```

### ログイン

**エンドポイント**: `POST /api/login`

**リクエスト**:
```json
{
  "email": "tanaka@example.com",
  "password": "password123",
  "remember": true
}
```

**レスポンス** (200 OK):
```json
{
  "user": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "author"
  },
  "token": "1|abc123..."
}
```

### ログアウト

**エンドポイント**: `POST /api/logout`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "message": "ログアウトしました"
}
```

### ユーザー情報取得

**エンドポイント**: `GET /api/user`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "id": 1,
  "name": "田中太郎",
  "username": "tanaka_taro",
  "email": "tanaka@example.com",
  "role": "author",
  "bio": "フルスタック開発者です",
  "avatar_url": "data:image/png;base64,..."
}
```

## 📝 記事管理API

### 記事一覧取得

**エンドポイント**: `GET /api/articles`

**パラメータ**:
- `page` (integer): ページ番号
- `per_page` (integer): 1ページあたりの件数 (最大50)
- `search` (string): キーワード検索（タイトル・本文）
- `tags` (string): タグフィルター（カンマ区切り）
- `status` (string): 公開ステータス (`published`, `draft`)

**リクエスト例**:
```bash
GET /api/articles?search=React&tags=javascript,frontend&page=1&per_page=15
```

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "title": "React Hooksの使い方",
      "excerpt": "React Hooksの基本的な使い方を解説...",
      "status": "published",
      "is_paid": true,
      "price": 500,
      "created_at": "2025-01-25T10:00:00Z",
      "user": {
        "id": 1,
        "name": "田中太郎",
        "username": "tanaka_taro",
        "avatar_url": "data:image/png;base64,..."
      },
      "tags": [
        { "id": 1, "name": "React", "slug": "react" },
        { "id": 2, "name": "JavaScript", "slug": "javascript" }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

### 新着記事取得

**エンドポイント**: `GET /api/articles/recent`

**パラメータ**:
- `limit` (integer): 取得件数 (デフォルト: 10, 最大: 50)

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 100,
      "title": "最新のReact記事",
      "excerpt": "最新のReact機能について...",
      "created_at": "2025-01-26T09:00:00Z",
      "user": {
        "name": "佐藤花子",
        "username": "sato_hanako"
      }
    }
  ]
}
```

### 注目記事取得

**エンドポイント**: `GET /api/articles/trending`

**パラメータ**:
- `limit` (integer): 取得件数 (デフォルト: 10, 最大: 50)

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 50,
      "title": "人気のVue.js記事",
      "total_sales": 15000,
      "payments_count": 30,
      "user": {
        "name": "山田次郎",
        "username": "yamada_jiro"
      }
    }
  ]
}
```

### 記事詳細取得

**エンドポイント**: `GET /api/articles/{id}`

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "title": "React Hooksの使い方",
    "content": "# React Hooksとは\n\nReact Hooksは...",
    "status": "published",
    "is_paid": true,
    "price": 500,
    "created_at": "2025-01-25T10:00:00Z",
    "updated_at": "2025-01-25T15:30:00Z",
    "user": {
      "id": 1,
      "name": "田中太郎",
      "username": "tanaka_taro",
      "bio": "フルスタック開発者",
      "avatar_url": "data:image/png;base64,..."
    },
    "tags": [
      { "id": 1, "name": "React", "slug": "react" },
      { "id": 2, "name": "JavaScript", "slug": "javascript" }
    ]
  },
  "has_purchased": false,
  "can_edit": false
}
```

### 記事作成

**エンドポイント**: `POST /api/articles`

**認証**: 必要

**リクエスト**:
```json
{
  "title": "新しいTypeScript記事",
  "content": "# TypeScriptの基礎\n\nTypeScriptは...",
  "status": "draft",
  "is_paid": true,
  "price": 800,
  "tag_ids": [1, 2, 3]
}
```

**レスポンス** (201 Created):
```json
{
  "data": {
    "id": 101,
    "title": "新しいTypeScript記事",
    "content": "# TypeScriptの基礎...",
    "status": "draft",
    "is_paid": true,
    "price": 800,
    "user_id": 1,
    "created_at": "2025-01-26T10:00:00Z"
  }
}
```

### 記事更新

**エンドポイント**: `PUT /api/articles/{id}`

**認証**: 必要（作成者または管理者のみ）

**リクエスト**: 記事作成と同様

**レスポンス** (200 OK): 更新された記事データ

### 記事削除

**エンドポイント**: `DELETE /api/articles/{id}`

**認証**: 必要（作成者または管理者のみ）

**レスポンス** (200 OK):
```json
{
  "message": "記事を削除しました"
}
```

### 自分の記事一覧

**エンドポイント**: `GET /api/articles/user`

**認証**: 必要

**パラメータ**: 記事一覧取得と同様

**レスポンス** (200 OK): 自分の記事のみの一覧

## 👤 ユーザー管理API

### プロフィール更新

**エンドポイント**: `PUT /api/user/profile`

**認証**: 必要

**リクエスト**:
```json
{
  "name": "田中太郎",
  "username": "tanaka_taro_new",
  "email": "newemail@example.com",
  "bio": "フルスタック開発者です",
  "career_description": "5年間のWeb開発経験があります",
  "x_url": "https://x.com/tanaka_taro",
  "github_url": "https://github.com/tanaka-taro",
  "profile_public": true
}
```

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "name": "田中太郎",
    "username": "tanaka_taro_new",
    "email": "newemail@example.com",
    "bio": "フルスタック開発者です",
    "profile_public": true
  }
}
```

### パスワード変更

**エンドポイント**: `PUT /api/user/password`

**認証**: 必要

**リクエスト**:
```json
{
  "current_password": "old_password",
  "new_password": "new_password123",
  "new_password_confirmation": "new_password123"
}
```

**レスポンス** (200 OK):
```json
{
  "message": "パスワードを変更しました"
}
```

### アクティビティ取得

**エンドポイント**: `GET /api/user/activity`

**認証**: 必要

**パラメータ**:
- `year` (integer): 対象年度 (デフォルト: 現在年)

**レスポンス** (200 OK):
```json
{
  "data": {
    "year": 2025,
    "total_articles": 45,
    "paid_articles": 20,
    "free_articles": 25,
    "activities": [
      {
        "date": "2025-01-26",
        "total": 2,
        "paid": 1,
        "free": 1
      }
    ]
  }
}
```

### 公開プロフィール取得

**エンドポイント**: `GET /api/users/{username}`

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "name": "田中太郎",
    "username": "tanaka_taro",
    "bio": "フルスタック開発者です",
    "career_description": "5年間のWeb開発経験",
    "x_url": "https://x.com/tanaka_taro",
    "github_url": "https://github.com/tanaka-taro",
    "avatar_url": "data:image/png;base64,...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 公開ユーザーの記事一覧

**エンドポイント**: `GET /api/users/{username}/articles`

**パラメータ**: 記事一覧取得と同様

**レスポンス** (200 OK): そのユーザーの公開記事一覧

### 公開ユーザーのアクティビティ

**エンドポイント**: `GET /api/users/{username}/activity`

**パラメータ**:
- `year` (integer): 対象年度

**レスポンス** (200 OK): そのユーザーのアクティビティデータ

## 🏷️ タグ管理API

### タグ一覧取得

**エンドポイント**: `GET /api/tags`

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "React",
      "slug": "react",
      "articles_count": 150
    },
    {
      "id": 2,
      "name": "JavaScript",
      "slug": "javascript",
      "articles_count": 200
    }
  ]
}
```

### タグ詳細取得

**エンドポイント**: `GET /api/tags/{id}`

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "name": "React",
    "slug": "react",
    "created_at": "2024-01-01T00:00:00Z",
    "articles_count": 150
  }
}
```

### タグ作成

**エンドポイント**: `POST /api/tags`

**認証**: 必要（管理者のみ）

**リクエスト**:
```json
{
  "name": "Vue.js",
  "slug": "vuejs"
}
```

**レスポンス** (201 Created): 作成されたタグデータ

## 💳 決済API

### 記事購入 (Mock)

**エンドポイント**: `POST /api/payments`

**認証**: 必要

**リクエスト**:
```json
{
  "article_id": 1,
  "card_number": "4242424242424242",
  "card_name": "TANAKA TARO",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123"
}
```

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "article_id": 1,
    "amount": 500,
    "status": "success",
    "transaction_id": "mock_txn_123456",
    "created_at": "2025-01-26T10:00:00Z"
  }
}
```

### 決済履歴取得

**エンドポイント**: `GET /api/payments`

**認証**: 必要

**パラメータ**:
- `page`, `per_page`: ページネーション
- `status`: 決済ステータス

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "amount": 500,
      "status": "success",
      "created_at": "2025-01-26T10:00:00Z",
      "article": {
        "id": 1,
        "title": "React Hooksの使い方",
        "user": {
          "name": "田中太郎"
        }
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 25
  }
}
```

### クレジットカード取得

**エンドポイント**: `GET /api/credit-card`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "data": {
    "id": 1,
    "last_four": "4242",
    "brand": "visa",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cardholder_name": "TANAKA TARO"
  }
}
```

### クレジットカード登録・更新

**エンドポイント**: `POST /api/credit-card`

**認証**: 必要

**リクエスト**:
```json
{
  "card_number": "4242424242424242",
  "cardholder_name": "TANAKA TARO",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123"
}
```

**レスポンス** (200 OK): 登録されたカード情報（マスク済み）

## 👑 管理者API

### ダッシュボード統計

**エンドポイント**: `GET /api/admin/dashboard`

**認証**: 必要（管理者のみ）

**レスポンス** (200 OK):
```json
{
  "statistics": {
    "total_users": 30,
    "total_articles": 4085,
    "total_payments": 9857,
    "total_revenue": 6693000,
    "commission_earned": 669300
  },
  "monthly_sales": [
    { "month": "2025-01", "sales": 1500000, "count": 1200 },
    { "month": "2024-12", "sales": 1200000, "count": 980 }
  ]
}
```

### ユーザー管理

**エンドポイント**: `GET /api/admin/users`

**認証**: 必要（管理者のみ）

**パラメータ**:
- `search`: ユーザー名・メールアドレス検索
- `status`: アカウント状態 (`active`, `inactive`)
- `role`: ユーザーロール

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "author",
      "is_active": true,
      "articles_count": 45,
      "total_earnings": 150000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 30
  }
}
```

### ユーザー状態更新

**エンドポイント**: `PUT /api/admin/users/{id}`

**認証**: 必要（管理者のみ）

**リクエスト**:
```json
{
  "is_active": false
}
```

**レスポンス** (200 OK): 更新されたユーザー情報

### 振込管理

**エンドポイント**: `GET /api/admin/payouts`

**認証**: 必要（管理者のみ）

**パラメータ**:
- `month`: 対象月 (YYYY-MM形式)
- `status`: 支払い状態

**レスポンス** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "user": {
        "name": "田中太郎",
        "email": "tanaka@example.com"
      },
      "period": "2025-01",
      "amount": 25000,
      "status": "unpaid",
      "created_at": "2025-02-01T00:00:00Z"
    }
  ]
}
```

## ❌ エラーハンドリング

### HTTPステータスコード

| コード | 意味 | 説明 |
|--------|------|------|
| 200 | OK | リクエスト成功 |
| 201 | Created | リソース作成成功 |
| 400 | Bad Request | リクエストが不正 |
| 401 | Unauthorized | 認証が必要 |
| 403 | Forbidden | アクセス権限なし |
| 404 | Not Found | リソースが見つからない |
| 422 | Unprocessable Entity | バリデーションエラー |
| 429 | Too Many Requests | レート制限超過 |
| 500 | Internal Server Error | サーバーエラー |

### エラーレスポンス例

#### バリデーションエラー (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["メールアドレスの形式が正しくありません"],
    "password": ["パスワードは8文字以上で入力してください"]
  }
}
```

#### 認証エラー (401)
```json
{
  "message": "認証が必要です"
}
```

#### 権限エラー (403)
```json
{
  "message": "この操作を実行する権限がありません"
}
```

#### リソース未発見 (404)
```json
{
  "message": "指定されたリソースが見つかりません"
}
```

### レート制限

APIには以下のレート制限が適用されます：

- **認証済みユーザー**: 60リクエスト/分
- **未認証ユーザー**: 30リクエスト/分

レート制限に達した場合、429ステータスコードが返されます。

### デバッグ情報

開発環境では、エラーレスポンスに追加のデバッグ情報が含まれる場合があります：

```json
{
  "message": "サーバーエラーが発生しました",
  "file": "/app/Http/Controllers/ArticleController.php",
  "line": 45,
  "trace": [...]
}
```

**注意**: 本番環境では、セキュリティ上の理由によりデバッグ情報は表示されません。