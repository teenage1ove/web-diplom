import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Card } from '@/shared/ui';
import { goalsApi } from '@/features/goals';
import { exercisesApi } from '@/features/exercises';
import { ExerciseBrowser } from '@/features/exercises';
import type { Exercise } from '@/features/exercises';
import type { Workout } from '../model/types';
import { createWorkoutSchema, type CreateWorkoutFormData, type WorkoutExerciseFormData } from '../model/validation';
import { X, Plus } from 'lucide-react';

interface WorkoutFormProps {
  workout?: Workout;
  onSubmit: (data: CreateWorkoutFormData) => void;
  isLoading?: boolean;
}

const workoutTypeLabels = {
  cardio: 'Кардио',
  strength: 'Силовая',
  flexibility: 'Гибкость',
  sports: 'Спорт',
};

const intensityLabels = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
};

export const WorkoutForm = ({ workout, onSubmit, isLoading }: WorkoutFormProps) => {
  const [showExerciseBrowser, setShowExerciseBrowser] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Array<Exercise & WorkoutExerciseFormData>>(
    workout?.workoutExercises.map(we => ({
      ...we.exercise,
      exerciseId: we.exercise.id,
      sets: we.sets || undefined,
      reps: we.reps || undefined,
      weight: we.weight || undefined,
      duration: we.duration || undefined,
      distance: we.distance || undefined,
      rest: we.rest || undefined,
      notes: we.notes || undefined,
    })) || []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      title: workout?.title || '',
      description: workout?.description || '',
      goalId: workout?.goalId || undefined,
      type: workout?.type || 'strength',
      intensity: workout?.intensity || 'medium',
      scheduledDate: workout?.scheduledDate
        ? new Date(workout.scheduledDate).toISOString().split('T')[0]
        : '',
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        duration: ex.duration,
        distance: ex.distance,
        rest: ex.rest,
        notes: ex.notes,
      })),
    },
  });

  // Fetch user goals for dropdown
  const { data: goalsData } = useQuery({
    queryKey: ['goals', { status: 'active' }],
    queryFn: () => goalsApi.getGoals({ status: 'active' }),
  });

  const handleExerciseSelect = (exercises: Exercise[]) => {
    const newExercises = exercises.map(ex => {
      const existing = selectedExercises.find(sel => sel.id === ex.id);
      return existing || {
        ...ex,
        exerciseId: ex.id,
        sets: undefined,
        reps: undefined,
        weight: undefined,
        duration: undefined,
        distance: undefined,
        rest: undefined,
        notes: undefined,
      };
    });
    setSelectedExercises(newExercises);
    setValue('exercises', newExercises.map(ex => ({
      exerciseId: ex.id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: ex.duration,
      distance: ex.distance,
      rest: ex.rest,
      notes: ex.notes,
    })));
    setShowExerciseBrowser(false);
  };

  const handleRemoveExercise = (exerciseId: number) => {
    const newExercises = selectedExercises.filter(ex => ex.id !== exerciseId);
    setSelectedExercises(newExercises);
    setValue('exercises', newExercises.map(ex => ({
      exerciseId: ex.id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: ex.duration,
      distance: ex.distance,
      rest: ex.rest,
      notes: ex.notes,
    })));
  };

  const updateExerciseParam = (exerciseId: number, param: keyof WorkoutExerciseFormData, value: any) => {
    const newExercises = selectedExercises.map(ex =>
      ex.id === exerciseId ? { ...ex, [param]: value || undefined } : ex
    );
    setSelectedExercises(newExercises);
    setValue('exercises', newExercises.map(ex => ({
      exerciseId: ex.id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: ex.duration,
      distance: ex.distance,
      rest: ex.rest,
      notes: ex.notes,
    })));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Основная информация</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название тренировки *
            </label>
            <Input {...register('title')} placeholder="Например: Утренняя пробежка" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Опишите тренировку..."
            />
          </div>
        </div>
      </Card>

      {/* Workout Parameters */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Параметры</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цель</label>
              <select
                {...register('goalId', { setValueAs: v => v === '' ? undefined : Number(v) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Без цели</option>
                {goalsData?.goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип тренировки *</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(workoutTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Интенсивность</label>
              <select
                {...register('intensity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(intensityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <Input type="date" {...register('scheduledDate')} />
            </div>
          </div>
        </div>
      </Card>

      {/* Exercises */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Упражнения</h2>
            <Button type="button" onClick={() => setShowExerciseBrowser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить упражнения
            </Button>
          </div>

          {errors.exercises && typeof errors.exercises.message === 'string' && (
            <p className="text-red-500 text-sm">{errors.exercises.message}</p>
          )}

          {selectedExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Упражнения не добавлены</p>
              <p className="text-sm mt-1">Нажмите "Добавить упражнения" для выбора</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => (
                <Card key={exercise.id} className="bg-gray-50">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">{exercise.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Подходы</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'sets', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="3"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Повторения</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'reps', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Вес (кг)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Отдых (сек)</label>
                        <input
                          type="number"
                          min="0"
                          value={exercise.rest || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'rest', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Длительность (мин)</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.duration || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'duration', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Дистанция (км)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={exercise.distance || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'distance', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Заметки</label>
                        <input
                          type="text"
                          value={exercise.notes || ''}
                          onChange={(e) => updateExerciseParam(exercise.id, 'notes', e.target.value || undefined)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Дополнительные заметки..."
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : workout ? 'Сохранить изменения' : 'Создать тренировку'}
        </Button>
      </div>

      {/* Exercise Browser Modal */}
      {showExerciseBrowser && (
        <ExerciseBrowser
          onSelect={handleExerciseSelect}
          onClose={() => setShowExerciseBrowser(false)}
          selectedExercises={selectedExercises}
        />
      )}
    </form>
  );
};
