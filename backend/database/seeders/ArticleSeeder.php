<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@md-blog.local')->first();
        if (! $admin) {
            $this->command->error('Admin user not found. Please run UserSeeder first.');

            return;
        }

        $articles = [
            [
                'title' => 'React Hooksの基本と活用方法',
                'content' => $this->getReactHooksContent(),
                'status' => 'published',
                'is_paid' => false,
                'tags' => ['react', 'javascript', 'typescript'],
            ],
            [
                'title' => 'Laravel 11の新機能とアップグレード手順',
                'content' => $this->getLaravelContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 1500,
                'tags' => ['laravel', 'php'],
            ],
            [
                'title' => 'TypeScriptでのAPI型安全性の実現',
                'content' => $this->getTypeScriptApiContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 2000,
                'tags' => ['typescript', 'api-design', 'javascript'],
            ],
            [
                'title' => 'Dockerを使った開発環境構築のベストプラクティス',
                'content' => $this->getDockerContent(),
                'status' => 'published',
                'is_paid' => false,
                'tags' => ['docker', 'nodejs', 'php'],
            ],
            [
                'title' => 'Next.js App Routerの完全ガイド',
                'content' => $this->getNextJsContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 2500,
                'tags' => ['nextjs', 'react', 'typescript'],
            ],
            [
                'title' => 'AWS Lambda + Node.jsでサーバーレス開発',
                'content' => $this->getAwsLambdaContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 3000,
                'tags' => ['aws', 'nodejs', 'api-design'],
            ],
            [
                'title' => 'Vue.js 3 Composition APIの実践的活用法',
                'content' => $this->getVueCompositionContent(),
                'status' => 'published',
                'is_paid' => false,
                'tags' => ['vuejs', 'javascript', 'typescript'],
            ],
            [
                'title' => 'Python Django REST APIの設計パターン',
                'content' => $this->getDjangoContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 2200,
                'tags' => ['python', 'django', 'api-design'],
            ],
            [
                'title' => 'Go言語でのマイクロサービス設計',
                'content' => $this->getGoMicroservicesContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 3500,
                'tags' => ['go', 'api-design', 'docker'],
            ],
            [
                'title' => 'MySQL パフォーマンスチューニング入門',
                'content' => $this->getMySQLContent(),
                'status' => 'published',
                'is_paid' => false,
                'tags' => ['mysql', 'php', 'python'],
            ],
            [
                'title' => 'React Native + Expo開発環境の構築',
                'content' => $this->getReactNativeContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 1800,
                'tags' => ['react', 'javascript', 'typescript'],
            ],
            [
                'title' => 'GraphQL APIの設計と実装パターン',
                'content' => $this->getGraphQLContent(),
                'status' => 'published',
                'is_paid' => true,
                'price' => 2800,
                'tags' => ['api-design', 'nodejs', 'typescript'],
            ],
        ];

        foreach ($articles as $articleData) {
            $tags = $articleData['tags'];
            unset($articleData['tags']);

            $article = Article::create([
                'user_id' => $admin->id,
                ...$articleData,
            ]);

            // タグを関連付け
            $tagIds = Tag::whereIn('slug', $tags)->pluck('id');
            $article->tags()->attach($tagIds);
        }
    }

    private function getReactHooksContent(): string
    {
        return <<<'MD'
# React Hooksの基本と活用方法

React Hooksは、React 16.8で導入された機能で、関数コンポーネントでstate管理や副作用処理を行うことができます。

## useState フック

最も基本的なフックの一つです。

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        増加
      </button>
    </div>
  );
}
```

## useEffect フック

副作用処理を行うためのフックです。

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) return <div>読み込み中...</div>;
  if (!user) return <div>ユーザーが見つかりません</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## カスタムフック

ロジックを再利用可能な形で抽出できます。

```javascript
import { useState, useEffect } from 'react';

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

## まとめ

