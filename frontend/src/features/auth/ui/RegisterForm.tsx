import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { getErrorMessage } from '@shared/lib/utils';
import { useAuthStore } from '../model';
import { registerSchema, type RegisterFormData } from '../lib/validation';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const register_action = useAuthStore((state) => state.register);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await register_action({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      setServerError(getErrorMessage(error, 'Произошла ошибка при регистрации'));
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="Имя"
          type="text"
          placeholder="Иван"
          error={errors.firstName?.message}
          leftIcon={<User className="h-4 w-4" />}
          fullWidth
          autoComplete="given-name"
        />

        <Input
          {...register('lastName')}
          label="Фамилия"
          type="text"
          placeholder="Иванов"
          error={errors.lastName?.message}
          leftIcon={<User className="h-4 w-4" />}
          fullWidth
          autoComplete="family-name"
        />
      </div>

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
        helperText="Минимум 8 символов, заглавные и строчные буквы, цифры"
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        label="Подтверждение пароля"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
        autoComplete="new-password"
      />

      <div className="text-xs text-gray-600">
        Регистрируясь, вы соглашаетесь с{' '}
        <Link to="/terms" className="text-blue-600 hover:underline">
          Условиями использования
        </Link>{' '}
        и{' '}
        <Link to="/privacy" className="text-blue-600 hover:underline">
          Политикой конфиденциальности
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
        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Уже есть аккаунт?{' '}
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Войти
        </Link>
      </div>
    </form>
  );
};
