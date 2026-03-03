import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { goalsApi, type GetGoalsParams } from '@/features/goals/api';
import { GoalCard, GoalStats, UpdateProgressModal } from '@/features/goals/ui';
import { Button } from '@/shared/ui';
import type { Goal, GoalStatus, GoalType } from '@/features/goals';

export const GoalsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<GetGoalsParams>({
    page: 1,
    limit: 10,
  });

  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null);

  // Fetch goals
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', filters],
    queryFn: () => goalsApi.getGoals(filters),
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['goals-stats'],
    queryFn: () => goalsApi.getGoalStats(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (goalId: number) => goalsApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] });
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ goalId, value }: { goalId: number; value: number }) =>
      goalsApi.updateProgress(goalId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals-stats'] });
      setSelectedGoalForProgress(null);
    },
  });

  const handleStatusFilter = (status: GoalStatus | 'all') => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }));
  };

  const handleTypeFilter = (type: GoalType | 'all') => {
    setFilters((prev) => ({
      ...prev,
      goalType: type === 'all' ? undefined : type,
      page: 1,
    }));
  };

  const handleUpdateProgress = (value: number) => {
    if (selectedGoalForProgress) {
      updateProgressMutation.mutate({
        goalId: selectedGoalForProgress.id,
        value,
      });
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои цели</h1>
            <p className="text-gray-600 mt-2">Отслеживайте свой прогресс и достигайте результатов</p>
          </div>
          <Button onClick={() => navigate('/goals/new')}>+ Создать цель</Button>
        </div>

        {/* Stats */}
        {stats && !statsLoading && (
          <div className="mb-8">
            <GoalStats stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'completed', 'paused', 'abandoned'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status as GoalStatus | 'all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (status === 'all' && !filters.status) || filters.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' && 'Все'}
                  {status === 'active' && 'Активные'}
                  {status === 'completed' && 'Завершенные'}
                  {status === 'paused' && 'На паузе'}
                  {status === 'abandoned' && 'Отмененные'}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип цели</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type as GoalType | 'all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (type === 'all' && !filters.goalType) || filters.goalType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' && 'Все'}
                    {type === 'weight_loss' && 'Снижение веса'}
                    {type === 'muscle_gain' && 'Набор массы'}
                    {type === 'endurance' && 'Выносливость'}
                    {type === 'flexibility' && 'Гибкость'}
                    {type === 'general_fitness' && 'Общая форма'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {goalsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка целей...</p>
          </div>
        ) : goalsData && goalsData.goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalsData.goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={(goal) => navigate(`/goals/${goal.id}/edit`)}
                onDelete={(goalId) => deleteMutation.mutate(goalId)}
                onUpdateProgress={(goal) => setSelectedGoalForProgress(goal)}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет целей</h3>
            <p className="mt-1 text-sm text-gray-500">Начните с создания вашей первой цели</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/goals/new')}>+ Создать первую цель</Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {goalsData && goalsData.total > filters.limit! && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
              disabled={filters.page === 1}
            >
              Назад
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Страница {filters.page} из {Math.ceil(goalsData.total / filters.limit!)}
            </span>
            <Button
              variant="outline"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              disabled={filters.page! * filters.limit! >= goalsData.total}
            >
              Вперед
            </Button>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {selectedGoalForProgress && (
        <UpdateProgressModal
          goal={selectedGoalForProgress}
          onSubmit={handleUpdateProgress}
          onClose={() => setSelectedGoalForProgress(null)}
          isSubmitting={updateProgressMutation.isPending}
        />
      )}
    </>
  );
};
