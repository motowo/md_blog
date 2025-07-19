import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 認証が必要なルート（将来の実装用） */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">ダッシュボード</h1>
                    <p className="mt-4">認証済みユーザー専用ページです</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* 管理者専用ルート（将来の実装用） */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
                    <p className="mt-4">管理者専用ページです</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* 未定義のパスは root にリダイレクト */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
