// API
export { goalsApi } from './api';
export type { GetGoalsParams } from './api';

// Model
export { useGoalsStore } from './model';
export type {
  Goal,
  GoalType,
  GoalStatus,
  CreateGoalData,
  UpdateGoalData,
  GoalStats,
  GoalsListResponse,
} from './model';

// UI Components
export { GoalCard, GoalForm, GoalStats } from './ui';

// Validation
export { createGoalSchema, updateGoalSchema } from './lib/validation';
export type { CreateGoalFormData, UpdateGoalFormData } from './lib/validation';
