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
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <Layout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        管理者ダッシュボード
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        管理者専用のページです。
                      </p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
