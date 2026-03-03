import { z } from 'zod';

const workoutExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.number().int().positive().optional().nullable(),
  reps: z.number().int().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  durationSeconds: z.number().int().positive().optional().nullable(),
  distanceMeters: z.number().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  orderIndex: z.number().int().min(0),
});

export const createWorkoutSchema = z.object({
  body: z.object({
    goalId: z.number().int().positive().optional().nullable(),
    title: z.string().min(2, 'Title must be at least 2 characters').max(200),
    description: z.string().max(1000).optional().nullable(),
    workoutType: z.enum(['cardio', 'strength', 'flexibility', 'mixed']).optional().nullable(),
    scheduledDate: z.string().datetime().optional().nullable(),
    durationMinutes: z.number().int().positive().max(600).optional().nullable(),
    intensity: z.enum(['low', 'medium', 'high']).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    exercises: z.array(workoutExerciseSchema).min(1, 'At least one exercise is required'),
  }),
});

export const updateWorkoutSchema = z.object({
  body: z.object({
    goalId: z.number().int().positive().optional().nullable(),
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    workoutType: z.enum(['cardio', 'strength', 'flexibility', 'mixed']).optional().nullable(),
    scheduledDate: z.string().datetime().optional().nullable(),
    durationMinutes: z.number().int().positive().max(600).optional().nullable(),
    caloriesBurned: z.number().int().positive().max(10000).optional().nullable(),
    intensity: z.enum(['low', 'medium', 'high']).optional().nullable(),
    status: z.enum(['planned', 'in_progress', 'completed', 'skipped']).optional(),
    notes: z.string().max(1000).optional().nullable(),
    exercises: z.array(workoutExerciseSchema).min(1).optional(),
  }),
});

export const completeWorkoutSchema = z.object({
  body: z.object({
    durationMinutes: z.number().int().positive().max(600).optional(),
    caloriesBurned: z.number().int().positive().max(10000).optional(),
    notes: z.string().max(1000).optional(),
  }),
});
