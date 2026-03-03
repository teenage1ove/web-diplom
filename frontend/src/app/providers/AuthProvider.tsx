import React, { useEffect } from 'react';
import { useAuthStore } from '@features/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Показываем loader только при начальной проверке авторизации
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
