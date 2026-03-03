import { create } from 'zustand';
import type { Goal, GoalStats } from './types';

interface GoalsState {
  goals: Goal[];
  currentGoal: Goal | null;
  stats: GoalStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGoals: (goals: Goal[]) => void;
  setCurrentGoal: (goal: Goal | null) => void;
  setStats: (stats: GoalStats) => void;
  addGoal: (goal: Goal) => void;
  updateGoalInList: (goalId: number, updatedGoal: Goal) => void;
  removeGoal: (goalId: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  goals: [],
  currentGoal: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const useGoalsStore = create<GoalsState>((set) => ({
  ...initialState,

  setGoals: (goals) => set({ goals, error: null }),

  setCurrentGoal: (goal) => set({ currentGoal: goal }),

  setStats: (stats) => set({ stats, error: null }),

  addGoal: (goal) =>
    set((state) => ({
      goals: [goal, ...state.goals],
      error: null,
    })),

  updateGoalInList: (goalId, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((goal) => (goal.id === goalId ? updatedGoal : goal)),
      currentGoal: state.currentGoal?.id === goalId ? updatedGoal : state.currentGoal,
      error: null,
    })),

  removeGoal: (goalId) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== goalId),
      currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
      error: null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
