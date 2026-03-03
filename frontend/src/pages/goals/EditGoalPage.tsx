import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { goalsApi } from '@/features/goals/api';
import { GoalForm } from '@/features/goals/ui';
import { Card } from '@/shared/ui';
import type { CreateGoalFormData } from '@/features/goals';

export const EditGoalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const goalId = parseInt(id!, 10);

  // Fetch goal
  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => goalsApi.getGoalById(goalId),
    enabled: !isNaN(goalId),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateGoalFormData) => goalsApi.updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] });
      navigate('/goals');
    },
    onError: (error: any) => {
      console.error('Failed to update goal:', error);
      alert(error.response?.data?.message || 'Не удалось обновить цель. Попробуйте снова.');
    },
  });

  const handleSubmit = async (data: CreateGoalFormData) => {
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка цели...</p>
          </div>
        </div>
      );
  }

  if (!goal) {
    return (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="p-6 text-center">
              <p className="text-red-600">Цель не найдена</p>
              <button
                onClick={() => navigate('/goals')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Вернуться к списку целей
              </button>
            </div>
          </Card>
        </div>
      );
  }

  return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/goals')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад к целям
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать цель</h1>
        <p className="text-gray-600 mt-2">Обновите параметры вашей цели</p>
      </div>

      {/* Form */}
      <Card>
        <div className="p-6">
          <GoalForm
            goal={goal}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/goals')}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </Card>
    </div>
  );
};
