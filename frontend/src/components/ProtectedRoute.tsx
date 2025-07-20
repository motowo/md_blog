import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextDefinition";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "author" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // ローディング中は何も表示しない
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // 認証されていない場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 特定の役割が必要な場合のチェック
  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            このページにアクセスするには
            {requireRole === "admin" ? "管理者" : "投稿者"}権限が必要です。
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
