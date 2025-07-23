import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Alert from "../components/Alert";

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

export function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem("token");
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
    } catch (err) {
      setError("支払い情報の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayout = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/payouts/${id}/confirm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess("支払いを確定しました");
        fetchPayouts();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "支払いの確定に失敗しました");
      }
    } catch (err) {
      setError("支払いの確定中にエラーが発生しました");
    }
  };

  const bulkConfirmPayouts = async () => {
    if (selectedPayouts.length === 0) {
      setError("支払いを選択してください");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
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
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* 月次処理セクション */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            月次処理
          </h2>
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
            指定した月の売上データを集計し、手数料を計算して支払い情報を作成します
          </p>
        </div>

        {/* 未払い一覧 */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
          </div>

          {payouts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              未払いの支払いがありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPayouts.length === payouts.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      著者
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      期間
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      総売上
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      手数料
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      支払金額
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      手数料率
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
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
        </div>
      </div>
    </AdminLayout>
  );
}
