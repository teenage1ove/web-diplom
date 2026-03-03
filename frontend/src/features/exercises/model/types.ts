// Exercises feature types
export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'balance' | 'sports';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  difficulty: Difficulty | null;
  instructions: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  isCustom: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateExerciseData {
  name: string;
  description?: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  difficulty?: Difficulty | null;
  instructions?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  isCustom?: boolean;
}

export interface UpdateExerciseData {
  name?: string;
  description?: string | null;
  category?: ExerciseCategory;
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: Difficulty | null;
  instructions?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
}

export interface ExercisesListResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
