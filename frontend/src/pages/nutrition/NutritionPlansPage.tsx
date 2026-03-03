import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '@features/nutrition';
import { NutritionPlanCard } from '@features/nutrition/ui/NutritionPlanCard';

const NutritionPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['nutrition-plans', filterActive],
    queryFn: () => nutritionApi.getPlans({ isActive: filterActive, limit: 50 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['nutrition-stats'],
    queryFn: () => nutritionApi.getStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) => nutritionApi.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plans'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-stats'] });
    },
  });

  const handleDelete = (planId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот план питания?')) {
      deleteMutation.mutate(planId);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Питание</h1>
          <p className="text-sm text-gray-500">Планы питания и отслеживание приёмов пищи</p>
        </div>
        <button
          onClick={() => navigate('/nutrition/plans/new')}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Новый план
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalPlans}</p>
            <p className="text-xs text-gray-500">Всего планов</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
            <p className="text-xs text-gray-500">Активных</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.todayCalories}</p>
            <p className="text-xs text-gray-500">Калорий сегодня</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.todayMealsCount}</p>
            <p className="text-xs text-gray-500">Приёмов сегодня</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterActive(undefined)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filterActive === undefined
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setFilterActive(true)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filterActive === true
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Активные
        </button>
        <button
          onClick={() => setFilterActive(false)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filterActive === false
              ? 'bg-gray-200 text-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Неактивные
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
        </div>
      ) : data?.plans.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg font-medium text-gray-600">Нет планов питания</p>
          <p className="mt-1 text-sm text-gray-400">
            Создайте первый план для отслеживания питания
          </p>
          <button
            onClick={() => navigate('/nutrition/plans/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Создать план
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.plans.map((plan) => (
            <NutritionPlanCard
              key={plan.id}
              plan={plan}
              onView={(id) => navigate(`/nutrition/plans/${id}`)}
              onEdit={(id) => navigate(`/nutrition/plans/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionPlansPage;
