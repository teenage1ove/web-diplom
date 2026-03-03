import { axiosInstance } from '@shared/lib/axios/axiosInstance';
import type {
  NutritionPlan,
  Meal,
  NutritionStats,
  DailySummary,
  NutritionPlansListResponse,
  MealsListResponse,
  CreateNutritionPlanData,
  UpdateNutritionPlanData,
  CreateMealData,
  UpdateMealData,
  GetPlansParams,
  GetMealsParams,
} from '../model/types';

const BASE = '/nutrition';

export const nutritionApi = {
  // ============ PLANS ============

  async getPlans(params?: GetPlansParams): Promise<NutritionPlansListResponse> {
    const { data } = await axiosInstance.get(`${BASE}/plans`, { params });
    return data;
  },

  async getPlanById(planId: number): Promise<NutritionPlan> {
    const { data } = await axiosInstance.get(`${BASE}/plans/${planId}`);
    return data.plan;
  },

  async createPlan(planData: CreateNutritionPlanData): Promise<NutritionPlan> {
    const { data } = await axiosInstance.post(`${BASE}/plans`, planData);
    return data.plan;
  },

  async updatePlan(planId: number, planData: UpdateNutritionPlanData): Promise<NutritionPlan> {
    const { data } = await axiosInstance.put(`${BASE}/plans/${planId}`, planData);
    return data.plan;
  },

  async deletePlan(planId: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/plans/${planId}`);
  },

  async getStats(): Promise<NutritionStats> {
    const { data } = await axiosInstance.get(`${BASE}/plans/stats`);
    return data.stats;
  },

  // ============ DAILY SUMMARY ============

  async getDailySummary(date?: string): Promise<DailySummary> {
    const { data } = await axiosInstance.get(`${BASE}/daily-summary`, {
      params: date ? { date } : undefined,
    });
    return data.summary;
  },

  // ============ MEALS ============

  async getMeals(params?: GetMealsParams): Promise<MealsListResponse> {
    const { data } = await axiosInstance.get(`${BASE}/meals`, { params });
    return data;
  },

  async createMeal(mealData: CreateMealData): Promise<Meal> {
    const { data } = await axiosInstance.post(`${BASE}/meals`, mealData);
    return data.meal;
  },

  async updateMeal(mealId: number, mealData: UpdateMealData): Promise<Meal> {
    const { data } = await axiosInstance.put(`${BASE}/meals/${mealId}`, mealData);
    return data.meal;
  },

  async deleteMeal(mealId: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/meals/${mealId}`);
  },
};
