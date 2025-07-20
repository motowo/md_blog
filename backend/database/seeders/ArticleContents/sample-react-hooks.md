# React Hooksを使った状態管理の実践

React Hooksは関数コンポーネントで状態管理を行うための強力な機能です。この記事では、実際のプロジェクトでよく使われるHooksの使い方を解説します。

## useStateの基本

最も基本的なHookである`useState`は、関数コンポーネント内で状態を管理するために使用します。

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

## useEffectでライフサイクル管理

`useEffect`は、コンポーネントのライフサイクルに合わせて処理を実行するためのHookです。

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## カスタムHookの作成

再利用可能なロジックをカスタムHookとして抽出することで、コードの保守性が向上します。

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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
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

React Hooksを適切に使用することで、関数コンポーネントでも効率的な状態管理が可能になります。特に以下の点に注意して使用しましょう：

1. Hooksは関数コンポーネントのトップレベルでのみ呼び出す
2. 依存配列を適切に設定してパフォーマンスを最適化する
3. 複雑なロジックはカスタムHookに抽出する

これらのベストプラクティスを守ることで、保守性の高いReactアプリケーションを構築できます。