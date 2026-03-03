import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/ui';
import { updateProgressSchema, type UpdateProgressFormData } from '../lib/validation';
import type { Goal } from '../model/types';

interface UpdateProgressModalProps {
  goal: Goal;
  onSubmit: (value: number) => void | Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const UpdateProgressModal = ({
  goal,
  onSubmit,
  onClose,
  isSubmitting,
}: UpdateProgressModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProgressFormData>({
    resolver: zodResolver(updateProgressSchema),
    defaultValues: {
      currentValue: goal.currentValue ? parseFloat(goal.currentValue) : 0,
    },
  });

  const handleFormSubmit = async (data: UpdateProgressFormData) => {
    await onSubmit(data.currentValue);
  };

  const progress = parseFloat(goal.progressPercentage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Обновить прогресс</h2>
              <p className="mt-1 text-sm text-gray-600">{goal.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Progress */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Текущий прогресс</span>
              <span className="font-semibold text-blue-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            {goal.targetValue && goal.unit && (
              <div className="flex justify-between text-sm pt-2">
                <div>
                  <p className="text-gray-500">Текущее</p>
                  <p className="font-semibold text-gray-900">{goal.currentValue || '0'} {goal.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Цель</p>
                  <p className="font-semibold text-gray-900">{goal.targetValue} {goal.unit}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-2">
                Новое значение {goal.unit && `(${goal.unit})`}
              </label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                {...register('currentValue', { valueAsNumber: true })}
                placeholder={goal.currentValue || '0'}
                error={errors.currentValue?.message}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Введите текущее значение вашего показателя
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
