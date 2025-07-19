import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-dark-100 dark:via-dark-50 dark:to-dark-100">
        {/* 背景装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-soft"></div>
          <div
            className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-soft"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-soft"
            style={{ animationDelay: '4s' }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight animate-fade-in">
              <span className="block text-gray-900 dark:text-white">ITエンジニア向け</span>
              <span className="block bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                技術記事プラットフォーム
              </span>
            </h1>
            <p
              className="mt-8 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              高品質な技術記事を投稿・購読できるプラットフォームです。
              <br />
              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                専門知識を共有し、学習を促進しましょう。
              </span>
            </p>

            {!isAuthenticated && (
              <div
                className="mt-12 flex justify-center space-x-6 animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🚀 今すぐ始める
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transform hover:scale-105 transition-all duration-300"
                  >
                    ログイン
                  </Button>
                </Link>
              </div>
            )}

            {/* 統計情報 */}
            <div
              className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">技術記事</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">エンジニア</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-primary-600 bg-clip-text text-transparent">
                  50+
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">技術分野</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー情報（認証済みの場合） */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-dark-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-r from-white to-gray-50 dark:from-dark-100 dark:to-dark-200 border-0 shadow-2xl">
              <CardBody className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ようこそ、{user?.name || user?.username}さん
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.role === 'admin' ? '🛡️ 管理者' : '✍️ 投稿者'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        ユーザー名
                      </span>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{user?.username}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        メールアドレス
                      </span>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        表示名
                      </span>
                      <p className="text-lg text-gray-900 dark:text-gray-100">
                        {user?.name || '未設定'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        登録日
                      </span>
                      <p className="text-lg text-gray-900 dark:text-gray-100">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('ja-JP')
                          : '不明'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* 機能紹介セクション */}
      <div className="bg-white dark:bg-dark-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              豊富な機能でエンジニアをサポート
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              MD Blogは現代のエンジニアに必要な機能を全て備えています
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 記事投稿 */}
            <Card
              hover
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Markdown投稿
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  リアルタイムプレビュー付きのMarkdownエディタで、美しい技術記事を簡単に作成できます。
                </p>
              </CardBody>
            </Card>

            {/* タグ管理 */}
            <Card
              hover
              className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  スマートタグ
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  記事を技術分野やレベル別にタグ付けして、読者が求める情報を素早く見つけられます。
                </p>
              </CardBody>
            </Card>

            {/* ダークモード */}
            <Card
              hover
              className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  ダークモード
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  目に優しいダークモードで、長時間の読書やコーディングも快適に行えます。
                </p>
              </CardBody>
            </Card>

            {/* 検索機能 */}
            <Card
              hover
              className="group bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">高度な検索</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  キーワード、タグ、著者など複数の条件で記事を検索して、欲しい情報を瞬時に見つけられます。
                </p>
              </CardBody>
            </Card>

            {/* コミュニティ */}
            <Card
              hover
              className="group bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  エンジニアコミュニティ
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  同じ技術に興味を持つエンジニア同士でコメントや議論を通して知識を深め合えます。
                </p>
              </CardBody>
            </Card>

            {/* 収益化 */}
            <Card
              hover
              className="group bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700"
            >
              <CardBody className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">記事収益化</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  質の高いコンテンツを有料記事として販売し、知識を価値に変換できます。
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              今すぐ技術記事の執筆を始めませんか？
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              無料でアカウントを作成して、あなたの技術知識を世界中のエンジニアと共有しましょう。
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                🚀 無料で始める
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
