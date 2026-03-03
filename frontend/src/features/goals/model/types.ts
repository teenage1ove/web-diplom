// Types for Goals feature
export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: number;
  userId: number;
  goalType: GoalType;
  title: string;
  description: string | null;
  targetValue: string | null;
  currentValue: string | null;
  unit: string | null;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  progressPercentage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  goalType: GoalType;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  targetDate: string;
}

export interface UpdateGoalData {
  goalType?: GoalType;
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate?: string;
  targetDate?: string;
  status?: GoalStatus;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  abandoned: number;
  completionRate: string;
}

export interface GoalsListResponse {
  goals: Goal[];
  total: number;
  page: number;
  limit: number;
}
