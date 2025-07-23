import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { formatCurrency } from "../utils/currency";
import { salesApi, type SaleItem, type SalesSummary } from "../api/sales";
import Alert from "../components/Alert";

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await salesApi.getSales(selectedMonth, currentPage);
      setSales(response.data.data);
      setSummary(response.summary);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);

      // 最初の1行目をコンソールログに表示
      if (response.data.data && response.data.data.length > 0) {
        console.log(
          `売上履歴の最初の1行目 (月フィルター: ${selectedMonth || "全期間"}):`,
          response.data.data[0],
        );
      } else {
        console.log(
          `売上データが0件でした (月フィルター: ${selectedMonth || "全期間"})`,
        );
      }
    } catch (err) {
      setError("売上データの取得に失敗しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, currentPage]);

  useEffect(() => {
    fetchSales();
  }, [selectedMonth, currentPage, fetchSales]);

  const formatDate = (dateString: string) => {
    // バックエンドから既にJST形式で受け取るので、そのまま表示
    // 秒まで含む形式で表示
    return dateString;
  };

  // 現在から過去12ヶ月の選択肢を生成
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    console.log("現在の日時:", now);
    console.log("現在の年:", now.getFullYear());
    console.log("現在の月:", now.getMonth());

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      // toISOString()はUTC時間を返すので、ローカル時間での年月を直接使用
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;

      const label = date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
      });

      console.log(`i=${i}: date=${date}, value=${value}, label=${label}`);

      options.push({ value, label });
    }

    return options;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          売上管理
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          有料記事の売上履歴と手数料を確認できます
        </p>
      </div>

      {error && (
        <Alert variant="error" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* フィルター */}
      <div className="mb-6">
        <label
          htmlFor="month-filter"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          月でフィルター
        </label>
        <select
          id="month-filter"
          value={selectedMonth}
          onChange={async (e) => {
            setSelectedMonth(e.target.value);
            setCurrentPage(1);
            // 月フィルター変更時に即座にAPIを再実行
            setLoading(true);
            try {
              const response = await salesApi.getSales(e.target.value, 1);
              setSales(response.data.data);
              setSummary(response.summary);
              setCurrentPage(response.data.current_page);
              setLastPage(response.data.last_page);

              // 最初の1行目をコンソールログに表示
              if (response.data.data && response.data.data.length > 0) {
                console.log(
                  `売上履歴の最初の1行目 (月フィルター: ${e.target.value || "全期間"}):`,
                  response.data.data[0],
                );
              } else {
                console.log(
                  `売上データが0件でした (月フィルター: ${e.target.value || "全期間"})`,
                );
              }
            } catch (err) {
              setError("売上データの取得に失敗しました");
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          className="block w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">全期間</option>
          {generateMonthOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 集計情報 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                総売上
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary.total_sales)}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                販売数
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {summary.total_count}件
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                手数料
              </div>
              <div className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(summary.total_commission)}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                純売上
              </div>
              <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(summary.total_net)}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 売上履歴テーブル */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            売上履歴
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                売上データがありません
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedMonth
                  ? "選択された月の売上はありません"
                  : "有料記事の売上がまだありません"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      購入日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      記事タイトル
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      売上金額
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      手数料
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      純売上
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(sale.paid_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="max-w-xs truncate">
                          {sale.article_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(sale.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                        -{formatCurrency(sale.commission_amount)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({sale.commission_rate}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(sale.net_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ページネーション */}
          {lastPage > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {lastPage}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(lastPage, currentPage + 1))
                  }
                  disabled={currentPage === lastPage}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </nav>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SalesManagement;
