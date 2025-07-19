import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card, CardBody } from '../components/ui/Card';
import type { LoginRequest } from '../types/auth';

export function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
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
      await login(formData);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        // API エラーレスポンスの処理
        if (error.message.includes('credentials')) {
          setGeneralError('メールアドレスまたはパスワードが正しくありません。');
        } else {
          setGeneralError(error.message || 'ログインに失敗しました。');
        }
      } else {
        setGeneralError('ログインに失敗しました。しばらく後にもう一度お試しください。');
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
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-bounce-soft">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2M11 7H13V9H11V7M11 11H13V17H11V11Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ログイン</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                まだアカウントをお持ちでない方は{' '}
                <Link
                  to="/register"
                  className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300 transition-colors"
                >
                  こちらから登録
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {generalError && <Alert type="error">{generalError}</Alert>}

              <div className="space-y-5">
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
                  label="パスワード"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                  className="transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>

            {/* フッター情報 */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                セキュアな認証システムで
                <br />
                あなたの情報を保護しています 🔒
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
