import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/ui';
import { createGoalSchema, updateGoalSchema, type CreateGoalFormData } from '../lib/validation';
import type { Goal, GoalType } from '../model/types';

interface GoalFormProps {
  goal?: Goal; // If provided, form is in edit mode
  onSubmit: (data: CreateGoalFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const goalTypeOptions: { value: GoalType; label: string }[] = [
  { value: 'weight_loss', label: 'Снижение веса' },
  { value: 'muscle_gain', label: 'Набор мышечной массы' },
  { value: 'endurance', label: 'Выносливость' },
  { value: 'flexibility', label: 'Гибкость' },
  { value: 'general_fitness', label: 'Общая физическая форма' },
];

export const GoalForm = ({ goal, onSubmit, onCancel, isSubmitting }: GoalFormProps) => {
  const isEditMode = !!goal;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGoalFormData>({
    resolver: zodResolver(isEditMode ? updateGoalSchema : createGoalSchema),
    defaultValues: goal
      ? {
          goalType: goal.goalType,
          title: goal.title,
          description: goal.description || '',
          targetValue: goal.targetValue ? parseFloat(goal.targetValue) : undefined,
          currentValue: goal.currentValue ? parseFloat(goal.currentValue) : undefined,
          unit: goal.unit || '',
          startDate: goal.startDate.split('T')[0],
          targetDate: goal.targetDate.split('T')[0],
        }
      : {
          startDate: new Date().toISOString().split('T')[0],
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Goal Type */}
      <div>
        <label htmlFor="goalType" className="block text-sm font-medium text-gray-700 mb-2">
          Тип цели <span className="text-red-500">*</span>
        </label>
        <select
          id="goalType"
          {...register('goalType')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Выберите тип цели</option>
          {goalTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.goalType && (
          <p className="mt-1 text-sm text-red-600">{errors.goalType.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Название <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Например: Похудеть на 10 кг"
          error={errors.title?.message}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="Опишите вашу цель подробнее..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Target Value and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-2">
            Целевое значение
          </label>
          <Input
            id="targetValue"
            type="number"
            step="0.01"
            {...register('targetValue', { valueAsNumber: true })}
            placeholder="85"
            error={errors.targetValue?.message}
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
            Единица измерения
          </label>
          <Input id="unit" {...register('unit')} placeholder="кг" error={errors.unit?.message} />
        </div>
      </div>

      {/* Current Value */}
      <div>
        <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-2">
          Текущее значение
        </label>
        <Input
          id="currentValue"
          type="number"
          step="0.01"
          {...register('currentValue', { valueAsNumber: true })}
          placeholder="80"
          error={errors.currentValue?.message}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Дата начала <span className="text-red-500">*</span>
          </label>
          <Input id="startDate" type="date" {...register('startDate')} error={errors.startDate?.message} />
        </div>
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
            Целевая дата <span className="text-red-500">*</span>
          </label>
          <Input
            id="targetDate"
            type="date"
            {...register('targetDate')}
            error={errors.targetDate?.message}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Сохранение...' : isEditMode ? 'Обновить цель' : 'Создать цель'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
};
