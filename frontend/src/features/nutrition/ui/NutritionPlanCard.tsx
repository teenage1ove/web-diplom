import React from 'react';
import type { NutritionPlan } from '../model/types';

interface NutritionPlanCardProps {
  plan: NutritionPlan;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const NutritionPlanCard: React.FC<NutritionPlanCardProps> = ({
  plan,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
            {plan.isActive ? (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Активный
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Неактивный
              </span>
            )}
          </div>
          {plan.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{plan.description}</p>
          )}
        </div>
      </div>

      {plan.goal && (
        <div className="mb-3">
          <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
            Цель: {plan.goal.title}
          </span>
        </div>
      )}

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-orange-50 p-2 text-center">
          <p className="text-xs text-orange-600">Калории</p>
          <p className="text-sm font-semibold text-orange-700">
            {plan.dailyCaloriesTarget || '—'}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-2 text-center">
          <p className="text-xs text-red-600">Белки (г)</p>
          <p className="text-sm font-semibold text-red-700">
            {plan.proteinGramsTarget ? Number(plan.proteinGramsTarget) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-2 text-center">
          <p className="text-xs text-yellow-600">Углеводы (г)</p>
          <p className="text-sm font-semibold text-yellow-700">
            {plan.carbsGramsTarget ? Number(plan.carbsGramsTarget) : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-purple-50 p-2 text-center">
          <p className="text-xs text-purple-600">Жиры (г)</p>
          <p className="text-sm font-semibold text-purple-700">
            {plan.fatsGramsTarget ? Number(plan.fatsGramsTarget) : '—'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
        <span>С {formatDate(plan.startDate)}</span>
        {plan.endDate && <span>До {formatDate(plan.endDate)}</span>}
        {plan._count && <span>{plan._count.meals} приёмов пищи</span>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(plan.id)}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Открыть
        </button>
        <button
          onClick={() => onEdit(plan.id)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Изменить
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};
