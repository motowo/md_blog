import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Alert from "../components/Alert";
import { formatCurrency } from "../utils/currency";
import { Card, CardBody, CardHeader } from "../components/ui/Card";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Payout {
  id: number;
  user_id: number;
  period: string;
  amount: string;
  gross_amount: string;
  commission_amount: string;
  commission_rate: string;
  status: "unpaid" | "paid" | "failed";
  paid_at?: string;
  created_at: string;
  updated_at: string;
  user: User;
}

interface MonthlySummary {
  period: string;
  total_count: number;
  paid_count: number;
  unpaid_count: number;
  failed_count: number;
  total_amount: string;
  paid_amount: string;
  unpaid_amount: string;
  total_gross_amount: string;
  total_commission_amount: string;
  avg_commission_rate: string;
}

interface MonthlyDetails {
  data: Payout[];
  payout_date: string;
  payout_date_formatted: string;
}

export function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>(
    [],
  );
  const [monthlyDetails, setMonthlyDetails] = useState<MonthlyDetails | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPayouts, setSelectedPayouts] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [monthlyProcessing, setMonthlyProcessing] = useState(false);
  const [monthlyPeriod, setMonthlyPeriod] = useState(
    new Date().getFullYear() +
      "-" +
      String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [activeTab, setActiveTab] = useState<"summary" | "pending">("summary");

  useEffect(() => {
    fetchPayouts();
    fetchMonthlySummary();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/pending-payouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.data);
      } else {
        setError("支払い情報の取得に失敗しました");
      }
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
      setError("支払い情報の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/payouts/monthly-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlySummaries(data.data);
      } else {
        setError("月次サマリの取得に失敗しました");
      }
    } catch (err) {
      setError("月次サマリの取得中にエラーが発生しました");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchMonthlyDetails = async (period: string) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/admin/payouts/monthly-details?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMonthlyDetails(data);
        setSelectedPeriod(period);
      } else {
        setError("月次詳細の取得に失敗しました");
      }
    } catch (err) {
      setError("月次詳細の取得中にエラーが発生しました");
    } finally {
      setDetailsLoading(false);
    }
  };

  const confirmPayout = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/payouts/${id}/confirm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess("支払いを確定しました");
        fetchPayouts();
        fetchMonthlySummary();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "支払いの確定に失敗しました");
      }
    } catch (err) {
      setError("支払いの確定中にエラーが発生しました");
    }
  };

  // 成功・エラーメッセージの自動消去
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "支払済";
      case "unpaid":
        return "未払い";
      case "failed":
        return "失敗";
      default:
        return status;
    }
  };

  const bulkConfirmPayouts = async () => {
    if (selectedPayouts.length === 0) {
      setError("支払いを選択してください");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/payouts/bulk-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payout_ids: selectedPayouts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setSelectedPayouts([]);
        fetchPayouts();
        fetchMonthlySummary();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "一括確定に失敗しました");
      }
    } catch (err) {
      setError("一括確定中にエラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  const processMonthlyPayouts = async () => {
    if (!monthlyPeriod) {
      setError("処理対象の年月を入力してください");
      return;
    }

    setMonthlyProcessing(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/process-monthly-payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year_month: monthlyPeriod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        fetchPayouts();
        fetchMonthlySummary();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "月次処理に失敗しました");
      }
    } catch (err) {
      setError("月次処理中にエラーが発生しました");
    } finally {
      setMonthlyProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const togglePayoutSelection = (id: number) => {
    setSelectedPayouts((prev) =>
      prev.includes(id)
        ? prev.filter((payoutId) => payoutId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedPayouts.length === payouts.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(payouts.map((payout) => payout.id));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            著者振込管理
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            著者への売上振込を管理します
          </p>
        </div>

        {error && (
          <div className="animate-fadeIn">
            <Alert variant="error" closable onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}
        {success && (
          <div className="animate-fadeIn">
            <Alert variant="success" closable onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* 月次処理セクション */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              月次処理
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-end space-x-4">
              <div>
                <label
                  htmlFor="monthly_period"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  処理対象年月
                </label>
                <input
                  type="month"
                  id="monthly_period"
                  value={monthlyPeriod}
                  onChange={(e) => setMonthlyPeriod(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button
                onClick={processMonthlyPayouts}
                disabled={monthlyProcessing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {monthlyProcessing ? "処理中..." : "月次処理実行"}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              指定した月の売上データを集計し、手数料を計算して
              <strong>未払い状態</strong>の支払い情報を作成します。
              <br />
              作成後は「未払い一覧」タブで内容を確認し、個別に支払い確定処理を行ってください。
            </p>
          </CardBody>
        </Card>

        {/* タブ切り替え */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("summary")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "summary"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              月次サマリ
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              未払い一覧
            </button>
          </nav>
        </div>

        {/* 月次サマリタブ */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  振込履歴 月次サマリ
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  各月の振込状況を確認できます
                </p>
              </CardHeader>
              <CardBody className="p-0">
                {summaryLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : monthlySummaries.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    サマリデータがありません
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            期間
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            振込件数
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            ステータス
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            総支払金額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            平均手数料率
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {monthlySummaries.map((summary) => (
                          <tr key={summary.period}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {summary.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {summary.total_count}件
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-1">
                                {summary.paid_count > 0 && (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor("paid")}`}
                                  >
                                    支払済 {summary.paid_count}
                                  </span>
                                )}
                                {summary.unpaid_count > 0 && (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor("unpaid")}`}
                                  >
                                    未払い {summary.unpaid_count}
                                  </span>
                                )}
                                {summary.failed_count > 0 && (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor("failed")}`}
                                  >
                                    失敗 {summary.failed_count}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(summary.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {parseFloat(summary.avg_commission_rate).toFixed(
                                2,
                              )}
                              %
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  fetchMonthlyDetails(summary.period)
                                }
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                詳細表示
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 月次詳細 */}
            {monthlyDetails && selectedPeriod && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedPeriod} の振込詳細
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        振込予定日: {monthlyDetails.payout_date_formatted}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMonthlyDetails(null);
                        setSelectedPeriod(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  {detailsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : monthlyDetails.data.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      この月の振込データがありません
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              著者
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              ステータス
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              総売上
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              手数料
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              支払金額
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              手数料率
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              支払日
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {monthlyDetails.data.map((payout) => (
                            <tr key={payout.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payout.user.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {payout.user.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}
                                >
                                  {getStatusText(payout.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(payout.gross_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(payout.commission_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(payout.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {parseFloat(payout.commission_rate).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {payout.paid_at
                                  ? formatDate(payout.paid_at)
                                  : monthlyDetails.payout_date_formatted}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* 未払い一覧タブ */}
        {activeTab === "pending" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  未払い一覧
                </h2>
                {selectedPayouts.length > 0 && (
                  <button
                    onClick={bulkConfirmPayouts}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing
                      ? "処理中..."
                      : `選択した${selectedPayouts.length}件を確定`}
                  </button>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {payouts.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  未払いの支払いがありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedPayouts.length === payouts.length}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          著者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          期間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          総売上
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          手数料
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          支払金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          手数料率
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {payouts.map((payout) => (
                        <tr key={payout.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedPayouts.includes(payout.id)}
                              onChange={() => togglePayoutSelection(payout.id)}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {payout.user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payout.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {payout.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payout.gross_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payout.commission_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payout.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {parseFloat(payout.commission_rate).toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => confirmPayout(payout.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              確定
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