React Hooksを使うことで、より簡潔で再利用可能なコンポーネントを作成できます。適切に活用することで、コードの可読性と保守性が大幅に向上します。
MD;
    }

    private function getLaravelContent(): string
    {
        return <<<'MD'
# Laravel 11の新機能とアップグレード手順

Laravel 11では多くの新機能と改善が導入されました。

## 主な新機能

### 1. 改善されたルーティング

```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/users/{user}', function (User $user) {
    return $user;
})->middleware(['auth', 'verified']);

Route::prefix('api/v1')->group(function () {
    Route::apiResource('posts', PostController::class);
});
```

### 2. 新しいキューシステム

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly Payment $payment
    ) {}

    public function handle(): void
    {
        // 支払い処理のロジック
        $this->payment->process();
    }
}
```

### 3. 強化されたEloquent

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

## アップグレード手順

1. PHP 8.2以上にアップグレード
2. Composerの依存関係を更新
3. 設定ファイルの移行
4. テストの実行と修正

```bash
composer update
php artisan migrate
php artisan test
```

詳細な手順については公式ドキュメントを参照してください。
MD;
    }

    private function getTypeScriptApiContent(): string
    {
        return <<<'MD'
# TypeScriptでのAPI型安全性の実現

TypeScriptを使ってAPI通信の型安全性を確保する方法を解説します。

## Zodを使った型バリデーション

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>;

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  return UserSchema.parse(data);
}
```

## APIクライアントの型定義

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  async post<T, U>(
    endpoint: string, 
    data: T
  ): Promise<ApiResponse<U>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

型安全性を保ちながら効率的なAPI通信を実現できます。
MD;
    }

    private function getDockerContent(): string
    {
        return <<<'MD'
# Dockerを使った開発環境構築のベストプラクティス

Dockerを活用した効率的な開発環境の構築方法を解説します。

## Dockerfileの最適化

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - database
    environment:
      - DB_HOST=database

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: app_db
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

効率的な開発環境を構築できます。
MD;
    }

    private function getNextJsContent(): string
    {
        return <<<'MD'
# Next.js App Routerの完全ガイド

Next.js 13で導入されたApp Routerの使い方を解説します。

## ディレクトリ構造

```
app/
├── layout.tsx
├── page.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── posts/
│   ├── [id]/
│   │   └── page.tsx
│   └── page.tsx
└── api/
    └── posts/
        └── route.ts
```

## レイアウトの作成

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav>ナビゲーション</nav>
        </header>
        <main>{children}</main>
        <footer>フッター</footer>
      </body>
    </html>
  );
}
```

## API Routeの実装

```typescript
// app/api/posts/route.ts
export async function GET() {
  const posts = await fetchPosts();
  return Response.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await createPost(body);
  return Response.json(post, { status: 201 });
}
```

App Routerで効率的なアプリケーションを構築できます。
MD;
    }

    private function getAwsLambdaContent(): string
    {
        return <<<'MD'
# AWS Lambda + Node.jsでサーバーレス開発

AWS Lambdaを使ったサーバーレスアプリケーションの開発手法を解説します。

## Lambda関数の基本構造

```javascript
exports.handler = async (event, context) => {
    try {
        const { httpMethod, path, body } = event;
        
        switch (httpMethod) {
            case 'GET':
                return await handleGet(path);
            case 'POST':
                return await handlePost(path, JSON.parse(body));
            default:
                return {
                    statusCode: 405,
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

## Serverless Frameworkを使った構成

```yaml
# serverless.yml
service: my-api

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-northeast-1

functions:
  api:
    handler: index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

効率的なサーバーレス開発が可能です。
MD;
    }

    private function getVueCompositionContent(): string
    {
        return <<<'MD'
# Vue.js 3 Composition APIの実践的活用法

Vue.js 3のComposition APIを使った効率的なコンポーネント設計について解説します。

## setup関数の基本

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>カウント: {{ count }}</p>
    <button @click="increment">増加</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const title = computed(() => `カウンター: ${count.value}`);

const increment = () => {
  count.value++;
};
</script>
```

## Composablesの作成

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  const doubleCount = computed(() => count.value * 2);
  
  const increment = () => {
    count.value++;
  };
  
  const decrement = () => {
    count.value--;
  };
  
  const reset = () => {
    count.value = initialValue;
  };
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  };
}
```

再利用可能なロジックを効率的に管理できます。
MD;
    }

    private function getDjangoContent(): string
    {
        return <<<'MD'
# Python Django REST APIの設計パターン

Django REST frameworkを使った高品質なAPIの設計パターンを解説します。

## シリアライザーの設計

```python
from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'author']
        read_only_fields = ['id', 'created_at', 'author']

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at', 'author', 'author_name', 'comments']
        read_only_fields = ['id', 'created_at', 'author']
```

## ViewSetの実装

```python
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'content']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        # いいね処理
        return Response({'status': 'liked'})
