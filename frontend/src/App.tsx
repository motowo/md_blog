import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ArticleListPage } from "./pages/ArticleListPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import ArticleCreatePage from "./pages/ArticleCreatePage";
import ArticleEditPage from "./pages/ArticleEditPage";
import UserMyPage from "./pages/UserMyPage";
import UserPublicProfilePage from "./pages/UserPublicProfilePage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import SalesManagement from "./pages/SalesManagement";
import PayoutManagement from "./pages/PayoutManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminArticles from "./pages/AdminArticles";
import AdminAccount from "./pages/AdminAccount";
import { AdminCommissionSettings } from "./pages/AdminCommissionSettings";
import { AdminPayouts } from "./pages/AdminPayouts";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* 記事関連ルート */}
            <Route
              path="/articles"
              element={
                <Layout>
                  <ArticleListPage />
                </Layout>
              }
            />
            <Route
              path="/articles/:id"
              element={
                <Layout>
                  <ArticleDetailPage />
                </Layout>
              }
            />

            {/* 記事作成・編集ルート（認証が必要） */}
            <Route
              path="/articles/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ArticleCreatePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ArticleEditPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ユーザーマイページ（認証が必要） */}
            <Route
              path="/mypage"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserMyPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 公開プロフィール表示（認証不要） */}
            <Route
              path="/users/:username"
              element={
                <Layout>
                  <UserPublicProfilePage />
                </Layout>
              }
            />

            {/* 購入履歴ページ（認証が必要） */}
            <Route
              path="/payment-history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PaymentHistoryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 売上管理（認証が必要） */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 売上入金管理（認証が必要） */}
            <Route
              path="/payouts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PayoutManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 保護されたルート（認証が必要） */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        ダッシュボード
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        認証済みユーザー専用のページです。
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 管理者専用ルート */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/account" element={<AdminAccount />} />
            <Route
              path="/admin/commission-settings"
              element={<AdminCommissionSettings />}
            />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
