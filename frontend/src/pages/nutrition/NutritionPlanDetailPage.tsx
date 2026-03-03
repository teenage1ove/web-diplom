import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '@features/nutrition';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@features/nutrition';
import { AddMealModal } from '@features/nutrition/ui/AddMealModal';
import type { Meal, MealType } from '@features/nutrition/model/types';
import type { MealFormData } from '@features/nutrition/model/validation';

const NutritionPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const planId = parseInt(id || '0');

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: plan, isLoading } = useQuery({
    queryKey: ['nutrition-plan', planId],
    queryFn: () => nutritionApi.getPlanById(planId),
    enabled: planId > 0,
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary', selectedDate],
    queryFn: () => nutritionApi.getDailySummary(selectedDate),
  });

  const createMealMutation = useMutation({
    mutationFn: (data: MealFormData) =>
      nutritionApi.createMeal({
        ...data,
        title: data.title || null,
        description: data.description || null,
        calories: data.calories || null,
        proteinGrams: data.proteinGrams || null,
        carbsGrams: data.carbsGrams || null,
        fatsGrams: data.fatsGrams || null,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-stats'] });
    },
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ mealId, data }: { mealId: number; data: MealFormData }) =>
      nutritionApi.updateMeal(mealId, {
        mealType: data.mealType,
        date: data.date,
        title: data.title || null,
        description: data.description || null,
        calories: data.calories || null,
        proteinGrams: data.proteinGrams || null,
        carbsGrams: data.carbsGrams || null,
        fatsGrams: data.fatsGrams || null,
        notes: data.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      setEditingMeal(null);
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: number) => nutritionApi.deleteMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-stats'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="py-12 text-center text-gray-500">План питания не найден</div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ru-RU');

  // Group meals by date
  const mealsByDate = (plan.meals || []).reduce<Record<string, Meal[]>>((acc, meal) => {
    const dateKey = new Date(meal.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(meal);
    return acc;
  }, {});

  const sortedDates = Object.keys(mealsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const ProgressBar = ({
    current,
    target,
    color,
  }: {
    current: number;
    target: number | null;
    color: string;
  }) => {
    if (!target) return null;
    const pct = Math.min((current / target) * 100, 100);
    return (
      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/nutrition')}
          className="mb-2 text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Назад к планам
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
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
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formatDate(plan.startDate)}
              {plan.endDate && ` — ${formatDate(plan.endDate)}`}
            </p>
          </div>
          <button
            onClick={() => navigate(`/nutrition/plans/${planId}/edit`)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Редактировать
          </button>
        </div>
      </div>

      {/* Macros targets */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-600">Калории</p>
          <p className="text-lg font-bold text-orange-700">
            {dailySummary?.totals.calories || 0}
            <span className="text-sm font-normal">
              {plan.dailyCaloriesTarget ? ` / ${plan.dailyCaloriesTarget}` : ''}
            </span>
          </p>
          <ProgressBar
            current={dailySummary?.totals.calories || 0}
            target={plan.dailyCaloriesTarget}
            color="bg-orange-500"
          />
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-600">Белки (г)</p>
          <p className="text-lg font-bold text-red-700">
            {dailySummary?.totals.protein || 0}
            <span className="text-sm font-normal">
              {plan.proteinGramsTarget ? ` / ${Number(plan.proteinGramsTarget)}` : ''}
            </span>
          </p>
          <ProgressBar
            current={dailySummary?.totals.protein || 0}
            target={plan.proteinGramsTarget ? Number(plan.proteinGramsTarget) : null}
            color="bg-red-500"
          />
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-600">Углеводы (г)</p>
          <p className="text-lg font-bold text-yellow-700">
            {dailySummary?.totals.carbs || 0}
            <span className="text-sm font-normal">
              {plan.carbsGramsTarget ? ` / ${Number(plan.carbsGramsTarget)}` : ''}
            </span>
          </p>
          <ProgressBar
            current={dailySummary?.totals.carbs || 0}
            target={plan.carbsGramsTarget ? Number(plan.carbsGramsTarget) : null}
            color="bg-yellow-500"
          />
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <p className="text-xs text-purple-600">Жиры (г)</p>
          <p className="text-lg font-bold text-purple-700">
            {dailySummary?.totals.fats || 0}
            <span className="text-sm font-normal">
              {plan.fatsGramsTarget ? ` / ${Number(plan.fatsGramsTarget)}` : ''}
            </span>
          </p>
          <ProgressBar
            current={dailySummary?.totals.fats || 0}
            target={plan.fatsGramsTarget ? Number(plan.fatsGramsTarget) : null}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Date selector & add meal */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Приёмы пищи</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          onClick={() => setShowAddMeal(true)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          + Добавить приём
        </button>
      </div>

      {/* Meals grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">Нет приёмов пищи</p>
          <p className="text-sm text-gray-400">
            Добавьте первый приём пищи, нажав кнопку выше
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="mb-2 text-sm font-medium text-gray-500">
                {new Date(dateKey).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              <div className="space-y-2">
                {mealsByDate[dateKey]
                  .sort((a, b) => {
                    const order: Record<string, number> = {
                      breakfast: 0,
                      lunch: 1,
                      dinner: 2,
                      snack: 3,
                    };
                    return (order[a.mealType] || 0) - (order[b.mealType] || 0);
                  })
                  .map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {MEAL_TYPE_ICONS[meal.mealType as MealType]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {MEAL_TYPE_LABELS[meal.mealType as MealType]}
                            </span>
                            {meal.title && (
                              <span className="text-sm text-gray-500">
                                — {meal.title}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                            {meal.calories && (
                              <span className="text-orange-600">
                                {meal.calories} ккал
                              </span>
                            )}
                            {meal.proteinGrams && (
                              <span className="text-red-600">
                                Б: {Number(meal.proteinGrams)}г
                              </span>
                            )}
                            {meal.carbsGrams && (
                              <span className="text-yellow-600">
                                У: {Number(meal.carbsGrams)}г
                              </span>
                            )}
                            {meal.fatsGrams && (
                              <span className="text-purple-600">
                                Ж: {Number(meal.fatsGrams)}г
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingMeal(meal)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Удалить приём пищи?')) {
                              deleteMealMutation.mutate(meal.id);
                            }
                          }}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Meal Modal */}
      <AddMealModal
        nutritionPlanId={planId}
        isOpen={showAddMeal}
        onClose={() => setShowAddMeal(false)}
        onSubmit={async (data) => {
          await createMealMutation.mutateAsync(data);
        }}
        isLoading={createMealMutation.isPending}
      />

      {/* Edit Meal Modal */}
      {editingMeal && (
        <AddMealModal
          nutritionPlanId={planId}
          isOpen={true}
          onClose={() => setEditingMeal(null)}
          editMode
          initialData={{
            mealType: editingMeal.mealType,
            date: editingMeal.date,
            title: editingMeal.title || undefined,
            calories: editingMeal.calories || undefined,
            proteinGrams: editingMeal.proteinGrams ? Number(editingMeal.proteinGrams) : undefined,
            carbsGrams: editingMeal.carbsGrams ? Number(editingMeal.carbsGrams) : undefined,
            fatsGrams: editingMeal.fatsGrams ? Number(editingMeal.fatsGrams) : undefined,
            description: editingMeal.description || undefined,
            notes: editingMeal.notes || undefined,
          }}
          onSubmit={async (data) => {
            await updateMealMutation.mutateAsync({
              mealId: editingMeal.id,
              data,
            });
          }}
          isLoading={updateMealMutation.isPending}
        />
      )}
    </div>
  );
};

export default NutritionPlanDetailPage;
