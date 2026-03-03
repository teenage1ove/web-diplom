import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '@features/nutrition';
import { NutritionPlanForm } from '@features/nutrition/ui/NutritionPlanForm';
import type { NutritionPlanFormData } from '@features/nutrition/model/validation';

const EditNutritionPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = parseInt(id || '0');

  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['nutrition-plan', planId],
    queryFn: () => nutritionApi.getPlanById(planId),
    enabled: planId > 0,
  });

  const handleSubmit = async (data: NutritionPlanFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await nutritionApi.updatePlan(planId, {
        ...data,
        description: data.description || null,
        endDate: data.endDate || null,
        dailyCaloriesTarget: data.dailyCaloriesTarget || null,
        proteinGramsTarget: data.proteinGramsTarget || null,
        carbsGramsTarget: data.carbsGramsTarget || null,
        fatsGramsTarget: data.fatsGramsTarget || null,
        goalId: data.goalId || null,
      });
      queryClient.invalidateQueries({ queryKey: ['nutrition-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-plans'] });
      navigate(`/nutrition/plans/${planId}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при обновлении плана';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPlan) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/nutrition/plans/${planId}`)}
          className="mb-2 text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Назад к плану
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Редактировать план</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <NutritionPlanForm
          initialData={plan}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EditNutritionPlanPage;
