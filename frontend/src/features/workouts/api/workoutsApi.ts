import { axiosInstance } from '@/shared/lib/axios/axiosInstance';
import type {
  Workout,
  CreateWorkoutData,
  UpdateWorkoutData,
  CompleteWorkoutData,
  WorkoutStats,
  WorkoutsListResponse,
  WorkoutType,
  WorkoutStatus,
  Intensity,
} from '../model/types';

const WORKOUTS_BASE_URL = '/workouts';

export interface GetWorkoutsParams {
  page?: number;
  limit?: number;
  goalId?: number;
  workoutType?: WorkoutType;
  status?: WorkoutStatus;
  intensity?: Intensity;
  startDate?: string;
  endDate?: string;
}

export const workoutsApi = {
  /**
   * Get all user workouts with optional filters
   */
  async getWorkouts(params?: GetWorkoutsParams): Promise<WorkoutsListResponse> {
    const response = await axiosInstance.get<WorkoutsListResponse>(WORKOUTS_BASE_URL, {
      params,
    });
    return response.data;
  },

  /**
   * Get workout by ID
   */
  async getWorkoutById(workoutId: number): Promise<Workout> {
    const response = await axiosInstance.get<{ workout: Workout }>(
      `${WORKOUTS_BASE_URL}/${workoutId}`
    );
    return response.data.workout;
  },

  /**
   * Get workouts statistics
   */
  async getWorkoutStats(): Promise<WorkoutStats> {
    const response = await axiosInstance.get<WorkoutStats>(`${WORKOUTS_BASE_URL}/stats`);
    return response.data;
  },

  /**
   * Create new workout
   */
  async createWorkout(data: CreateWorkoutData): Promise<Workout> {
    const response = await axiosInstance.post<{ message: string; workout: Workout }>(
      WORKOUTS_BASE_URL,
      data
    );
    return response.data.workout;
  },

  /**
   * Update workout
   */
  async updateWorkout(workoutId: number, data: UpdateWorkoutData): Promise<Workout> {
    const response = await axiosInstance.put<{ message: string; workout: Workout }>(
      `${WORKOUTS_BASE_URL}/${workoutId}`,
      data
    );
    return response.data.workout;
  },

  /**
   * Complete workout
   */
  async completeWorkout(workoutId: number, data: CompleteWorkoutData): Promise<Workout> {
    const response = await axiosInstance.patch<{ message: string; workout: Workout }>(
      `${WORKOUTS_BASE_URL}/${workoutId}/complete`,
      data
    );
    return response.data.workout;
  },

  /**
   * Delete workout
   */
  async deleteWorkout(workoutId: number): Promise<void> {
    await axiosInstance.delete(`${WORKOUTS_BASE_URL}/${workoutId}`);
  },
};
