import { MealType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface CreateNutritionPlanData {
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

interface UpdateNutritionPlanData {
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

interface CreateMealData {
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

interface UpdateMealData {
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

interface GetPlansFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  goalId?: number;
}

interface GetMealsFilters {
  page?: number;
  limit?: number;
  nutritionPlanId?: number;
  mealType?: MealType;
  dateFrom?: string;
  dateTo?: string;
}

export class NutritionService {
  /**
   * Get nutrition plans for a user
   */
  async getUserPlans(userId: number, filters: GetPlansFilters) {
    const { page = 1, limit = 10, isActive, goalId } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (goalId) {
      where.goalId = goalId;
    }

    const [plans, total] = await Promise.all([
      prisma.nutritionPlan.findMany({
        where,
        include: {
          goal: {
            select: { id: true, title: true, goalType: true },
          },
          _count: {
            select: { meals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.nutritionPlan.count({ where }),
    ]);

    return {
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific nutrition plan by ID
   */
  async getPlanById(planId: number, userId: number) {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { id: planId, userId },
      include: {
        goal: {
          select: { id: true, title: true, goalType: true },
        },
        meals: {
          orderBy: [{ date: 'desc' }, { mealType: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundError('Nutrition plan not found');
    }

    return plan;
  }

  /**
   * Create a new nutrition plan
   */
  async createPlan(userId: number, data: CreateNutritionPlanData) {
    if (data.goalId) {
      const goal = await prisma.fitnessGoal.findFirst({
        where: { id: data.goalId, userId },
      });
      if (!goal) {
        throw new BadRequestError('Goal not found');
      }
    }

    const plan = await prisma.nutritionPlan.create({
      data: {
        userId,
        goalId: data.goalId || null,
        title: data.title,
        description: data.description || null,
        dailyCaloriesTarget: data.dailyCaloriesTarget || null,
        proteinGramsTarget: data.proteinGramsTarget || null,
        carbsGramsTarget: data.carbsGramsTarget || null,
        fatsGramsTarget: data.fatsGramsTarget || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        goal: {
          select: { id: true, title: true, goalType: true },
        },
        _count: {
          select: { meals: true },
        },
      },
    });

    logger.info(`Nutrition plan created: ${plan.id} for user ${userId}`);
    return plan;
  }

  /**
   * Update a nutrition plan
   */
  async updatePlan(planId: number, userId: number, data: UpdateNutritionPlanData) {
    const existing = await prisma.nutritionPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Nutrition plan not found');
    }

    if (data.goalId) {
      const goal = await prisma.fitnessGoal.findFirst({
        where: { id: data.goalId, userId },
      });
      if (!goal) {
        throw new BadRequestError('Goal not found');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goalId !== undefined) updateData.goalId = data.goalId;
    if (data.dailyCaloriesTarget !== undefined) updateData.dailyCaloriesTarget = data.dailyCaloriesTarget;
    if (data.proteinGramsTarget !== undefined) updateData.proteinGramsTarget = data.proteinGramsTarget;
    if (data.carbsGramsTarget !== undefined) updateData.carbsGramsTarget = data.carbsGramsTarget;
    if (data.fatsGramsTarget !== undefined) updateData.fatsGramsTarget = data.fatsGramsTarget;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const plan = await prisma.nutritionPlan.update({
      where: { id: planId },
      data: updateData,
      include: {
        goal: {
          select: { id: true, title: true, goalType: true },
        },
        _count: {
          select: { meals: true },
        },
      },
    });

    logger.info(`Nutrition plan updated: ${planId}`);
    return plan;
  }

  /**
   * Delete a nutrition plan
   */
  async deletePlan(planId: number, userId: number) {
    const existing = await prisma.nutritionPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Nutrition plan not found');
    }

    await prisma.nutritionPlan.delete({ where: { id: planId } });
    logger.info(`Nutrition plan deleted: ${planId}`);
  }

  /**
   * Get nutrition stats for a user
   */
  async getStats(userId: number) {
    const [totalPlans, activePlans, totalMeals, todayMeals] = await Promise.all([
      prisma.nutritionPlan.count({ where: { userId } }),
      prisma.nutritionPlan.count({ where: { userId, isActive: true } }),
      prisma.meal.count({ where: { userId } }),
      prisma.meal.findMany({
        where: {
          userId,
          date: {
            gte: new Date(new Date().toISOString().split('T')[0]),
            lt: new Date(new Date(Date.now() + 86400000).toISOString().split('T')[0]),
          },
        },
      }),
    ]);

    const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const todayProtein = todayMeals.reduce((sum, m) => sum + Number(m.proteinGrams || 0), 0);
    const todayCarbs = todayMeals.reduce((sum, m) => sum + Number(m.carbsGrams || 0), 0);
    const todayFats = todayMeals.reduce((sum, m) => sum + Number(m.fatsGrams || 0), 0);

    return {
      totalPlans,
      activePlans,
      totalMeals,
      todayMealsCount: todayMeals.length,
      todayCalories,
      todayProtein: Math.round(todayProtein * 100) / 100,
      todayCarbs: Math.round(todayCarbs * 100) / 100,
      todayFats: Math.round(todayFats * 100) / 100,
    };
  }

  // ============ MEALS ============

  /**
   * Get meals for a user
   */
  async getUserMeals(userId: number, filters: GetMealsFilters) {
    const { page = 1, limit = 20, nutritionPlanId, mealType, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (nutritionPlanId) {
      where.nutritionPlanId = nutritionPlanId;
    }
    if (mealType) {
      where.mealType = mealType;
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        include: {
          nutritionPlan: {
            select: { id: true, title: true },
          },
        },
        orderBy: [{ date: 'desc' }, { mealType: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.meal.count({ where }),
    ]);

    return {
      meals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a meal
   */
  async createMeal(userId: number, data: CreateMealData) {
    // Verify nutrition plan belongs to user
    const plan = await prisma.nutritionPlan.findFirst({
      where: { id: data.nutritionPlanId, userId },
    });

    if (!plan) {
      throw new NotFoundError('Nutrition plan not found');
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        nutritionPlanId: data.nutritionPlanId,
        mealType: data.mealType,
        date: new Date(data.date),
        title: data.title || null,
        description: data.description || null,
        calories: data.calories || null,
        proteinGrams: data.proteinGrams || null,
        carbsGrams: data.carbsGrams || null,
        fatsGrams: data.fatsGrams || null,
        notes: data.notes || null,
      },
      include: {
        nutritionPlan: {
          select: { id: true, title: true },
        },
      },
    });

    logger.info(`Meal created: ${meal.id} for plan ${data.nutritionPlanId}`);
    return meal;
  }

  /**
   * Update a meal
   */
  async updateMeal(mealId: number, userId: number, data: UpdateMealData) {
    const existing = await prisma.meal.findFirst({
      where: { id: mealId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Meal not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.mealType !== undefined) updateData.mealType = data.mealType;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.calories !== undefined) updateData.calories = data.calories;
    if (data.proteinGrams !== undefined) updateData.proteinGrams = data.proteinGrams;
    if (data.carbsGrams !== undefined) updateData.carbsGrams = data.carbsGrams;
    if (data.fatsGrams !== undefined) updateData.fatsGrams = data.fatsGrams;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const meal = await prisma.meal.update({
      where: { id: mealId },
      data: updateData,
      include: {
        nutritionPlan: {
          select: { id: true, title: true },
        },
      },
    });

    logger.info(`Meal updated: ${mealId}`);
    return meal;
  }

  /**
   * Delete a meal
   */
  async deleteMeal(mealId: number, userId: number) {
    const existing = await prisma.meal.findFirst({
      where: { id: mealId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Meal not found');
    }

    await prisma.meal.delete({ where: { id: mealId } });
    logger.info(`Meal deleted: ${mealId}`);
  }

  /**
   * Get daily nutrition summary
   */
  async getDailySummary(userId: number, date: string) {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: { mealType: 'asc' },
    });

    // Get active nutrition plan for targets
    const activePlan = await prisma.nutritionPlan.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gte: targetDate } },
        ],
      },
    });

    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + Number(m.proteinGrams || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbsGrams || 0), 0);
    const totalFats = meals.reduce((sum, m) => sum + Number(m.fatsGrams || 0), 0);

    return {
      date,
      meals,
      totals: {
        calories: totalCalories,
        protein: Math.round(totalProtein * 100) / 100,
        carbs: Math.round(totalCarbs * 100) / 100,
        fats: Math.round(totalFats * 100) / 100,
      },
      targets: activePlan
        ? {
            calories: activePlan.dailyCaloriesTarget,
            protein: activePlan.proteinGramsTarget ? Number(activePlan.proteinGramsTarget) : null,
            carbs: activePlan.carbsGramsTarget ? Number(activePlan.carbsGramsTarget) : null,
            fats: activePlan.fatsGramsTarget ? Number(activePlan.fatsGramsTarget) : null,
          }
        : null,
    };
  }
}
