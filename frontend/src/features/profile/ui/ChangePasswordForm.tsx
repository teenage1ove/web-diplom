import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { getErrorMessage } from '@shared/lib/utils';
import { userApi } from '@entities/user';
import { changePasswordSchema, type ChangePasswordFormData } from '../lib/validation';

export const ChangePasswordForm: React.FC = () => {
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setServerMessage(null);
    try {
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setServerMessage({ type: 'success', text: 'Пароль успешно изменён' });
      reset();
    } catch (error: unknown) {
      setServerMessage({ type: 'error', text: getErrorMessage(error, 'Ошибка при смене пароля') });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            serverMessage.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {serverMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{serverMessage.text}</span>
        </div>
      )}

      <Input
        {...register('currentPassword')}
        label="Текущий пароль"
        type="password"
        error={errors.currentPassword?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
      />

      <Input
        {...register('newPassword')}
        label="Новый пароль"
        type="password"
        helperText="Минимум 8 символов, заглавные и строчные буквы, цифры"
        error={errors.newPassword?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
      />

      <Input
        {...register('confirmPassword')}
        label="Подтвердите новый пароль"
        type="password"
        error={errors.confirmPassword?.message}
        leftIcon={<Lock className="h-4 w-4" />}
        fullWidth
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        Сменить пароль
      </Button>
    </form>
  );
};
