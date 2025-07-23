import React, { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextDefinition";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 管理者でない場合はリダイレクト
  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      label: "ダッシュボード",
      path: "/admin",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"
          />
        </svg>
      ),
    },
    {
      label: "投稿者管理",
      path: "/admin/users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 4a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      label: "記事管理",
      path: "/admin/articles",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      label: "振込管理",
      path: "/admin/payouts",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "手数料設定",
      path: "/admin/commission-settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.896.534 2.06.234 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: "アカウント設定",
      path: "/admin/account",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  const isActiveMenu = (path: string): boolean => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentPageTitle = (): string => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find((item) => {
      if (item.path === "/admin") {
        return currentPath === "/admin";
      }
      return currentPath.startsWith(item.path);
    });
    return currentItem?.label || "管理者画面";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* サイドバー */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col fixed left-0 top-0 h-screen z-10`}
      >
        {/* サイドバーヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link
                to="/admin"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                管理者画面
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarCollapsed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveMenu(item.path)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* サイドバーフッター */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                ログイン中
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || user?.username}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "サイトを表示" : undefined}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">サイトを表示</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "ログアウト" : undefined}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">ログアウト</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <div
        className={`flex-1 flex flex-col ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300 ease-in-out`}
      >
        {/* トップバー */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getCurrentPageTitle()}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
