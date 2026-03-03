import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nutritionApi } from '@features/nutrition';
import { NutritionPlanForm } from '@features/nutrition/ui/NutritionPlanForm';
import type { NutritionPlanFormData } from '@features/nutrition/model/validation';

const CreateNutritionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NutritionPlanFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await nutritionApi.createPlan({
        ...data,
        description: data.description || null,
        endDate: data.endDate || null,
        dailyCaloriesTarget: data.dailyCaloriesTarget || null,
        proteinGramsTarget: data.proteinGramsTarget || null,
        carbsGramsTarget: data.carbsGramsTarget || null,
        fatsGramsTarget: data.fatsGramsTarget || null,
        goalId: data.goalId || null,
      });
      navigate(`/nutrition/plans/${plan.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при создании плана';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/nutrition')}
          className="mb-2 text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Назад к планам
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Новый план питания</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <NutritionPlanForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CreateNutritionPlanPage;
