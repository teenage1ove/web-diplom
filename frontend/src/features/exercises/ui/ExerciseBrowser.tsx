import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '../api/exercisesApi';
import { Button, Input } from '@/shared/ui';
import type { Exercise, ExerciseCategory } from '../model/types';
import { Search, X } from 'lucide-react';

interface ExerciseBrowserProps {
  onSelectExercise: (exercise: Exercise) => void;
  selectedExercises?: number[]; // IDs of already selected exercises
  onClose?: () => void;
}

const categoryLabels: Record<ExerciseCategory, string> = {
  cardio: 'Кардио',
  strength: 'Силовые',
  flexibility: 'Гибкость',
  balance: 'Баланс',
  sports: 'Спорт',
};

export const ExerciseBrowser = ({
  onSelectExercise,
  selectedExercises = [],
  onClose,
}: ExerciseBrowserProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data: exercisesData, isLoading } = useQuery({
    queryKey: ['exercises', { search, category: selectedCategory, page, limit: 20 }],
    queryFn: () =>
      exercisesApi.getExercises({
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page,
        limit: 20,
      }),
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Выбрать упражнение</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4 border-b bg-gray-50">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Поиск упражнений..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            Все
          </button>
          {(Object.keys(categoryLabels) as ExerciseCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : exercisesData && exercisesData.exercises.length > 0 ? (
          <div className="grid gap-3">
            {exercisesData.exercises.map((exercise) => {
              const isSelected = selectedExercises.includes(exercise.id);
              return (
                <button
                  key={exercise.id}
                  onClick={() => onSelectExercise(exercise)}
                  disabled={isSelected}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-white hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {exercise.name}
                        {isSelected && <span className="ml-2 text-xs text-gray-500">(добавлено)</span>}
                      </h3>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {exercise.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          {categoryLabels[exercise.category]}
                        </span>
                        {exercise.difficulty && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                            {exercise.difficulty}
                          </span>
                        )}
                        {exercise.muscleGroups.slice(0, 2).map((mg) => (
                          <span
                            key={mg}
                            className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {mg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Упражнения не найдены</p>
          </div>
        )}

        {/* Pagination */}
        {exercisesData && exercisesData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Назад
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {page} / {exercisesData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= exercisesData.totalPages}
            >
              Вперед
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
