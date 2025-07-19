import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                MD Blog
              </h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">
                    ようこそ、{user?.name}さん
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      ログイン
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      登録
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              ITエンジニア向け
              <span className="block text-blue-600">技術記事プラットフォーム</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              高品質な技術記事を投稿・購読できるプラットフォームです。
              専門知識を共有し、学習を促進しましょう。
            </p>
            
            {!isAuthenticated && (
              <div className="mt-8 flex justify-center space-x-4">
                <Link to="/register">
                  <Button size="lg">
                    今すぐ始める
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    ログイン
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="mt-12">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    ユーザー情報
                  </h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">名前</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">役割</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.role === 'admin' ? '管理者' : '投稿者'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}