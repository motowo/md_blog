# TypeScript 型安全性の活用法

TypeScript を使用することで、JavaScript プロジェクトに型安全性をもたらし、開発効率と品質を向上させることができます。

## 基本的な型定義

まず基本的な型から理解しましょう。

```typescript
// プリミティブ型
const name: string = 'John Doe';
const age: number = 30;
const isActive: boolean = true;

// 配列型
const numbers: number[] = [1, 2, 3, 4, 5];
const names: Array<string> = ['Alice', 'Bob', 'Charlie'];

// オブジェクト型
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // オプショナル
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};
```

## API レスポンスの型定義

API との連携では、レスポンスの型を明確に定義することが重要です。

```typescript
interface Article {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  tags: Tag[];
  isPaid: boolean;
  price?: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  message?: string;
}

// 使用例
async function fetchArticles(): Promise<ApiResponse<Article[]>> {
  const response = await fetch('/api/articles');
  return response.json();
}
```

## Generic Types の活用

ジェネリクスを使用することで、再利用可能な型を作成できます。

```typescript
interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

class ArticleRepository implements Repository<Article> {
  async findById(id: number): Promise<Article | null> {
    const response = await fetch(`/api/articles/${id}`);
    if (!response.ok) return null;
    const result: ApiResponse<Article> = await response.json();
    return result.data;
  }
  
  async findAll(): Promise<Article[]> {
    const response = await fetch('/api/articles');
    const result: ApiResponse<Article[]> = await response.json();
    return result.data;
  }
  
  // 他のメソッドも実装...
}
```

## Union Types と Type Guards

複数の型を扱う場合には Union Types と Type Guards が有効です。

```typescript
type Status = 'draft' | 'published' | 'archived';

interface DraftArticle {
  status: 'draft';
  title: string;
  content: string;
}

interface PublishedArticle {
  status: 'published';
  title: string;
  content: string;
  publishedAt: string;
  slug: string;
}

type ArticleState = DraftArticle | PublishedArticle;

// Type Guard
function isPublished(article: ArticleState): article is PublishedArticle {
  return article.status === 'published';
}

// 使用例
function getArticleUrl(article: ArticleState): string | null {
  if (isPublished(article)) {
    return `/articles/${article.slug}`; // TypeScriptが型を推論
  }
  return null;
}
```

## Utility Types の活用

TypeScript が提供する Utility Types を使用して、効率的な型定義を行いましょう。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// 一部のプロパティのみを使用
type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'role'>;

// パスワードを除外
type SafeUser = Omit<User, 'password'>;

// 全てオプショナル（更新時に便利）
type UserUpdateData = Partial<Pick<User, 'name' | 'email' | 'role'>>;

// 新規作成用（IDとタイムスタンプを除外）
type UserCreateData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
```

## カスタムHooksでの型活用

React のカスタム Hook でも型安全性を確保しましょう。

```typescript
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: T = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  }, [url]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// 使用例
const { data: articles, loading, error } = useApi<ApiResponse<Article[]>>('/api/articles');
```

## まとめ

TypeScript を効果的に活用するためのポイント：

1. **基本型から始める** - string, number, boolean などの基本型を理解する
2. **インターフェースでオブジェクトの形を定義** - API レスポンスやプロパティの型を明確にする
3. **Generic Types で再利用性を高める** - 柔軟で保守性の高いコードを作成
4. **Union Types と Type Guards** - 複雑な条件分岐を型安全に処理
5. **Utility Types の活用** - 効率的な型定義で開発速度を向上

型安全性を活用することで、バグを早期に発見し、開発チーム全体の生産性を向上させることができます。