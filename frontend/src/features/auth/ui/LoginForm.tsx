import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { getErrorMessage } from '@shared/lib/utils';
import { useAuthStore } from '../model';
import { loginSchema, type LoginFormData } from '../lib/validation';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Произошла ошибка при входе'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        error={errors.email?.message}
        leftIcon={<Mail className="h-4 w-4" />}
        fullWidth
        autoComplete="email"
      />

      <Input
        {...register('password')}
        label="Пароль"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Запомнить меня</span>
        </label>

        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          Забыли пароль?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Вход...' : 'Войти'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
};
