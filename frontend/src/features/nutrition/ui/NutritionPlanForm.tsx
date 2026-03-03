import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nutritionPlanSchema, type NutritionPlanFormData } from '../model/validation';
import type { NutritionPlan } from '../model/types';

interface Goal {
  id: number;
  title: string;
}

interface NutritionPlanFormProps {
  initialData?: NutritionPlan | null;
  onSubmit: (data: NutritionPlanFormData) => Promise<void>;
  isLoading?: boolean;
}

export const NutritionPlanForm: React.FC<NutritionPlanFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NutritionPlanFormData>({
    resolver: zodResolver(nutritionPlanSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      goalId: initialData?.goalId || undefined,
      dailyCaloriesTarget: initialData?.dailyCaloriesTarget || undefined,
      proteinGramsTarget: initialData?.proteinGramsTarget
        ? Number(initialData.proteinGramsTarget)
        : undefined,
      carbsGramsTarget: initialData?.carbsGramsTarget
        ? Number(initialData.carbsGramsTarget)
        : undefined,
      fatsGramsTarget: initialData?.fatsGramsTarget
        ? Number(initialData.fatsGramsTarget)
        : undefined,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split('T')[0]
        : '',
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { axiosInstance } = await import('@shared/lib/axios/axiosInstance');
        const { data } = await axiosInstance.get('/goals');
        setGoals(data.goals || []);
      } catch {
        // Goals loading is optional
      }
    };
    loadGoals();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Название плана *
        </label>
        <input
          type="text"
          {...register('title')}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Например: План набора массы"
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
          placeholder="Описание плана питания..."
        />
      </div>

      {goals.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Привязка к цели
          </label>
          <select
            {...register('goalId', { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Без привязки к цели</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Дневные цели по макронутриентам
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-orange-600">
              Калории (ккал)
            </label>
            <input
              type="number"
              {...register('dailyCaloriesTarget', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.dailyCaloriesTarget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2500"
            />
            {errors.dailyCaloriesTarget && (
              <p className="mt-1 text-xs text-red-500">
                {errors.dailyCaloriesTarget.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-red-600">Белки (г)</label>
            <input
              type="number"
              step="0.1"
              {...register('proteinGramsTarget', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
                errors.proteinGramsTarget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="150"
            />
            {errors.proteinGramsTarget && (
              <p className="mt-1 text-xs text-red-500">
                {errors.proteinGramsTarget.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-yellow-600">
              Углеводы (г)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('carbsGramsTarget', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                errors.carbsGramsTarget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="300"
            />
            {errors.carbsGramsTarget && (
              <p className="mt-1 text-xs text-red-500">
                {errors.carbsGramsTarget.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-purple-600">
              Жиры (г)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('fatsGramsTarget', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                errors.fatsGramsTarget ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {errors.fatsGramsTarget && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fatsGramsTarget.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Дата начала *
          </label>
          <input
            type="date"
            {...register('startDate')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Дата окончания
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isActive')}
          id="isActive"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Активный план
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Сохранение...' : initialData ? 'Сохранить изменения' : 'Создать план'}
      </button>
    </form>
  );
};
