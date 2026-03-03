import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    goalType: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'], {
      required_error: 'Goal type is required',
    }),
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title is required')
      .max(200, 'Title is too long')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description is too long')
      .trim()
      .optional()
      .nullable(),
    targetValue: z
      .number()
      .min(0, 'Target value must be positive')
      .optional()
      .nullable(),
    currentValue: z
      .number()
      .min(0, 'Current value must be positive')
      .optional()
      .nullable(),
    unit: z
      .string()
      .max(50, 'Unit is too long')
      .trim()
      .optional()
      .nullable(),
    startDate: z.string({ required_error: 'Start date is required' }),
    targetDate: z.string({ required_error: 'Target date is required' }),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    goalType: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']).optional(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title is too long')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description is too long')
      .trim()
      .optional()
      .nullable(),
    targetValue: z
      .number()
      .min(0, 'Target value must be positive')
      .optional()
      .nullable(),
    currentValue: z
      .number()
      .min(0, 'Current value must be positive')
      .optional()
      .nullable(),
    unit: z
      .string()
      .max(50, 'Unit is too long')
      .trim()
      .optional()
      .nullable(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
  }),
});

export const updateProgressSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    currentValue: z
      .number({ required_error: 'Current value is required' })
      .min(0, 'Current value must be positive'),
  }),
});

export const getGoalByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const getGoalsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
    goalType: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']).optional(),
  }),
});
