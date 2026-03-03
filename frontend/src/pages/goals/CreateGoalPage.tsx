import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { goalsApi } from '@/features/goals/api';
import { GoalForm } from '@/features/goals/ui';
import { Card } from '@/shared/ui';
import type { CreateGoalFormData } from '@/features/goals';

export const CreateGoalPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateGoalFormData) => goalsApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] });
      navigate('/goals');
    },
    onError: (error: any) => {
      console.error('Failed to create goal:', error);
      alert(error.response?.data?.message || 'Не удалось создать цель. Попробуйте снова.');
    },
  });

  const handleSubmit = async (data: CreateGoalFormData) => {
    await createMutation.mutateAsync(data);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Создать новую цель</h1>
        <p className="text-gray-600 mt-2">
          Определите свою фитнес-цель и начните отслеживать прогресс
        </p>
      </div>

      {/* Form */}
      <Card>
        <div className="p-6">
          <GoalForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/goals')}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </Card>
    </div>
  );
};
