import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            ITエンジニア向け
            <span className="block text-primary-600 dark:text-primary-400">
              技術記事プラットフォーム
            </span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            高品質な技術記事を投稿・購読できるプラットフォームです。
            専門知識を共有し、学習を促進しましょう。
          </p>

          {!isAuthenticated && (
            <div className="mt-8 flex justify-center space-x-4">
              <Link to="/register">
                <Button size="lg">今すぐ始める</Button>
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
            <Card>
              <CardBody>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  ユーザー情報
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ユーザー名
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {user?.username}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">表示名</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {user?.name || '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      メールアドレス
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">役割</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {user?.role === 'admin' ? '管理者' : '投稿者'}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </div>
        )}

        {/* 機能紹介セクション */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">主な機能</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              MD Blogで利用できる豊富な機能をご紹介します
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card hover>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">記事投稿</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Markdownで技術記事を簡単に投稿できます
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">タグ管理</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      記事にタグを付けて分類・検索を効率化
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      ダークモード
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      目に優しいダークモードで快適に閲覧
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
