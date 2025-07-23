import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Alert from "../components/Alert";

interface CommissionSetting {
  id: number;
  rate: string;
  applicable_from: string;
  applicable_to?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function AdminCommissionSettings() {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    rate: "",
    applicable_from: "",
    applicable_to: "",
    description: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/commission-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        setError("手数料設定の取得に失敗しました");
      }
    } catch (err) {
      setError("手数料設定の取得中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/commission-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          applicable_to: formData.applicable_to || null,
        }),
      });

      if (response.ok) {
        setSuccess("手数料設定を作成しました");
        setShowForm(false);
        setFormData({
          rate: "",
          applicable_from: "",
          applicable_to: "",
          description: "",
        });
        fetchSettings();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "手数料設定の作成に失敗しました");
      }
    } catch (err) {
      setError("手数料設定の作成中にエラーが発生しました");
    }
  };

  const toggleSettingStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/commission-settings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        setSuccess("手数料設定を更新しました");
        fetchSettings();
      } else {
        setError("手数料設定の更新に失敗しました");
      }
    } catch (err) {
      setError("手数料設定の更新中にエラーが発生しました");
    }
  };

  const isSettingEditable = (setting: CommissionSetting) => {
    const today = new Date().toISOString().split("T")[0];
    return setting.applicable_from > today;
  };

  const isSettingActive = (setting: CommissionSetting) => {
    const today = new Date().toISOString().split("T")[0];
    return (
      setting.applicable_from <= today &&
      (!setting.applicable_to || setting.applicable_to >= today)
    );
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            手数料設定管理
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? "キャンセル" : "新しい設定を追加"}
          </button>
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

        {showForm && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              新しい手数料設定
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="rate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    手数料率 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    id="rate"
                    required
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="applicable_from"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    適用開始日
                  </label>
                  <input
                    type="date"
                    id="applicable_from"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.applicable_from}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicable_from: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="applicable_to"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    適用終了日 (任意)
                  </label>
                  <input
                    type="date"
                    id="applicable_to"
                    value={formData.applicable_to}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicable_to: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    説明
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              手数料設定一覧
            </h3>
          </div>

          {settings.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              手数料設定がありません
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {settings.map((setting) => (
                <li key={setting.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isSettingActive(setting)
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {isSettingActive(setting) ? "有効" : "無効"}
                        </span>
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {setting.rate}%
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        適用期間: {setting.applicable_from} 〜{" "}
                        {setting.applicable_to || "無期限"}
                      </div>

                      {setting.description && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {setting.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {isSettingEditable(setting) && (
                        <button
                          onClick={() =>
                            toggleSettingStatus(setting.id, setting.is_active)
                          }
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            setting.is_active
                              ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {setting.is_active ? "無効化" : "有効化"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
