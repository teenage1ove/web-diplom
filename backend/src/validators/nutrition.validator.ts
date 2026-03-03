import { z } from 'zod';

export const createNutritionPlanSchema = z.object({
  body: z.object({
    goalId: z.number().int().positive().optional().nullable(),
    title: z.string().min(2, 'Title must be at least 2 characters').max(200),
    description: z.string().max(1000).optional().nullable(),
    dailyCaloriesTarget: z.number().int().positive().max(10000).optional().nullable(),
    proteinGramsTarget: z.number().positive().max(1000).optional().nullable(),
    carbsGramsTarget: z.number().positive().max(1000).optional().nullable(),
    fatsGramsTarget: z.number().positive().max(500).optional().nullable(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const updateNutritionPlanSchema = z.object({
  body: z.object({
    goalId: z.number().int().positive().optional().nullable(),
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    dailyCaloriesTarget: z.number().int().positive().max(10000).optional().nullable(),
    proteinGramsTarget: z.number().positive().max(1000).optional().nullable(),
    carbsGramsTarget: z.number().positive().max(1000).optional().nullable(),
    fatsGramsTarget: z.number().positive().max(500).optional().nullable(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createMealSchema = z.object({
  body: z.object({
    nutritionPlanId: z.number().int().positive(),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    calories: z.number().int().positive().max(10000).optional().nullable(),
    proteinGrams: z.number().positive().max(1000).optional().nullable(),
    carbsGrams: z.number().positive().max(1000).optional().nullable(),
    fatsGrams: z.number().positive().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateMealSchema = z.object({
  body: z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    calories: z.number().int().positive().max(10000).optional().nullable(),
    proteinGrams: z.number().positive().max(1000).optional().nullable(),
    carbsGrams: z.number().positive().max(1000).optional().nullable(),
    fatsGrams: z.number().positive().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});
