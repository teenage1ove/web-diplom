import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .max(100, 'Имя слишком длинное'),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .max(100, 'Фамилия слишком длинная'),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  height: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
  weight: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
  phone: z.string().max(20, 'Номер слишком длинный').optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Текущий пароль обязателен'),
    newPassword: z
      .string()
      .min(8, 'Минимум 8 символов')
      .regex(/[A-Z]/, 'Нужна заглавная буква')
      .regex(/[a-z]/, 'Нужна строчная буква')
      .regex(/[0-9]/, 'Нужна цифра'),
    confirmPassword: z
      .string()
      .min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const trainerSchema = z.object({
  specialization: z
    .string()
    .min(1, 'Укажите специализации через запятую'),
  bio: z
    .string()
    .min(10, 'Минимум 10 символов')
    .max(2000, 'Максимум 2000 символов'),
  experienceYears: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val)),
  certifications: z.string().optional(),
  hourlyRate: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      return Number(val);
    }),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;
