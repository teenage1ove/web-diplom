import { z } from 'zod';

export const createExerciseSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(1000).optional().nullable(),
    category: z.enum(['cardio', 'strength', 'flexibility', 'balance', 'sports']),
    muscleGroups: z.array(z.string()).min(1, 'At least one muscle group is required'),
    equipment: z.array(z.string()).min(1, 'At least one equipment item is required'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    instructions: z.string().max(5000).optional().nullable(),
    videoUrl: z.string().url().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    isCustom: z.boolean().optional(),
  }),
});

export const updateExerciseSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    category: z.enum(['cardio', 'strength', 'flexibility', 'balance', 'sports']).optional(),
    muscleGroups: z.array(z.string()).min(1).optional(),
    equipment: z.array(z.string()).min(1).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    instructions: z.string().max(5000).optional().nullable(),
    videoUrl: z.string().url().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
  }),
});
