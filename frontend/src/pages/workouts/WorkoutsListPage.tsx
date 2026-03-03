import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi, type GetWorkoutsParams } from '@/features/workouts';
import { WorkoutCard, CompleteWorkoutModal, type CompleteWorkoutData } from '@/features/workouts';
import { Button } from '@/shared/ui';
import type { Workout, WorkoutStatus } from '@/features/workouts';

export const WorkoutsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [completingWorkout, setCompletingWorkout] = useState<Workout | null>(null);

  const [filters, setFilters] = useState<GetWorkoutsParams>({
    page: 1,
    limit: 10,
  });

  // Fetch workouts
  const { data: workoutsData, isLoading } = useQuery({
    queryKey: ['workouts', filters],
    queryFn: () => workoutsApi.getWorkouts(filters),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['workouts-stats'],
    queryFn: () => workoutsApi.getWorkoutStats(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (workoutId: number) => workoutsApi.deleteWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts-stats'] });
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: ({ workoutId, data }: { workoutId: number; data: CompleteWorkoutData }) =>
      workoutsApi.completeWorkout(workoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts-stats'] });
      setCompletingWorkout(null);
    },
  });

  const handleStatusFilter = (status: WorkoutStatus | 'all') => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }));
  };

  const handleCompleteWorkout = (data: CompleteWorkoutData) => {
    if (completingWorkout) {
      completeMutation.mutate({ workoutId: completingWorkout.id, data });
    }
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои тренировки</h1>
            <p className="text-gray-600 mt-2">Планируйте и отслеживайте ваши тренировки</p>
          </div>
          <Button onClick={() => navigate('/workouts/new')}>+ Создать тренировку</Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Всего', value: stats.total, color: 'text-blue-600' },
              { label: 'Запланировано', value: stats.planned, color: 'text-blue-600' },
              { label: 'В процессе', value: stats.inProgress, color: 'text-yellow-600' },
              { label: 'Завершено', value: stats.completed, color: 'text-green-600' },
              { label: 'Процент', value: `${stats.completionRate}%`, color: 'text-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'planned', 'in_progress', 'completed', 'skipped'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status as WorkoutStatus | 'all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (status === 'all' && !filters.status) || filters.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' && 'Все'}
                {status === 'planned' && 'Запланировано'}
                {status === 'in_progress' && 'В процессе'}
                {status === 'completed' && 'Завершено'}
                {status === 'skipped' && 'Пропущено'}
              </button>
            ))}
          </div>
        </div>

        {/* Workouts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка тренировок...</p>
          </div>
        ) : workoutsData && workoutsData.workouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutsData.workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onView={(w) => navigate(`/workouts/${w.id}`)}
                onEdit={(w) => navigate(`/workouts/${w.id}/edit`)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(w) => setCompletingWorkout(w)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет тренировок</h3>
            <p className="mt-1 text-sm text-gray-500">Создайте вашу первую тренировку</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/workouts/new')}>+ Создать тренировку</Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {workoutsData && workoutsData.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
              disabled={filters.page === 1}
            >
              Назад
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Страница {filters.page} из {workoutsData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              disabled={filters.page! >= workoutsData.totalPages}
            >
              Вперед
            </Button>
          </div>
        )}

        {/* Complete Workout Modal */}
        {completingWorkout && (
          <CompleteWorkoutModal
            workout={completingWorkout}
            onComplete={handleCompleteWorkout}
            onClose={() => setCompletingWorkout(null)}
            isLoading={completeMutation.isPending}
          />
        )}
      </div>
  );
};
