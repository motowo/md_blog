import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'ホーム', public: true },
    { path: '/articles', label: '記事一覧', public: true },
    { path: '/dashboard', label: 'ダッシュボード', public: false },
    { path: '/admin', label: '管理画面', public: false, adminOnly: true },
  ];

  return (
    <nav
      className={`bg-white/80 dark:bg-dark-100/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-dark-200/50 sticky top-0 z-40 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* ロゴ・ブランド */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-300 dark:hover:to-purple-300 transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg blur opacity-20"></div>
                <svg
                  className="relative h-10 w-10 text-primary-600 dark:text-primary-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2M11 7H13V9H11V7M11 11H13V17H11V11Z" />
                </svg>
              </div>
              <span>MD Blog</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                // 公開リンクか、認証済みユーザー向けリンクかをチェック
                if (!link.public && !isAuthenticated) return null;
                if (link.adminOnly && user?.role !== 'admin') return null;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActivePath(link.path)
                        ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右側のアクション */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle size="sm" />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  こんにちは、{user?.name || user?.username}さん
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">登録</Button>
                </Link>
              </div>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-dark-200">
            {navLinks.map((link) => {
              if (!link.public && !isAuthenticated) return null;
              if (link.adminOnly && user?.role !== 'admin') return null;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePath(link.path)
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-gray-200 dark:border-dark-200">
              <div className="px-3 py-2">
                <ThemeToggle size="sm" />
              </div>

              {isAuthenticated ? (
                <div className="space-y-2 px-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    こんにちは、{user?.name || user?.username}さん
                  </p>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                    ログアウト
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      ログイン
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      登録
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
