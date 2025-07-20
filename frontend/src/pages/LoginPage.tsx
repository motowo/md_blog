import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContextDefinition";
import type { LoginRequest, ApiError } from "../types/auth";

const LoginPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      await login(formData);
      navigate("/"); // ログイン成功後はホームページへ
    } catch (error) {
      console.error("Login failed:", error);
      const apiError = error as ApiError;

      if (apiError.errors && Object.keys(apiError.errors).length > 0) {
        // フィールド別エラーがある場合
        setErrors(
          Object.entries(apiError.errors).reduce(
            (acc, [field, messages]) => {
              acc[field] = messages[0]; // 最初のエラーメッセージを使用
              return acc;
            },
            {} as { [key: string]: string },
          ),
        );
      } else {
        // 一般的なエラーメッセージ（日本語に変換済み）
        setGeneralError(apiError.message || "ログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="absolute top-4 right-4">
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
        </div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            アカウントにログインしてください
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              ログイン情報を入力
            </h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="メールアドレス"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="your@email.com"
                required
              />

              <Input
                label="パスワード"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="パスワードを入力"
                required
              />

              {generalError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {generalError}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="font-medium mb-1">
                  テスト用管理者アカウント:
                </div>
                <div>Email: admin@md-blog.local</div>
                <div>Password: password123</div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                ログイン
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                アカウントをお持ちでない方は{" "}
                <Link
                  to="/register"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  新規登録
                </Link>
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  to="/"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ホームに戻る
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
