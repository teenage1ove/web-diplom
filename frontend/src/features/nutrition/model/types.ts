export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionPlan {
  id: number;
  userId: number;
  goalId: number | null;
  title: string;
  description: string | null;
  dailyCaloriesTarget: number | null;
  proteinGramsTarget: number | null;
  carbsGramsTarget: number | null;
  fatsGramsTarget: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  goal: { id: number; title: string; goalType: string } | null;
  _count?: { meals: number };
  meals?: Meal[];
}

export interface Meal {
  id: number;
  nutritionPlanId: number;
  userId: number;
  mealType: MealType;
  date: string;
  title: string | null;
  description: string | null;
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatsGrams: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  nutritionPlan?: { id: number; title: string };
}

export interface CreateNutritionPlanData {
  goalId?: number | null;
  title: string;
  description?: string | null;
  dailyCaloriesTarget?: number | null;
  proteinGramsTarget?: number | null;
  carbsGramsTarget?: number | null;
  fatsGramsTarget?: number | null;
  startDate: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface UpdateNutritionPlanData {
  goalId?: number | null;
  title?: string;
  description?: string | null;
  dailyCaloriesTarget?: number | null;
  proteinGramsTarget?: number | null;
  carbsGramsTarget?: number | null;
  fatsGramsTarget?: number | null;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface CreateMealData {
  nutritionPlanId: number;
  mealType: MealType;
  date: string;
  title?: string | null;
  description?: string | null;
  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatsGrams?: number | null;
  notes?: string | null;
}

export interface UpdateMealData {
  mealType?: MealType;
  date?: string;
  title?: string | null;
  description?: string | null;
  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatsGrams?: number | null;
  notes?: string | null;
}

export interface NutritionStats {
  totalPlans: number;
  activePlans: number;
  totalMeals: number;
  todayMealsCount: number;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
}

export interface DailySummary {
  date: string;
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fats: number | null;
  } | null;
}

export interface NutritionPlansListResponse {
  plans: NutritionPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MealsListResponse {
  meals: Meal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPlansParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  goalId?: number;
}

export interface GetMealsParams {
  page?: number;
  limit?: number;
  nutritionPlanId?: number;
  mealType?: MealType;
  dateFrom?: string;
  dateTo?: string;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};
