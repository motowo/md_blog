import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContextDefinition";
import Button from "./ui/Button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                MD Blog
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center space-x-2"
              >
                <span>{isDark ? "☀️" : "🌙"}</span>
                <span className="hidden sm:inline">
                  {isDark ? "ライト" : "ダーク"}
                </span>
              </Button>

              {!isAuthenticated ? (
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    ログイン
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <Link
                      to="/mypage"
                      className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {user?.username}
                      {user?.role === "admin" && (
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          管理者
                        </span>
                      )}
                    </Link>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    ログアウト
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
