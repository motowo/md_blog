import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Alert from "../components/Alert";
import { Card, CardBody, CardHeader } from "../components/ui/Card";

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
  const [currentSetting, setCurrentSetting] =
    useState<CommissionSetting | null>(null);

  // 日付文字列から日付部分のみを抽出して表示
  const formatDate = (dateString: string): string => {
    // APIレスポンスにタイムスタンプが含まれる場合は日付部分のみ抽出
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    // スペースで時刻が区切られている場合
    if (dateString.includes(" ")) {
      return dateString.split(" ")[0];
    }
    // すでに日付のみの場合はそのまま返す
    return dateString;
  };

  const [formData, setFormData] = useState({
    rate: "",
    applicable_from_month: "",
    description: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      console.log("🔍 手数料設定API呼び出し開始");
      console.log(
        "🔑 使用トークン:",
        token ? `${token.substring(0, 20)}...` : "なし",
      );

      const response = await fetch("/api/admin/commission-settings", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "📡 APIレスポンス状態:",
        response.status,
        response.statusText,
      );
      console.log(
        "📋 レスポンスヘッダー:",
        Object.fromEntries(response.headers.entries()),
      );

      if (response.ok) {
        const text = await response.text();
        console.log("📝 APIレスポンステキスト:", text.substring(0, 500));

        let data;
        try {
          data = JSON.parse(text);
          console.log("📊 APIレスポンスデータ:", JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error("❌ JSON解析エラー:", parseError);
          console.log(
            "📄 受信したコンテンツの先頭200文字:",
            text.substring(0, 200),
          );
          setError("サーバーから無効なレスポンスを受信しました");
          return;
        }

        if (data.data && Array.isArray(data.data)) {
          console.log("✅ データ配列確認:", data.data.length, "件");
          setSettings(data.data);

          // 現在有効な設定を特定（JST基準）
          const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          console.log("📅 今日の日付（JST）:", today);

          const activeSetting = data.data.find((setting: CommissionSetting) => {
            const fromDate = setting.applicable_from;
            const toDate = setting.applicable_to;

            const isActive =
              setting.is_active &&
              fromDate <= today &&
              (!toDate || toDate >= today);

            console.log(`🔎 設定チェック [ID:${setting.id}]:`, {
              rate: setting.rate,
              is_active: setting.is_active,
              applicable_from: fromDate,
              applicable_to: toDate,
              today: today,
              matches: isActive,
            });

            return isActive;
          });

          console.log("🎯 現在有効な設定:", activeSetting);
          setCurrentSetting(activeSetting || null);
        } else {
          console.error("❌ APIレスポンス形式エラー:", data);
          setError("API レスポンスの形式が正しくありません");

          // 5秒後にエラーメッセージを自動で閉じる
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      } else {
        const errorText = await response.text();
        console.error("❌ APIエラー:", response.status, errorText);
        setError(`手数料設定の取得に失敗しました (${response.status})`);

        // 5秒後にエラーメッセージを自動で閉じる
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error("❌ 通信エラー:", err);
      setError("手数料設定の取得中にエラーが発生しました");

      // 5秒後にエラーメッセージを自動で閉じる
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 前のメッセージをクリア
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/commission-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rate: formData.rate,
          applicable_from_month: formData.applicable_from_month,
          description: formData.description,
        }),
      });

      if (response.ok) {
        setSuccess("手数料設定を作成しました");
        setShowForm(false);
        setFormData({
          rate: "",
          applicable_from_month: "",
          description: "",
        });
        fetchSettings();

        // 3秒後に成功メッセージを自動で閉じる
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "手数料設定の作成に失敗しました";
        setError(errorMessage);

        // 5秒後にエラーメッセージを自動で閉じる
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to create commission setting:", error);
      setError("手数料設定の作成中にエラーが発生しました");

      // 5秒後にエラーメッセージを自動で閉じる
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const deleteSetting = async (id: number) => {
    // 前のメッセージをクリア
    setError(null);
    setSuccess(null);

    if (
      !window.confirm(
        "この手数料設定を削除してもよろしいですか？\n前の設定の適用期間が自動的に調整されます。",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/admin/commission-settings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess("手数料設定を削除しました");
        fetchSettings();

        // 3秒後に成功メッセージを自動で閉じる
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "手数料設定の削除に失敗しました");

        // 5秒後にエラーメッセージを自動で閉じる
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to delete commission setting:", error);
      setError("手数料設定の削除中にエラーが発生しました");

      // 5秒後にエラーメッセージを自動で閉じる
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const toggleSettingStatus = async (id: number, currentStatus: boolean) => {
    // 前のメッセージをクリア
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("auth_token");
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

        // 3秒後に成功メッセージを自動で閉じる
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError("手数料設定の更新に失敗しました");

        // 5秒後にエラーメッセージを自動で閉じる
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to update commission setting:", error);
      setError("手数料設定の更新中にエラーが発生しました");

      // 5秒後にエラーメッセージを自動で閉じる
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const isSettingEditable = (setting: CommissionSetting) => {
    const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    return setting.applicable_from > today;
  };

  const isSettingActive = (setting: CommissionSetting) => {
    const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
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

        {/* 現在の手数料設定 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              現在の手数料設定
            </h2>
          </CardHeader>
          <CardBody>
            {currentSetting ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {currentSetting.rate}%
                  </span>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  適用期間: {formatDate(currentSetting.applicable_from)} 〜{" "}
                  {currentSetting.applicable_to
                    ? formatDate(currentSetting.applicable_to)
                    : "無期限"}
                </div>
                {currentSetting.description && (
                  <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {currentSetting.description}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    手数料設定なし
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  現在有効な手数料設定がありません。新しい設定を追加してください。
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              新しい手数料設定
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
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
                    htmlFor="applicable_from_month"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    適用開始月（月の1日から自動適用）
                  </label>
                  <input
                    type="month"
                    id="applicable_from_month"
                    required
                    value={formData.applicable_from_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicable_from_month: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    例：2025年8月を選択すると、2025年8月1日から適用されます
                  </p>
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

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              手数料設定履歴
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              過去・現在・未来の手数料設定を時系列で表示
            </p>
          </CardHeader>
          <CardBody>
            {settings.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                手数料設定がありません
              </div>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isSettingActive(setting)
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : setting.applicable_from >
                                    new Date(
                                      new Date().getTime() + 9 * 60 * 60 * 1000,
                                    )
                                      .toISOString()
                                      .split("T")[0]
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}
                          >
                            {isSettingActive(setting)
                              ? "現在有効"
                              : setting.applicable_from >
                                  new Date(
                                    new Date().getTime() + 9 * 60 * 60 * 1000,
                                  )
                                    .toISOString()
                                    .split("T")[0]
                                ? "未来適用"
                                : "適用終了"}
                          </span>
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            {setting.rate}%
                          </span>
                          {!setting.is_active && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              無効
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          適用期間: {formatDate(setting.applicable_from)} 〜{" "}
                          {setting.applicable_to
                            ? formatDate(setting.applicable_to)
                            : "無期限"}
                        </div>

                        {setting.description && (
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {setting.description}
                          </div>
                        )}

                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          作成日: {formatDate(setting.created_at)}
                          {formatDate(setting.updated_at) !==
                            formatDate(setting.created_at) && (
                            <> ・ 更新日: {formatDate(setting.updated_at)}</>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isSettingEditable(setting) && (
                          <>
                            <button
                              onClick={() =>
                                toggleSettingStatus(
                                  setting.id,
                                  setting.is_active,
                                )
                              }
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                setting.is_active
                                  ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                  : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                              }`}
                            >
                              {setting.is_active ? "無効化" : "有効化"}
                            </button>
                            <button
                              onClick={() => deleteSetting(setting.id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              削除
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
