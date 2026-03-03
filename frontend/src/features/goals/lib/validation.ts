import { z } from 'zod';

export const createGoalSchema = z
  .object({
    goalType: z.enum([
      'weight_loss',
      'muscle_gain',
      'endurance',
      'flexibility',
      'general_fitness',
    ], {
      required_error: 'Пожалуйста, выберите тип цели',
    }),
    title: z
      .string()
      .min(3, 'Название должно содержать минимум 3 символа')
      .max(100, 'Название не должно превышать 100 символов'),
    description: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
    targetValue: z.number().positive('Целевое значение должно быть положительным').optional(),
    currentValue: z.number().min(0, 'Текущее значение не может быть отрицательным').optional(),
    unit: z.string().max(20, 'Единица измерения не должна превышать 20 символов').optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Неверный формат даты начала',
    }),
    targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Неверный формат целевой даты',
    }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const target = new Date(data.targetDate);
      return target > start;
    },
    {
      message: 'Целевая дата должна быть позже даты начала',
      path: ['targetDate'],
    }
  );

export const updateGoalSchema = z
  .object({
    goalType: z.enum([
      'weight_loss',
      'muscle_gain',
      'endurance',
      'flexibility',
      'general_fitness',
    ]).optional(),
    title: z
      .string()
      .min(3, 'Название должно содержать минимум 3 символа')
      .max(100, 'Название не должно превышать 100 символов')
      .optional(),
    description: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
    targetValue: z.number().positive('Целевое значение должно быть положительным').optional(),
    currentValue: z.number().min(0, 'Текущее значение не может быть отрицательным').optional(),
    unit: z.string().max(20, 'Единица измерения не должна превышать 20 символов').optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Неверный формат даты начала',
      })
      .optional(),
    targetDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Неверный формат целевой даты',
      })
      .optional(),
    status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.targetDate) {
        const start = new Date(data.startDate);
        const target = new Date(data.targetDate);
        return target > start;
      }
      return true;
    },
    {
      message: 'Целевая дата должна быть позже даты начала',
      path: ['targetDate'],
    }
  );

export const updateProgressSchema = z.object({
  currentValue: z.number().min(0, 'Текущее значение не может быть отрицательным'),
});

export type CreateGoalFormData = z.infer<typeof createGoalSchema>;
export type UpdateGoalFormData = z.infer<typeof updateGoalSchema>;
export type UpdateProgressFormData = z.infer<typeof updateProgressSchema>;
