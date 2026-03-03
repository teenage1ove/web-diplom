import { z } from 'zod';

export const nutritionPlanSchema = z.object({
  title: z.string().min(2, 'Название должно содержать минимум 2 символа').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  goalId: z.number().int().positive().optional().nullable(),
  dailyCaloriesTarget: z
    .number()
    .int()
    .positive('Калории должны быть положительным числом')
    .max(10000)
    .optional()
    .nullable(),
  proteinGramsTarget: z
    .number()
    .positive('Белки должны быть положительным числом')
    .max(1000)
    .optional()
    .nullable(),
  carbsGramsTarget: z
    .number()
    .positive('Углеводы должны быть положительным числом')
    .max(1000)
    .optional()
    .nullable(),
  fatsGramsTarget: z
    .number()
    .positive('Жиры должны быть положительным числом')
    .max(500)
    .optional()
    .nullable(),
  startDate: z.string().min(1, 'Дата начала обязательна'),
  endDate: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type NutritionPlanFormData = z.infer<typeof nutritionPlanSchema>;

export const mealSchema = z.object({
  nutritionPlanId: z.number().int().positive('Выберите план питания'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    required_error: 'Выберите тип приёма пищи',
  }),
  date: z.string().min(1, 'Дата обязательна'),
  title: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  calories: z
    .number()
    .int()
    .positive('Калории должны быть положительным числом')
    .max(10000)
    .optional()
    .nullable(),
  proteinGrams: z
    .number()
    .positive('Белки должны быть положительным числом')
    .max(1000)
    .optional()
    .nullable(),
  carbsGrams: z
    .number()
    .positive('Углеводы должны быть положительным числом')
    .max(1000)
    .optional()
    .nullable(),
  fatsGrams: z
    .number()
    .positive('Жиры должны быть положительным числом')
    .max(500)
    .optional()
    .nullable(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type MealFormData = z.infer<typeof mealSchema>;
