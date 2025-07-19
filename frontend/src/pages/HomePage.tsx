import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, CardBody, Container, Section } from '../components/ui';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Section */}
      <Section className="py-24 sm:py-32">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              エンジニアのための
              <br />
              <span className="text-zinc-700 dark:text-zinc-300">技術記事プラットフォーム</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto">
              高品質な技術記事を投稿・購読できるプラットフォーム。専門知識を共有し、学習を促進しましょう。
            </p>
            {!isAuthenticated && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
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
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="border-t border-zinc-200 dark:border-zinc-800 py-24 sm:py-32">
        <Container>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-zinc-700 dark:text-zinc-300">技術記事</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                1,000+
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-zinc-700 dark:text-zinc-300">エンジニア</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                500+
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-zinc-700 dark:text-zinc-300">技術分野</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                50+
              </dd>
            </div>
          </div>
        </Container>
      </Section>

      {/* User Info Section (for authenticated users) */}
      {isAuthenticated && (
        <Section className="border-t border-zinc-200 dark:border-zinc-800 py-16">
          <Container size="md">
            <Card variant="elevated">
              <CardBody className="p-8">
                <div className="flex items-center gap-x-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    <span className="text-xl font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      ようこそ、{user?.name || user?.username}さん
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {user?.role === 'admin' ? '管理者' : '投稿者'}
                    </p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      ユーザー名
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {user?.username}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      メールアドレス
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">表示名</dt>
                    <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {user?.name || '未設定'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">登録日</dt>
                    <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('ja-JP')
                        : '不明'}
                    </dd>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Container>
        </Section>
      )}

      {/* Features Section */}
      <Section className="border-t border-zinc-200 dark:border-zinc-800 py-24 sm:py-32">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              豊富な機能でエンジニアをサポート
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              現代のエンジニアに必要な機能を全て備えています
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </div>
                  Markdown投稿
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    リアルタイムプレビュー付きのMarkdownエディタで、美しい技術記事を簡単に作成できます。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                  </div>
                  スマートタグ
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    記事を技術分野やレベル別にタグ付けして、読者が求める情報を素早く見つけられます。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                      />
                    </svg>
                  </div>
                  ダークモード
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    目に優しいダークモードで、長時間の読書やコーディングも快適に行えます。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                  高度な検索
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    キーワード、タグ、著者など複数の条件で記事を検索して、欲しい情報を瞬時に見つけられます。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                  エンジニアコミュニティ
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    同じ技術に興味を持つエンジニア同士でコメントや議論を通して知識を深め合えます。
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <svg
                      className="h-5 w-5 text-white dark:text-zinc-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12s-1.536.219-2.121.659c-1.172.879-1.172 2.303 0 3.182l.879.659ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                  記事収益化
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  <p className="flex-auto">
                    質の高いコンテンツを有料記事として販売し、知識を価値に変換できます。
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Section className="border-t border-zinc-200 dark:border-zinc-800 py-24 sm:py-32">
          <Container>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                今すぐ技術記事の執筆を始めませんか？
              </h2>
              <p className="mt-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                無料でアカウントを作成して、あなたの技術知識を世界中のエンジニアと共有しましょう。
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/register">
                  <Button size="lg">無料で始める</Button>
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
