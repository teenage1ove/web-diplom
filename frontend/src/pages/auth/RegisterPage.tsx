import React from 'react';
import { RegisterForm } from '@features/auth';
import { Card, CardHeader, CardContent } from '@shared/ui';

const RegisterPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Фитнес Платформа
          </h1>
          <p className="mt-2 text-gray-600">
            Начните свой путь к здоровью
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Регистрация"
            description="Создайте аккаунт для доступа ко всем функциям"
          />
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>© 2026 Фитнес Платформа. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
