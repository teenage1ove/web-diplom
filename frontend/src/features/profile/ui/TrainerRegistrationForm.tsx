import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, FileText, Award, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '@shared/ui';
import { getErrorMessage } from '@shared/lib/utils';
import { userApi } from '@entities/user';
import { trainerSchema, type TrainerFormData } from '../lib/validation';

interface TrainerRegistrationFormProps {
  onSuccess?: () => void;
}

export const TrainerRegistrationForm: React.FC<TrainerRegistrationFormProps> = ({ onSuccess }) => {
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
  });

  const onSubmit = async (data: TrainerFormData) => {
    setServerMessage(null);
    try {
      const specialization = data.specialization
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const certifications = data.certifications
        ? data.certifications.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await userApi.registerAsTrainer({
        specialization,
        bio: data.bio,
        experienceYears: Number(data.experienceYears),
        certifications,
        hourlyRate: data.hourlyRate,
      });

      setServerMessage({ type: 'success', text: 'Вы успешно зарегистрированы как тренер!' });
      onSuccess?.();
    } catch (error: unknown) {
      setServerMessage({ type: 'error', text: getErrorMessage(error, 'Ошибка при регистрации') });
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
        {...register('specialization')}
        label="Специализации"
        placeholder="силовые, кардио, йога"
        helperText="Укажите через запятую"
        error={errors.specialization?.message}
        leftIcon={<Briefcase className="h-4 w-4" />}
        fullWidth
      />

      <div>
        <label className="text-sm font-medium text-gray-700">Описание</label>
        <textarea
          {...register('bio')}
          placeholder="Расскажите о себе, своём опыте и подходе к тренировкам..."
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('experienceYears')}
          label="Опыт (лет)"
          type="number"
          placeholder="5"
          error={errors.experienceYears?.message}
          leftIcon={<FileText className="h-4 w-4" />}
          fullWidth
        />
        <Input
          {...register('hourlyRate')}
          label="Тариф (руб/час)"
          type="number"
          placeholder="3000"
          error={errors.hourlyRate?.message}
          leftIcon={<DollarSign className="h-4 w-4" />}
          fullWidth
        />
      </div>

      <Input
        {...register('certifications')}
        label="Сертификаты"
        placeholder="NASM-CPT, ACE"
        helperText="Укажите через запятую (необязательно)"
        error={errors.certifications?.message}
        leftIcon={<Award className="h-4 w-4" />}
        fullWidth
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        Стать тренером
      </Button>
    </form>
  );
};
