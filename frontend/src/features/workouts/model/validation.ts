import { z } from 'zod';

export const workoutExerciseSchema = z.object({
  exerciseId: z.number(),
  sets: z.number().min(1, 'Минимум 1 подход').optional(),
  reps: z.number().min(1, 'Минимум 1 повторение').optional(),
  weight: z.number().min(0, 'Вес не может быть отрицательным').optional(),
  duration: z.number().min(1, 'Минимум 1 минута').optional(),
  distance: z.number().min(0.1, 'Минимум 0.1 км').optional(),
  rest: z.number().min(0, 'Отдых не может быть отрицательным').optional(),
  notes: z.string().optional(),
});

export const createWorkoutSchema = z.object({
  title: z.string().min(3, 'Название должно быть не менее 3 символов').max(100),
  description: z.string().optional(),
  goalId: z.number().optional(),
  type: z.enum(['cardio', 'strength', 'flexibility', 'sports']),
  intensity: z.enum(['low', 'medium', 'high']).optional(),
  scheduledDate: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).min(1, 'Добавьте хотя бы одно упражнение'),
});

export const updateWorkoutSchema = z.object({
  title: z.string().min(3, 'Название должно быть не менее 3 символов').max(100).optional(),
  description: z.string().optional(),
  goalId: z.number().optional(),
  type: z.enum(['cardio', 'strength', 'flexibility', 'sports']).optional(),
  intensity: z.enum(['low', 'medium', 'high']).optional(),
  scheduledDate: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped']).optional(),
});

export type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutFormData = z.infer<typeof updateWorkoutSchema>;
export type WorkoutExerciseFormData = z.infer<typeof workoutExerciseSchema>;
