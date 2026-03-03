import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi, WorkoutForm, type CreateWorkoutFormData } from '@/features/workouts';
import { ArrowLeft } from 'lucide-react';

export const EditWorkoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const workoutId = Number(id);

  // Fetch workout data
  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => workoutsApi.getWorkoutById(workoutId),
    enabled: !!workoutId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateWorkoutFormData) => workoutsApi.updateWorkout(workoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts-stats'] });
      navigate('/workouts');
    },
    onError: (error: any) => {
      alert(`Ошибка при обновлении тренировки: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleSubmit = (data: CreateWorkoutFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
          <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        </div>
      );
  }

  if (!workout) {
    return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Тренировка не найдена</h2>
            <button
              onClick={() => navigate('/workouts')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Вернуться к списку тренировок
            </button>
          </div>
        </div>
      );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Редактировать тренировку</h1>
          <p className="text-gray-600 mt-2">Измените параметры тренировки</p>
        </div>

        {/* Form */}
        <WorkoutForm
          workout={workout}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </div>
  );
};
