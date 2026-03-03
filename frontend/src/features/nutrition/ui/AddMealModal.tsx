import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mealSchema, type MealFormData } from '../model/validation';
import { MEAL_TYPE_LABELS } from '../model/types';
import type { MealType } from '../model/types';

interface AddMealModalProps {
  nutritionPlanId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MealFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: {
    mealType?: MealType;
    date?: string;
    title?: string;
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatsGrams?: number;
    description?: string;
    notes?: string;
  };
  editMode?: boolean;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  nutritionPlanId,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  editMode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      nutritionPlanId,
      mealType: initialData?.mealType || 'breakfast',
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      title: initialData?.title || '',
      description: initialData?.description || '',
      calories: initialData?.calories || undefined,
      proteinGrams: initialData?.proteinGrams || undefined,
      carbsGrams: initialData?.carbsGrams || undefined,
      fatsGrams: initialData?.fatsGrams || undefined,
      notes: initialData?.notes || '',
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data: MealFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {editMode ? 'Редактировать приём пищи' : 'Добавить приём пищи'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <input type="hidden" {...register('nutritionPlanId', { valueAsNumber: true })} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Тип приёма пищи *
              </label>
              <select
                {...register('mealType')}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mealType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
              {errors.mealType && (
                <p className="mt-1 text-xs text-red-500">{errors.mealType.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Дата *</label>
              <input
                type="date"
                {...register('date')}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              {...register('title')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Овсянка с ягодами"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Описание</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Состав блюда..."
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <h4 className="mb-2 text-xs font-semibold text-gray-600 uppercase">
              Пищевая ценность
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-orange-600">Калории</label>
                <input
                  type="number"
                  {...register('calories', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-red-600">Белки (г)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('proteinGrams', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-yellow-600">Углеводы (г)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('carbsGrams', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-purple-600">Жиры (г)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('fatsGrams', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Заметки</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительные заметки..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Сохранение...' : editMode ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
