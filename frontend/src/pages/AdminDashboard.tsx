import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { AdminService, type DashboardResponse } from "../utils/adminApi";
import { useAuth } from "../contexts/AuthContextDefinition";
import { Navigate } from "react-router-dom";
import { formatCurrency } from "../utils/currency";
import AdminLayout from "../components/AdminLayout";

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
      setError("ダッシュボードデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4 text-lg">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, recent_payments, monthly_revenue } = dashboardData;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 総ユーザー数 */}
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    総ユーザー数
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_users.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    今月: +{stats.this_month_users}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 総記事数 */}
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    公開記事数
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.published_articles.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    総数: {stats.total_articles.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 総決済数 */}
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    総決済数
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_payments.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 総収益 */}
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    総収益
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    今月: {formatCurrency(stats.this_month_revenue)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の決済 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                最近の決済
              </h2>
            </CardHeader>
            <CardBody>
              {recent_payments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  最近の決済はありません
                </p>
              ) : (
                <div className="space-y-4">
                  {recent_payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.article.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          購入者: {payment.user.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* 月別収益 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                月別収益（過去12ヶ月）
              </h2>
            </CardHeader>
            <CardBody>
              {monthly_revenue.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  収益データがありません
                </p>
              ) : (
                <div className="space-y-2">
                  {monthly_revenue.slice(0, 6).map((data) => (
                    <div
                      key={data.period}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {data.period}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(data.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
