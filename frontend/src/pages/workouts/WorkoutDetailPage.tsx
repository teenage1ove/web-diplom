import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workoutsApi } from '@/features/workouts';
import { Card, Button } from '@/shared/ui';
import { ArrowLeft, Calendar, Clock, Flame, TrendingUp, Edit, Trash2, CheckCircle } from 'lucide-react';
import type { Workout } from '@/features/workouts';

const statusLabels: Record<Workout['status'], string> = {
  planned: 'Запланировано',
  in_progress: 'В процессе',
  completed: 'Завершено',
  skipped: 'Пропущено',
};

const statusColors: Record<Workout['status'], string> = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-gray-100 text-gray-800',
};

const typeLabels: Record<Workout['type'], string> = {
  cardio: 'Кардио',
  strength: 'Силовая',
  flexibility: 'Гибкость',
  sports: 'Спорт',
};

const intensityLabels: Record<NonNullable<Workout['intensity']>, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
};

export const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workoutId = Number(id);

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => workoutsApi.getWorkoutById(workoutId),
    enabled: !!workoutId,
  });

  if (isLoading) {
    return (
          <div className="flex h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        </div>
      );
  }

  if (!workout) {
    return (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  const scheduledDate = workout.scheduledDate
    ? new Date(workout.scheduledDate).toLocaleDateString('ru-RU')
    : null;

  return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/workouts')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к тренировкам
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workout.title}</h1>
              {workout.goal && (
                <p className="text-gray-600 mt-1">Цель: {workout.goal.title}</p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[workout.status]}`}>
              {statusLabels[workout.status]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {workout.status !== 'completed' && (
            <>
              <Button
                onClick={() => navigate(`/workouts/${workout.id}/edit`)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button
                onClick={() => alert('Завершить тренировку - в разработке')}
                variant="default"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Завершить
              </Button>
            </>
          )}
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Info Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Информация</h2>

              {workout.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Описание</h3>
                  <p className="text-gray-600">{workout.description}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Тип:</span>
                  <span className="font-medium">{typeLabels[workout.type]}</span>
                </div>

                {workout.intensity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Интенсивность:</span>
                    <span className="font-medium">{intensityLabels[workout.intensity]}</span>
                  </div>
                )}

                {scheduledDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Дата:
                    </span>
                    <span className="font-medium">{scheduledDate}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Stats Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Статистика</h2>

              <div className="space-y-3">
                {workout.durationMinutes && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Длительность:
                    </span>
                    <span className="font-medium">{workout.durationMinutes} мин</span>
                  </div>
                )}

                {workout.caloriesBurned && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Калории:
                    </span>
                    <span className="font-medium">{workout.caloriesBurned} ккал</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Упражнений:</span>
                  <span className="font-medium">{workout.workoutExercises.length}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Exercises List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Упражнения</h2>

            <div className="space-y-4">
              {workout.workoutExercises.map((workoutExercise, index) => (
                <div
                  key={workoutExercise.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {workoutExercise.exercise.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {workoutExercise.exercise.category} • {workoutExercise.exercise.difficulty}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {workoutExercise.exercise.description && (
                    <p className="text-sm text-gray-600 mb-3 ml-11">
                      {workoutExercise.exercise.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-11">
                    {workoutExercise.sets && (
                      <div>
                        <p className="text-xs text-gray-600">Подходы</p>
                        <p className="font-semibold">{workoutExercise.sets}</p>
                      </div>
                    )}
                    {workoutExercise.reps && (
                      <div>
                        <p className="text-xs text-gray-600">Повторения</p>
                        <p className="font-semibold">{workoutExercise.reps}</p>
                      </div>
                    )}
                    {workoutExercise.weight && (
                      <div>
                        <p className="text-xs text-gray-600">Вес</p>
                        <p className="font-semibold">{workoutExercise.weight} кг</p>
                      </div>
                    )}
                    {workoutExercise.duration && (
                      <div>
                        <p className="text-xs text-gray-600">Длительность</p>
                        <p className="font-semibold">{workoutExercise.duration} мин</p>
                      </div>
                    )}
                    {workoutExercise.distance && (
                      <div>
                        <p className="text-xs text-gray-600">Дистанция</p>
                        <p className="font-semibold">{workoutExercise.distance} км</p>
                      </div>
                    )}
                    {workoutExercise.rest && (
                      <div>
                        <p className="text-xs text-gray-600">Отдых</p>
                        <p className="font-semibold">{workoutExercise.rest} сек</p>
                      </div>
                    )}
                  </div>

                  {workoutExercise.notes && (
                    <div className="mt-3 ml-11">
                      <p className="text-xs text-gray-600">Заметки</p>
                      <p className="text-sm text-gray-800">{workoutExercise.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
  );
};
