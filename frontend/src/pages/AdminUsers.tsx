import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import SortableTableHeader, {
  type SortConfig,
} from "../components/ui/SortableTableHeader";
import UserProfileView from "../components/UserProfileView";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../contexts/AuthContextDefinition";
import {
  AdminService,
  type AdminUser,
  type UsersResponse,
} from "../utils/adminApi";

const AdminUsers: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 並び替えパラメータを構築
      const sortParams = sortConfig.reduce(
        (acc, config, index) => {
          if (config.direction) {
            acc[`sort[${index}][field]`] = config.field;
            acc[`sort[${index}][direction]`] = config.direction;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      // 投稿者を確実に取得するため、大きなper_pageで取得してからフィルタリング
      const data: UsersResponse = await AdminService.getUsers({
        page: 1, // 全データを取得するため1ページ目から
        per_page: 1000, // 大きな値で全ユーザーを取得
        search: searchQuery || undefined,
        ...sortParams,
      });

      // 投稿者のみフィルタリング（roleが'author'のユーザー）
      let filteredUsers = data.users.filter((u) => u.role === "author");

      // クライアント側で並び替え処理（APIが対応していない場合のフォールバック）
      if (sortConfig.length > 0) {
        filteredUsers = [...filteredUsers].sort((a, b) => {
          for (const config of sortConfig) {
            if (!config.direction) continue;

            let aValue: string | number | Date | null =
              a[config.field as keyof AdminUser];
            let bValue: string | number | Date | null =
              b[config.field as keyof AdminUser];

            // 日付の場合は Date オブジェクトに変換
            if (
              config.field.includes("_at") ||
              config.field === "created_at" ||
              config.field === "updated_at"
            ) {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            }

            // 数値の場合は数値に変換
            if (typeof aValue === "string" && !isNaN(Number(aValue))) {
              aValue = Number(aValue);
              bValue = Number(bValue);
            }

            // 文字列の場合は小文字で比較
            if (typeof aValue === "string") {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }

            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;

            if (comparison !== 0) {
              return config.direction === "desc" ? -comparison : comparison;
            }
          }
          return 0;
        });
      }

      // クライアント側でページネーション処理
      const startIndex = (currentPage - 1) * 15;
      const endIndex = startIndex + 15;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 15));
      setTotalUsers(filteredUsers.length);
    } catch (err) {
      console.error("Users fetch failed:", err);
      setError("投稿者一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setSortConfig((prevConfig) => {
      const existingIndex = prevConfig.findIndex(
        (config) => config.field === field,
      );

      if (existingIndex >= 0) {
        const existing = prevConfig[existingIndex];
        const newConfig = [...prevConfig];

        if (existing.direction === "asc") {
          newConfig[existingIndex] = { ...existing, direction: "desc" };
        } else if (existing.direction === "desc") {
          newConfig.splice(existingIndex, 1);
        }

        return newConfig;
      } else {
        return [...prevConfig, { field, direction: "asc" as const }];
      }
    });
    setCurrentPage(1);
  };

  const handleViewUser = (targetUser: AdminUser) => {
    setSelectedUser(targetUser);
    setShowProfileModal(true);
  };

  const handleToggleStatus = async (targetUser: AdminUser) => {
    const action = targetUser.is_active ? "無効化" : "有効化";
    if (!confirm(`ユーザー「${targetUser.username}」を${action}しますか？`)) {
      return;
    }

    try {
      await AdminService.toggleUserStatus(targetUser.id);
      fetchUsers();
      alert(`ユーザーを${action}しました`);
    } catch (err) {
      console.error("User status toggle failed:", err);
      alert(`ユーザーの${action}に失敗しました`);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (targetUser.id === user?.id) {
      alert("自分自身のアカウントは削除できません");
      return;
    }

    if (
      !confirm(
        `ユーザー「${targetUser.username}」のアカウントを削除しますか？この操作は取り消せません。`,
      )
    ) {
      return;
    }

    try {
      await AdminService.deleteUser(targetUser.id);
      fetchUsers();
      alert("ユーザーアカウントと関連する記事を削除しました");
    } catch (err) {
      console.error("User deletion failed:", err);
      alert("ユーザーアカウントの削除に失敗しました");
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "未ログイン";
    return new Date(dateString).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 検索フォーム */}
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="投稿者名、名前、メールアドレスで検索..."
                />
              </div>
              <Button type="submit" variant="primary" loading={loading}>
                検索
              </Button>
            </form>
          </CardBody>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button
              onClick={fetchUsers}
              className="ml-4 underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        )}

        {/* ユーザー一覧 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                投稿者一覧
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                投稿者 {totalUsers.toLocaleString()}名中{" "}
                {Math.min((currentPage - 1) * 15 + 1, totalUsers)}-
                {Math.min(currentPage * 15, totalUsers)}名を表示
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchQuery
                  ? "検索条件に一致する投稿者が見つかりません"
                  : "投稿者が登録されていません"}
              </p>
            ) : (
              <>
                {/* 上部ページネーション */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                    className="mb-4"
                  />
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <SortableTableHeader
                          field="name"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          投稿者
                        </SortableTableHeader>
                        <SortableTableHeader
                          field="is_active"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          状態
                        </SortableTableHeader>
                        <SortableTableHeader
                          field="articles_count"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          記事数
                        </SortableTableHeader>
                        <SortableTableHeader
                          field="payments_count"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          購入数
                        </SortableTableHeader>
                        <SortableTableHeader
                          field="last_login_at"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          最終ログイン
                        </SortableTableHeader>
                        <SortableTableHeader
                          field="created_at"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        >
                          登録日
                        </SortableTableHeader>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-center">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((targetUser) => (
                        <tr
                          key={targetUser.id}
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            !targetUser.is_active
                              ? "opacity-60 bg-gray-50 dark:bg-gray-800"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {targetUser.avatar_url ? (
                                  <img
                                    src={targetUser.avatar_url}
                                    alt={targetUser.username}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <svg
                                      className="h-6 w-6 text-gray-400 dark:text-gray-500"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {targetUser.name || targetUser.username}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {targetUser.username}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  {targetUser.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  targetUser.is_active
                                    ? "bg-green-400"
                                    : "bg-red-400"
                                }`}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {targetUser.is_active ? "有効" : "無効"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {targetUser.articles_count}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {targetUser.payments_count}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {targetUser.last_login_at
                              ? formatDate(targetUser.last_login_at)
                              : "なし"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(targetUser.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewUser(targetUser)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="詳細を表示"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              {targetUser.id !== user?.id && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleToggleStatus(targetUser)
                                    }
                                    className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                                    title={
                                      targetUser.is_active ? "無効化" : "有効化"
                                    }
                                  >
                                    {targetUser.is_active ? (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
                                        />
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="9"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(targetUser)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                    title="削除"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 下部ページネーション */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* ユーザー情報参照モーダル */}
        {selectedUser && showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* ヘッダー */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ユーザー情報参照
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProfileModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    ×
                  </Button>
                </div>

                {/* ユーザープロフィールビュー */}
                <UserProfileView
                  user={selectedUser}
                  isReadOnly={true}
                  showPaymentTab={false}
                  initialTab="profile"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
