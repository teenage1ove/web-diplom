import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Calendar, Ruler, Weight, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { getErrorMessage } from '@shared/lib/utils';
import { userApi } from '@entities/user';
import { useAuthStore } from '@features/auth';
import { profileSchema, type ProfileFormData } from '../lib/validation';
import type { User } from '@shared/types';

interface ProfileEditFormProps {
  user: User;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: (user.gender as ProfileFormData['gender']) || null,
      height: user.height ? Number(user.height) : null,
      weight: user.weight ? Number(user.weight) : null,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerMessage(null);
    try {
      const response = await userApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        height: data.height,
        weight: data.weight,
        phone: data.phone || null,
      });

      setUser(response.user);
      setServerMessage({ type: 'success', text: 'Профиль успешно обновлён' });
    } catch (error: unknown) {
      setServerMessage({ type: 'error', text: getErrorMessage(error, 'Ошибка при обновлении профиля') });
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="Имя"
          error={errors.firstName?.message}
          leftIcon={<UserIcon className="h-4 w-4" />}
          fullWidth
        />
        <Input
          {...register('lastName')}
          label="Фамилия"
          error={errors.lastName?.message}
          leftIcon={<UserIcon className="h-4 w-4" />}
          fullWidth
        />
      </div>

      <Input
        {...register('dateOfBirth')}
        label="Дата рождения"
        type="date"
        error={errors.dateOfBirth?.message}
        leftIcon={<Calendar className="h-4 w-4" />}
        fullWidth
      />

      <div>
        <label className="text-sm font-medium text-gray-700">Пол</label>
        <select
          {...register('gender')}
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <option value="">Не указан</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
          <option value="prefer_not_to_say">Предпочитаю не указывать</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('height')}
          label="Рост (см)"
          type="number"
          placeholder="185"
          error={errors.height?.message}
          leftIcon={<Ruler className="h-4 w-4" />}
          fullWidth
        />
        <Input
          {...register('weight')}
          label="Вес (кг)"
          type="number"
          placeholder="80"
          error={errors.weight?.message}
          leftIcon={<Weight className="h-4 w-4" />}
          fullWidth
        />
      </div>

      <Input
        {...register('phone')}
        label="Телефон"
        type="tel"
        placeholder="+7 999 123 4567"
        error={errors.phone?.message}
        leftIcon={<Phone className="h-4 w-4" />}
        fullWidth
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        Сохранить изменения
      </Button>
    </form>
  );
};
