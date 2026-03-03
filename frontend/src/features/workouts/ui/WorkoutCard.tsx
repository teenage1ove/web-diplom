import { Card } from '@/shared/ui';
import type { Workout } from '../model/types';
import { Calendar, Clock, Flame, TrendingUp } from 'lucide-react';

interface WorkoutCardProps {
  workout: Workout;
  onView?: (workout: Workout) => void;
  onEdit?: (workout: Workout) => void;
  onDelete?: (workoutId: number) => void;
  onComplete?: (workout: Workout) => void;
}

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

export const WorkoutCard = ({ workout, onView, onEdit, onDelete, onComplete }: WorkoutCardProps) => {
  const scheduledDate = workout.scheduledDate
    ? new Date(workout.scheduledDate).toLocaleDateString('ru-RU')
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{workout.title}</h3>
            {workout.goal && (
              <p className="text-sm text-gray-500">Цель: {workout.goal.title}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[workout.status]}`}>
            {statusLabels[workout.status]}
          </span>
        </div>

        {/* Description */}
        {workout.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workout.description}</p>
        )}

        {/* Exercises Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Упражнений: <span className="font-semibold">{workout.workoutExercises.length}</span>
          </p>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{scheduledDate}</span>
            </div>
          )}
          {workout.durationMinutes && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{workout.durationMinutes} мин</span>
            </div>
          )}
          {workout.caloriesBurned && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Flame className="w-4 h-4" />
              <span>{workout.caloriesBurned} ккал</span>
            </div>
          )}
          {workout.intensity && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span className="capitalize">{workout.intensity}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {onView && (
            <button
              onClick={() => onView(workout)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Посмотреть
            </button>
          )}
          {onComplete && workout.status !== 'completed' && (
            <button
              onClick={() => onComplete(workout)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Завершить
            </button>
          )}
          {onEdit && workout.status !== 'completed' && (
            <button
              onClick={() => onEdit(workout)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Редактировать
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите удалить эту тренировку?')) {
                  onDelete(workout.id);
                }
              }}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
