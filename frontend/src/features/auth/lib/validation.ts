import { z } from 'zod';

// Схема валидации для логина
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный email адрес'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(8, 'Пароль должен содержать минимум 8 символов'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Схема валидации для регистрации
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email обязателен')
      .email('Некорректный email адрес'),
    password: z
      .string()
      .min(1, 'Пароль обязателен')
      .min(8, 'Пароль должен содержать минимум 8 символов')
      .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
      .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
      .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z
      .string()
      .min(1, 'Подтверждение пароля обязательно'),
    firstName: z
      .string()
      .min(1, 'Имя обязательно')
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(50, 'Имя должно содержать максимум 50 символов'),
    lastName: z
      .string()
      .min(1, 'Фамилия обязательна')
      .min(2, 'Фамилия должна содержать минимум 2 символа')
      .max(50, 'Фамилия должна содержать максимум 50 символов'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
