import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { consultationsApi } from '@features/consultations';
import { SESSION_TYPE_LABELS } from '@features/consultations';
import type { SessionType } from '@features/consultations';

const bookingSchema = z.object({
  trainerId: z.number().int().positive('Выберите тренера'),
  sessionType: z.enum(['one_time', 'recurring', 'package'], {
    required_error: 'Выберите тип',
  }),
  title: z.string().min(2, 'Минимум 2 символа').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  scheduledDate: z.string().min(1, 'Выберите дату и время'),
  durationMinutes: z.number().int().min(15).max(480),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: trainersData } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => consultationsApi.getTrainers(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      durationMinutes: 60,
      sessionType: 'one_time',
    },
  });

  const selectedTrainerId = watch('trainerId');
  const selectedTrainer = trainersData?.trainers.find(
    (t) => t.id === Number(selectedTrainerId)
  );

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const consultation = await consultationsApi.createConsultation({
        ...data,
        description: data.description || null,
        notes: data.notes || null,
      });
      navigate(`/consultations/${consultation.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании записи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/consultations')}
          className="mb-2 text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Назад
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Записаться на консультацию</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Тренер *</label>
            <select
              {...register('trainerId', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.trainerId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Выберите тренера</option>
              {trainersData?.trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.firstName} {t.user.lastName}
                  {t.specialization.length > 0 && ` — ${t.specialization.join(', ')}`}
                  {t.hourlyRate && ` (${Number(t.hourlyRate)} руб/час)`}
                </option>
              ))}
            </select>
            {errors.trainerId && (
              <p className="mt-1 text-xs text-red-500">{errors.trainerId.message}</p>
            )}
          </div>

          {selectedTrainer && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <p className="font-medium text-blue-700">
                {selectedTrainer.user.firstName} {selectedTrainer.user.lastName}
              </p>
              {selectedTrainer.bio && (
                <p className="mt-1 text-blue-600">{selectedTrainer.bio}</p>
              )}
              <div className="mt-1 flex gap-3 text-xs text-blue-500">
                {selectedTrainer.experienceYears && (
                  <span>Опыт: {selectedTrainer.experienceYears} лет</span>
                )}
                <span>Рейтинг: {Number(selectedTrainer.rating)}/5</span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Название консультации *
            </label>
            <input
              type="text"
              {...register('title')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Например: Составление программы тренировок"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Описание</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Опишите что вы хотите обсудить..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Тип *</label>
              <select
                {...register('sessionType')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(SESSION_TYPE_LABELS) as [SessionType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Длительность (мин) *
              </label>
              <select
                {...register('durationMinutes', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 минут</option>
                <option value={60}>60 минут</option>
                <option value={90}>90 минут</option>
                <option value={120}>2 часа</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Дата и время *
            </label>
            <input
              type="datetime-local"
              {...register('scheduledDate')}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.scheduledDate && (
              <p className="mt-1 text-xs text-red-500">{errors.scheduledDate.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Заметки</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительная информация для тренера..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Создание...' : 'Записаться'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookConsultationPage;
