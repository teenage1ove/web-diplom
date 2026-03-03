import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/shared/ui';
import { X } from 'lucide-react';
import type { Workout } from '../model/types';

interface CompleteWorkoutModalProps {
  workout: Workout;
  onComplete: (data: CompleteWorkoutData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const completeWorkoutSchema = z.object({
  durationMinutes: z.number().min(1, 'Минимум 1 минута').optional(),
  caloriesBurned: z.number().min(0, 'Калории не могут быть отрицательными').optional(),
  notes: z.string().optional(),
});

export type CompleteWorkoutData = z.infer<typeof completeWorkoutSchema>;

export const CompleteWorkoutModal = ({
  workout,
  onComplete,
  onClose,
  isLoading,
}: CompleteWorkoutModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteWorkoutData>({
    resolver: zodResolver(completeWorkoutSchema),
    defaultValues: {
      durationMinutes: workout.durationMinutes || undefined,
      caloriesBurned: workout.caloriesBurned || undefined,
      notes: '',
    },
  });

  const handleFormSubmit = (data: CompleteWorkoutData) => {
    onComplete(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Завершить тренировку</h2>
              <p className="text-sm text-gray-600 mt-1">{workout.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фактическая длительность (минуты)
              </label>
              <Input
                type="number"
                min="1"
                {...register('durationMinutes', { setValueAs: v => v === '' ? undefined : Number(v) })}
                placeholder="30"
              />
              {errors.durationMinutes && (
                <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сожженные калории
              </label>
              <Input
                type="number"
                min="0"
                {...register('caloriesBurned', { setValueAs: v => v === '' ? undefined : Number(v) })}
                placeholder="250"
              />
              {errors.caloriesBurned && (
                <p className="text-red-500 text-sm mt-1">{errors.caloriesBurned.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заметки о тренировке
              </label>
              <textarea
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Как прошла тренировка?"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Сохранение...' : 'Завершить'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