```

効率的なAPI設計が可能です。
MD;
    }

    private function getGoMicroservicesContent(): string
    {
        return <<<'MD'
# Go言語でのマイクロサービス設計

Go言語を使ったマイクロサービスアーキテクチャの設計と実装について解説します。

## サービス構造の設計

```go
package main

import (
    "context"
    "log"
    "net/http"
    "time"
    
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

type UserService struct {
    db *mongo.Database
}

type User struct {
    ID       string    `json:"id" bson:"_id"`
    Name     string    `json:"name" bson:"name"`
    Email    string    `json:"email" bson:"email"`
    Created  time.Time `json:"created" bson:"created"`
}

func (s *UserService) CreateUser(c *gin.Context) {
    var user User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    user.Created = time.Now()
    collection := s.db.Collection("users")
    
    result, err := collection.InsertOne(context.TODO(), user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}
```

## Docker化

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
CMD ["./main"]
```

スケーラブルなマイクロサービスを構築できます。
MD;
    }

    private function getMySQLContent(): string
    {
        return <<<'MD'
# MySQL パフォーマンスチューニング入門

MySQLデータベースのパフォーマンス最適化の基本的な手法を解説します。

## インデックスの最適化

```sql
-- 複合インデックスの作成
CREATE INDEX idx_user_status_created 
ON users (status, created_at);

-- クエリの最適化
EXPLAIN SELECT * FROM users 
WHERE status = 'active' 
  AND created_at >= '2023-01-01'
ORDER BY created_at DESC;
```

## クエリの最適化

```sql
-- 悪い例
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email LIKE '%@example.com';

-- 良い例
SELECT o.id, o.total, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email_domain = 'example.com'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 設定の最適化

```ini
# my.cnf
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

効率的なデータベース運用が可能です。
MD;
    }

    private function getReactNativeContent(): string
    {
        return <<<'MD'
# React Native + Expo開発環境の構築

React NativeとExpoを使ったモバイルアプリ開発環境の構築方法を解説します。

## プロジェクトの初期化

```bash
npx create-expo-app MyApp --template
cd MyApp
npm start
```

## 基本的なコンポーネント

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const [text, setText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hello React Native!</Text>
        
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="テキストを入力"
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => alert(`入力: ${text}`)}
        >
          <Text style={styles.buttonText}>送信</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

効率的なモバイルアプリ開発が可能です。
MD;
    }

    private function getGraphQLContent(): string
    {
        return <<<'MD'
# GraphQL APIの設計と実装パターン

GraphQLを使った効率的なAPI設計と実装のベストプラクティスを紹介します。

## スキーマ定義

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  publishedAt: DateTime
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: DateTime!
}

type Query {
  users(limit: Int, offset: Int): [User!]!
  user(id: ID!): User
  posts(authorId: ID, published: Boolean): [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}

input UpdateUserInput {
  name: String
  email: String
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: ID!
}
```

## Resolverの実装

```typescript
import { IResolvers } from '@graphql-tools/utils';

export const resolvers: IResolvers = {
  Query: {
    users: async (_, { limit = 10, offset = 0 }) => {
      return await User.findAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
    },
    
    user: async (_, { id }) => {
      return await User.findByPk(id);
    },
    
    posts: async (_, { authorId, published }) => {
      const where: any = {};
      if (authorId) where.authorId = authorId;
      if (published !== undefined) where.publishedAt = published ? { [Op.ne]: null } : null;
      
      return await Post.findAll({ where });
    },
  },
  
  Mutation: {
    createUser: async (_, { input }) => {
      return await User.create(input);
    },
    
    createPost: async (_, { input }) => {
      return await Post.create(input);
    },
  },
  
  User: {
    posts: async (user) => {
      return await Post.findAll({
        where: { authorId: user.id },
      });
    },
  },
  
  Post: {
    author: async (post) => {
      return await User.findByPk(post.authorId);
    },
    
    comments: async (post) => {
      return await Comment.findAll({
        where: { postId: post.id },
      });
    },
  },
};
```

効率的なGraphQL APIを構築できます。
MD;
    }
}
