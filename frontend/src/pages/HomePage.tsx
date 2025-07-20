import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";

const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          MD Blog へようこそ
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          マークダウンで記事を投稿・管理できるブログプラットフォーム
        </p>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="primary" size="lg">
              ログイン
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              マークダウン対応
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              マークダウン記法で簡単に記事を作成・編集できます。
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              タグ管理
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              記事にタグを付けて、カテゴリ別に整理できます。
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              レスポンシブデザイン
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              モバイル・デスクトップどちらでも快適に利用できます。
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          最新記事
        </h2>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    サンプル記事タイトル
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    これはサンプル記事の概要です。実際の記事データが表示されます。
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">
                      React
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded">
                      TypeScript
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  2024-01-01
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
