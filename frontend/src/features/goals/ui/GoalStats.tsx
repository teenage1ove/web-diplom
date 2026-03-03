import { Card } from '@/shared/ui';
import type { GoalStats as GoalStatsType } from '../model/types';

interface GoalStatsProps {
  stats: GoalStatsType;
}

export const GoalStats = ({ stats }: GoalStatsProps) => {
  const completionRate = parseFloat(stats.completionRate);

  const statCards = [
    {
      label: 'Всего целей',
      value: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Активных',
      value: stats.active,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Завершено',
      value: stats.completed,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'На паузе',
      value: stats.paused,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        </Card>
      ))}

      {/* Completion Rate */}
      <Card className="hover:shadow-md transition-shadow">
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-1">Процент завершения</p>
          <p className="text-3xl font-bold text-indigo-600">{completionRate.toFixed(0)}%</p>
        </div>
      </Card>
    </div>
  );
};
