import React, { useState, useEffect } from "react";
import Alert from "./Alert";
import { apiClient } from "../utils/api";

interface BankAccount {
  id: number;
  bank_name: string;
  branch_name: string;
  account_type: string;
  account_number: string;
  account_holder_name: string;
  is_active: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export function BankAccountManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null,
  );

  const [formData, setFormData] = useState({
    bank_name: "",
    branch_name: "",
    account_type: "普通" as "普通" | "当座",
    account_number: "",
    account_holder_name: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await apiClient.get("/bank-accounts");
      setAccounts(response.data.data);
    } catch (err: any) {
      setError(err.message || "振込口座情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: "",
      branch_name: "",
      account_type: "普通",
      account_number: "",
      account_holder_name: "",
    });
    setEditingAccount(null);
    setShowForm(false);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.bank_name.trim()) {
      errors.push("銀行名を入力してください");
    }

    if (!formData.branch_name.trim()) {
      errors.push("支店名を入力してください");
    }

    if (!formData.account_number.trim()) {
      errors.push("口座番号を入力してください");
    } else if (!/^\d+$/.test(formData.account_number)) {
      errors.push("口座番号は数字のみで入力してください");
    } else if (
      formData.account_number.length < 6 ||
      formData.account_number.length > 8
    ) {
      errors.push("口座番号は6-8桁で入力してください");
    }

    if (!formData.account_holder_name.trim()) {
      errors.push("口座名義を入力してください");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // バリデーション
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    // 新規登録時は1口座制限をチェック
    if (!editingAccount && accounts.length >= 1) {
      setError(
        "登録できる振込口座は1件までです。既存の口座を削除してから新しい口座を登録してください。",
      );
      return;
    }

    try {
      let response;
      if (editingAccount) {
        response = await apiClient.put(
          `/bank-accounts/${editingAccount.id}`,
          formData,
        );
      } else {
        response = await apiClient.post("/bank-accounts", formData);
      }

      setSuccess(response.data.message);
      resetForm();
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || "振込口座の保存に失敗しました");
    }
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bank_name: account.bank_name,
      branch_name: account.branch_name,
      account_type: account.account_type as "普通" | "当座",
      account_number: account.account_number,
      account_holder_name: account.account_holder_name,
    });
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この振込口座を削除しますか？")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/bank-accounts/${id}`);
      setSuccess(response.data.message);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || "振込口座の削除に失敗しました");
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await apiClient.patch(`/bank-accounts/${id}/activate`);
      setSuccess(response.data.message);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || "振込口座の有効化に失敗しました");
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            登録可能な振込口座は1件までです
          </p>
        </div>
        {accounts.length < 1 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            {showForm ? "キャンセル" : "新しい口座を追加"}
          </button>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} closable>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} closable>
          {success}
        </Alert>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            {editingAccount ? "振込口座を編集" : "新しい振込口座を追加"}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="bank_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  銀行名
                </label>
                <input
                  type="text"
                  id="bank_name"
                  required
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="branch_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  支店名
                </label>
                <input
                  type="text"
                  id="branch_name"
                  required
                  value={formData.branch_name}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_name: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="account_type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  口座種別
                </label>
                <select
                  id="account_type"
                  required
                  value={formData.account_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_type: e.target.value as "普通" | "当座",
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="account_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  口座番号
                </label>
                <input
                  type="text"
                  id="account_number"
                  required
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="account_holder_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  口座名義
                </label>
                <input
                  type="text"
                  id="account_holder_name"
                  required
                  value={formData.account_holder_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account_holder_name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {editingAccount ? "更新" : "保存"}
              </button>
            </div>
          </form>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            振込口座が登録されていません
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            有料記事を投稿するには振込口座の登録が必要です
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`border rounded-lg p-4 ${
                account.is_active
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {account.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        有効
                      </span>
                    )}
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {account.bank_name} {account.branch_name}
                    </h4>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p>口座種別: {account.account_type}</p>
                    <p>口座番号: {maskAccountNumber(account.account_number)}</p>
                    <p>口座名義: {account.account_holder_name}</p>
                    <p>
                      登録日:{" "}
                      {new Date(account.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!account.is_active && (
                    <button
                      onClick={() => handleActivate(account.id)}
                      className="px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                    >
                      有効化
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(account)}
                    className="px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => handleDelete(account.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
