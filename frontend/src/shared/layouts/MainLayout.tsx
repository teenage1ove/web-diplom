import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@features/auth';
import { Button } from '@shared/ui';
import { LogOut, Home, Target, Dumbbell, Apple, Users, MessageSquare, Sparkles, User } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Главная', icon: Home },
    { path: '/goals', label: 'Цели', icon: Target },
    { path: '/workouts', label: 'Тренировки', icon: Dumbbell },
    { path: '/nutrition', label: 'Питание', icon: Apple },
    { path: '/consultations', label: 'Консультации', icon: Users },
    { path: '/chat', label: 'Чат', icon: MessageSquare },
    { path: '/ai', label: 'AI', icon: Sparkles },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Фитнес Платформа</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => !item.disabled && navigate(item.path)}
                    disabled={item.disabled}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.disabled && <span className="text-xs">(скоро)</span>}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => navigate('/profile')}
                  className="hidden sm:block text-right hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 pt-2">
            <div className="flex flex-wrap gap-2">
              {navItems.filter(i => !i.disabled).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => !item.disabled && navigate(item.path)}
                    disabled={item.disabled}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
              {user && (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Профиль</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
