import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card, CardBody } from '../components/ui/Card';
import type { RegisterRequest } from '../types/auth';

export function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上で入力してください';
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'パスワード確認は必須です';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'パスワードが一致しません';
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
    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        // API エラーレスポンスの処理
        if (error.message.includes('email')) {
          setGeneralError('このメールアドレスは既に使用されています。');
        } else if (error.message.includes('username')) {
          setGeneralError('このユーザー名は既に使用されています。');
        } else {
          setGeneralError(error.message || 'アカウント作成に失敗しました。');
        }
      } else {
        setGeneralError('アカウント作成に失敗しました。しばらく後にもう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-dark-100 dark:via-dark-50 dark:to-dark-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce-soft"></div>
        <div
          className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce-soft"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce-soft"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative max-w-md w-full animate-fade-in">
        <Card className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md shadow-2xl border-0">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-bounce-soft">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                アカウント作成
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                すでにアカウントをお持ちの方は{' '}
                <Link
                  to="/login"
                  className="font-semibold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent hover:from-primary-700 hover:to-purple-700 transition-all duration-300"
                >
                  こちらからログイン
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {generalError && <Alert type="error">{generalError}</Alert>}

              <div className="space-y-5">
                <Input
                  label="ユーザー名"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required
                  autoComplete="username"
                  className="transition-all duration-300 focus:scale-[1.02]"
                  helpText="3文字以上で入力してください"
                />

                <Input
                  label="メールアドレス"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  autoComplete="email"
                  className="transition-all duration-300 focus:scale-[1.02]"
                />

                <Input
                  label="表示名（任意）"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  autoComplete="name"
                  className="transition-all duration-300 focus:scale-[1.02]"
                  helpText="公開プロフィールに表示される名前です"
                />

                <Input
                  label="パスワード"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  className="transition-all duration-300 focus:scale-[1.02]"
                  helpText="6文字以上で入力してください"
                />

                <Input
                  label="パスワード確認"
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  error={errors.password_confirmation}
                  required
                  autoComplete="new-password"
                  className="transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {loading ? 'アカウント作成中...' : '🚀 アカウント作成'}
              </Button>
            </form>

            {/* 利用規約等 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-200">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                アカウント作成により、
                <br />
                <span className="text-primary-600 dark:text-primary-400">利用規約</span>と
                <span className="text-primary-600 dark:text-primary-400">プライバシーポリシー</span>
                に同意したものとみなされます
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
