import { Card } from '@/shared/ui';
import type { Goal } from '../model/types';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onUpdateProgress?: (goal: Goal) => void;
}

const goalTypeLabels: Record<Goal['goalType'], string> = {
  weight_loss: 'Снижение веса',
  muscle_gain: 'Набор мышечной массы',
  endurance: 'Выносливость',
  flexibility: 'Гибкость',
  general_fitness: 'Общая физическая форма',
};

const statusLabels: Record<Goal['status'], string> = {
  active: 'Активная',
  completed: 'Завершена',
  paused: 'На паузе',
  abandoned: 'Отменена',
};

const statusColors: Record<Goal['status'], string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  abandoned: 'bg-gray-100 text-gray-800',
};

export const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) => {
  const progress = parseFloat(goal.progressPercentage);
  const startDate = new Date(goal.startDate).toLocaleDateString('ru-RU');
  const targetDate = new Date(goal.targetDate).toLocaleDateString('ru-RU');

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{goal.title}</h3>
            <p className="text-sm text-gray-500">{goalTypeLabels[goal.goalType]}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]}`}
          >
            {statusLabels[goal.status]}
          </span>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Target Info */}
        {goal.targetValue && goal.unit && (
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-gray-500">Текущее</p>
              <p className="font-semibold text-gray-900">
                {goal.currentValue || '0'} {goal.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Цель</p>
              <p className="font-semibold text-gray-900">
                {goal.targetValue} {goal.unit}
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Начало: {startDate}</span>
          <span>Цель: {targetDate}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {onUpdateProgress && goal.status === 'active' && (
            <button
              onClick={() => onUpdateProgress(goal)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Обновить прогресс
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Редактировать
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите удалить эту цель?')) {
                  onDelete(goal.id);
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
