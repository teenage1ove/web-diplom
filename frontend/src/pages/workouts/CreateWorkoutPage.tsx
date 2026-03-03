import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi, WorkoutForm, type CreateWorkoutFormData } from '@/features/workouts';
import { ArrowLeft } from 'lucide-react';

export const CreateWorkoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkoutFormData) => workoutsApi.createWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts-stats'] });
      navigate('/workouts');
    },
    onError: (error: any) => {
      alert(`Ошибка при создании тренировки: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleSubmit = (data: CreateWorkoutFormData) => {
    createMutation.mutate(data);
  };

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/workouts')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к тренировкам
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Создать тренировку</h1>
          <p className="text-gray-600 mt-2">Добавьте новую тренировку в ваш план</p>
        </div>

        {/* Form */}
        <WorkoutForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </div>
  );
};
