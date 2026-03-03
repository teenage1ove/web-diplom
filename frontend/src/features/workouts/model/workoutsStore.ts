import { create } from 'zustand';
import type { Workout, WorkoutStats } from './types';

interface WorkoutsState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  stats: WorkoutStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setWorkouts: (workouts: Workout[]) => void;
  setCurrentWorkout: (workout: Workout | null) => void;
  setStats: (stats: WorkoutStats) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkoutInList: (workoutId: number, updatedWorkout: Workout) => void;
  removeWorkout: (workoutId: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  workouts: [],
  currentWorkout: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const useWorkoutsStore = create<WorkoutsState>((set) => ({
  ...initialState,

  setWorkouts: (workouts) => set({ workouts, error: null }),

  setCurrentWorkout: (workout) => set({ currentWorkout: workout }),

  setStats: (stats) => set({ stats, error: null }),

  addWorkout: (workout) =>
    set((state) => ({
      workouts: [workout, ...state.workouts],
      error: null,
    })),

  updateWorkoutInList: (workoutId, updatedWorkout) =>
    set((state) => ({
      workouts: state.workouts.map((workout) =>
        workout.id === workoutId ? updatedWorkout : workout
      ),
      currentWorkout:
        state.currentWorkout?.id === workoutId ? updatedWorkout : state.currentWorkout,
      error: null,
    })),

  removeWorkout: (workoutId) =>
    set((state) => ({
      workouts: state.workouts.filter((workout) => workout.id !== workoutId),
      currentWorkout: state.currentWorkout?.id === workoutId ? null : state.currentWorkout,
      error: null,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
