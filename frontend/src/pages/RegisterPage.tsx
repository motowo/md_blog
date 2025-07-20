import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContextDefinition";
import type { RegisterRequest, ApiError } from "../types/auth";

const RegisterPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
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

    if (!formData.username.trim()) {
      newErrors.username = "ユーザー名を入力してください";
    } else if (formData.username.length < 3) {
      newErrors.username = "ユーザー名は3文字以上で入力してください";
    }

    if (!formData.email) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    } else if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "パスワード確認を入力してください";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "パスワードが一致しません";
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
      await register(formData);
      navigate("/"); // 登録成功後はホームページへ
    } catch (error) {
      console.error("Registration failed:", error);
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
        setGeneralError(apiError.message || "ユーザー登録に失敗しました");
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
            新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            アカウントを作成してください
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              ユーザー情報を入力
            </h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="ユーザー名"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="username123"
                required
              />

              <Input
                label="表示名（任意）"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="田中太郎"
              />

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
                placeholder="8文字以上のパスワード"
                required
              />

              <Input
                label="パスワード確認"
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                error={errors.password_confirmation}
                placeholder="パスワードを再入力"
                required
              />

              {generalError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {generalError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                アカウント作成
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                すでにアカウントをお持ちの方は{" "}
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ログイン
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

export default RegisterPage;
