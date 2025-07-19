import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import type { RegisterRequest } from '../types/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'author',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = '名前は必須です';
    }
    
    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります';
    }
    
    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります';
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

    try {
      await register(formData);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('アカウント作成に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント作成
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              こちらからログイン
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {generalError && (
            <Alert type="error">
              {generalError}
            </Alert>
          )}
          
          <div className="space-y-4">
            <Input
              label="名前"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              autoComplete="name"
            />
            
            <Input
              label="ユーザー名"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              helpText="3文字以上の英数字とアンダースコア"
              required
              autoComplete="username"
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
            />
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                役割
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="author">投稿者</option>
                <option value="admin">管理者</option>
              </select>
            </div>
            
            <Input
              label="パスワード"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helpText="8文字以上"
              required
              autoComplete="new-password"
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
            />
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              アカウント作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}