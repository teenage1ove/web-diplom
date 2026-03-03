import React from 'react';
import { useAuthStore } from '@features/auth';
import { Button, Card, CardHeader, CardContent } from '@shared/ui';
import { Target, Dumbbell, Apple, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card variant="elevated" padding="lg" className="md:col-span-2">
            <CardHeader
              title={`Добро пожаловать, ${user?.firstName} ${user?.lastName}!`}
              description="Начните свой путь к достижению фитнес-целей"
            />
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800">
                  <p className="font-medium">✨ Платформа готова к использованию!</p>
                  <p className="mt-1 text-sm">
                    Создайте свою первую цель и начните отслеживать прогресс. AI-помощник поможет вам составить персональный план тренировок и питания.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="Статистика" description="Ваш прогресс" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Активных целей</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Тренировок за неделю</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Консультаций</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" padding="lg" className="md:col-span-2 lg:col-span-3">
            <CardHeader
              title="Быстрые действия"
              description="Начните с создания своей первой цели или запланируйте тренировку"
            />
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/goals/new')}
                  className="flex items-center justify-center gap-2"
                >
                  <Target className="h-5 w-5" />
                  Создать цель
                </Button>
                <Button variant="primary" fullWidth disabled className="flex items-center justify-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Новая тренировка
                </Button>
                <Button variant="primary" fullWidth disabled className="flex items-center justify-center gap-2">
                  <Apple className="h-5 w-5" />
                  План питания
                </Button>
                <Button variant="primary" fullWidth disabled className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  Найти тренера
                </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                * Некоторые функции пока в разработке
              </p>
            </CardContent>
          </Card>

          {/* Goals Preview */}
          <Card variant="elevated" padding="lg" className="md:col-span-2 lg:col-span-2">
            <CardHeader title="Ваши цели" description="Отслеживайте прогресс" />
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">У вас есть активные цели!</p>
                <Button variant="outline" onClick={() => navigate('/goals')}>
                  Посмотреть все цели
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="💡 Совет дня" />
            <CardContent>
              <p className="text-sm text-gray-700">
                Начните с небольших целей! Постепенное улучшение приводит к долгосрочным результатам. Создайте свою первую цель прямо сейчас.
              </p>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                className="mt-4"
                onClick={() => navigate('/goals/new')}
              >
                Создать первую цель
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
  );
};

export default DashboardPage;
