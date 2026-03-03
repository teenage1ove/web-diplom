import { axiosInstance } from '@/shared/lib/axios/axiosInstance';
import type {
  Goal,
  CreateGoalData,
  UpdateGoalData,
  GoalStats,
  GoalsListResponse,
  GoalType,
  GoalStatus,
} from '../model/types';

const GOALS_BASE_URL = '/goals';

export interface GetGoalsParams {
  page?: number;
  limit?: number;
  status?: GoalStatus;
  goalType?: GoalType;
}

export const goalsApi = {
  /**
   * Get all user goals with optional filters
   */
  async getGoals(params?: GetGoalsParams): Promise<GoalsListResponse> {
    const response = await axiosInstance.get<GoalsListResponse>(GOALS_BASE_URL, {
      params,
    });
    return response.data;
  },

  /**
   * Get goal by ID
   */
  async getGoalById(goalId: number): Promise<Goal> {
    const response = await axiosInstance.get<{ goal: Goal }>(`${GOALS_BASE_URL}/${goalId}`);
    return response.data.goal;
  },

  /**
   * Get goals statistics
   */
  async getGoalStats(): Promise<GoalStats> {
    const response = await axiosInstance.get<GoalStats>(`${GOALS_BASE_URL}/stats`);
    return response.data;
  },

  /**
   * Create new goal
   */
  async createGoal(data: CreateGoalData): Promise<Goal> {
    const response = await axiosInstance.post<{ message: string; goal: Goal }>(
      GOALS_BASE_URL,
      data
    );
    return response.data.goal;
  },

  /**
   * Update goal
   */
  async updateGoal(goalId: number, data: UpdateGoalData): Promise<Goal> {
    const response = await axiosInstance.put<{ message: string; goal: Goal }>(
      `${GOALS_BASE_URL}/${goalId}`,
      data
    );
    return response.data.goal;
  },

  /**
   * Update goal progress
   */
  async updateProgress(goalId: number, currentValue: number): Promise<Goal> {
    const response = await axiosInstance.patch<{ message: string; goal: Goal }>(
      `${GOALS_BASE_URL}/${goalId}/progress`,
      { currentValue }
    );
    return response.data.goal;
  },

  /**
   * Delete goal
   */
  async deleteGoal(goalId: number): Promise<void> {
    await axiosInstance.delete(`${GOALS_BASE_URL}/${goalId}`);
  },
};
