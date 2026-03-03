import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Dumbbell } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '@shared/ui';
import { useAuthStore } from '@features/auth';
import { ProfileEditForm, ChangePasswordForm, TrainerRegistrationForm } from '@features/profile';

type Tab = 'profile' | 'password' | 'trainer';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    // Пока используем простую проверку
    setIsTrainer(false);
  }, []);

  if (isInitializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Профиль', icon: User },
    { id: 'password' as Tab, label: 'Пароль', icon: Lock },
    { id: 'trainer' as Tab, label: 'Тренер', icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Настройки профиля</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* User Info Header */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
              {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              {!user.emailVerified && (
                <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                  Email не подтверждён
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Личные данные"
              description="Обновите информацию о себе"
            />
            <CardContent>
              <ProfileEditForm user={user} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Смена пароля"
              description="Обновите пароль для вашего аккаунта"
            />
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}

        {activeTab === 'trainer' && (
          <Card variant="elevated" padding="lg">
            <CardHeader
              title={isTrainer ? 'Профиль тренера' : 'Стать тренером'}
              description={
                isTrainer
                  ? 'Управляйте своим профилем тренера'
                  : 'Зарегистрируйтесь как тренер и начните принимать клиентов'
              }
            />
            <CardContent>
              {isTrainer ? (
                <div className="rounded-lg bg-green-50 p-4 text-green-800">
                  <p className="font-medium">Вы зарегистрированы как тренер</p>
                </div>
              ) : (
                <TrainerRegistrationForm onSuccess={() => setIsTrainer(true)} />
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
