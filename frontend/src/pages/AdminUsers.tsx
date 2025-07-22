import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import UserProfileModal from "../components/UserProfileModal";
import { useAuth } from "../contexts/AuthContextDefinition";
import {
  AdminService,
  type AdminUser,
  type UsersResponse,
} from "../utils/adminApi";
import { getBadgeClass } from "../constants/badgeStyles";

const AdminUsers: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: UsersResponse = await AdminService.getUsers({
        page: currentPage,
        per_page: 15,
        search: searchQuery || undefined,
      });
      setUsers(data.users);
      setTotalPages(data.pagination.last_page);
      setTotalUsers(data.pagination.total);
    } catch (err) {
      console.error("Users fetch failed:", err);
      setError("ユーザー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
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
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ユーザー管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            登録ユーザーの一覧と管理
          </p>
        </div>

        {/* 検索フォーム */}
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ユーザー名、名前、メールアドレスで検索..."
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
                ユーザー一覧
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalUsers.toLocaleString()}件中{" "}
                {Math.min((currentPage - 1) * 15 + 1, totalUsers)}-
                {Math.min(currentPage * 15, totalUsers)}件を表示
              </span>
            </div>
          </CardHeader>
          <CardBody>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchQuery
                  ? "検索条件に一致するユーザーが見つかりません"
                  : "ユーザーが登録されていません"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        ユーザー
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        ロール
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        記事数
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        購入数
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        最終ログイン
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        登録日
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((targetUser) => (
                      <tr
                        key={targetUser.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {targetUser.avatar_path ? (
                                <img
                                  src={`http://localhost:8000${targetUser.avatar_path}`}
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
                          <span
                            className={getBadgeClass("userRole", targetUser.role === "admin" ? "admin" : "user")}
                          >
                            {targetUser.role === "admin" ? "管理者" : "投稿者"}
                          </span>
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
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(targetUser)}
                            >
                              参照
                            </Button>
                            {targetUser.id !== user?.id && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleStatus(targetUser)}
                                  className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900"
                                >
                                  {targetUser.is_active ? "無効化" : "有効化"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(targetUser)}
                                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                                >
                                  削除
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <span className="flex items-center px-4 text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ユーザー情報参照モーダル */}
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            isOpen={showProfileModal}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedUser(null);
            }}
            isReadOnly={true}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
