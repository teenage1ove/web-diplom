import { axiosInstance } from '@/shared/lib/axios/axiosInstance';
import type {
  Exercise,
  CreateExerciseData,
  UpdateExerciseData,
  ExercisesListResponse,
  ExerciseCategory,
  Difficulty,
} from '../model/types';

const EXERCISES_BASE_URL = '/exercises';

export interface GetExercisesParams {
  page?: number;
  limit?: number;
  category?: ExerciseCategory;
  difficulty?: Difficulty;
  muscleGroups?: string[];
  equipment?: string[];
  search?: string;
  isCustom?: boolean;
  createdBy?: number;
}

export const exercisesApi = {
  /**
   * Get all exercises with optional filters
   */
  async getExercises(params?: GetExercisesParams): Promise<ExercisesListResponse> {
    // Convert arrays to comma-separated strings for query params
    const queryParams = {
      ...params,
      muscleGroups: params?.muscleGroups?.join(','),
      equipment: params?.equipment?.join(','),
    };

    const response = await axiosInstance.get<ExercisesListResponse>(EXERCISES_BASE_URL, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get exercise by ID
   */
  async getExerciseById(exerciseId: number): Promise<Exercise> {
    const response = await axiosInstance.get<{ exercise: Exercise }>(
      `${EXERCISES_BASE_URL}/${exerciseId}`
    );
    return response.data.exercise;
  },

  /**
   * Create new exercise
   */
  async createExercise(data: CreateExerciseData): Promise<Exercise> {
    const response = await axiosInstance.post<{ message: string; exercise: Exercise }>(
      EXERCISES_BASE_URL,
      data
    );
    return response.data.exercise;
  },

  /**
   * Update exercise
   */
  async updateExercise(exerciseId: number, data: UpdateExerciseData): Promise<Exercise> {
    const response = await axiosInstance.put<{ message: string; exercise: Exercise }>(
      `${EXERCISES_BASE_URL}/${exerciseId}`,
      data
    );
    return response.data.exercise;
  },

  /**
   * Delete exercise
   */
  async deleteExercise(exerciseId: number): Promise<void> {
    await axiosInstance.delete(`${EXERCISES_BASE_URL}/${exerciseId}`);
  },

  /**
   * Get exercise categories
   */
  async getCategories(): Promise<string[]> {
    const response = await axiosInstance.get<{ categories: string[] }>(
      `${EXERCISES_BASE_URL}/meta/categories`
    );
    return response.data.categories;
  },

  /**
   * Get muscle groups
   */
  async getMuscleGroups(): Promise<string[]> {
    const response = await axiosInstance.get<{ muscleGroups: string[] }>(
      `${EXERCISES_BASE_URL}/meta/muscle-groups`
    );
    return response.data.muscleGroups;
  },

  /**
   * Get equipment types
   */
  async getEquipment(): Promise<string[]> {
    const response = await axiosInstance.get<{ equipment: string[] }>(
      `${EXERCISES_BASE_URL}/meta/equipment`
    );
    return response.data.equipment;
  },
};
