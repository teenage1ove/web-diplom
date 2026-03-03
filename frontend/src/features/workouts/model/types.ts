// Workouts feature types
export type WorkoutType = 'cardio' | 'strength' | 'flexibility' | 'mixed';
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';
export type Intensity = 'low' | 'medium' | 'high';

export interface WorkoutExercise {
  id: number;
  sets: number | null;
  reps: number | null;
  weight: string | null;
  durationSeconds: number | null;
  distanceMeters: string | null;
  notes: string | null;
  orderIndex: number;
  exercise: {
    id: number;
    name: string;
    category: string;
    muscleGroups: string[];
    equipment: string[];
    difficulty: string | null;
    imageUrl: string | null;
  };
}

export interface Workout {
  id: number;
  userId: number;
  goalId: number | null;
  title: string;
  description: string | null;
  workoutType: WorkoutType | null;
  scheduledDate: string | null;
  durationMinutes: number | null;
  caloriesBurned: number | null;
  intensity: Intensity | null;
  status: WorkoutStatus;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  goal: {
    id: number;
    title: string;
    goalType: string;
  } | null;
  workoutExercises: WorkoutExercise[];
}

export interface WorkoutExerciseInput {
  exerciseId: number;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  notes?: string | null;
  orderIndex: number;
}

export interface CreateWorkoutData {
  goalId?: number | null;
  title: string;
  description?: string | null;
  workoutType?: WorkoutType | null;
  scheduledDate?: string | null;
  durationMinutes?: number | null;
  intensity?: Intensity | null;
  notes?: string | null;
  exercises: WorkoutExerciseInput[];
}

export interface UpdateWorkoutData {
  goalId?: number | null;
  title?: string;
  description?: string | null;
  workoutType?: WorkoutType | null;
  scheduledDate?: string | null;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  intensity?: Intensity | null;
  status?: WorkoutStatus;
  notes?: string | null;
  exercises?: WorkoutExerciseInput[];
}

export interface CompleteWorkoutData {
  durationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface WorkoutStats {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  skipped: number;
  completionRate: string;
}

export interface WorkoutsListResponse {
  workouts: Workout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
