import { prisma } from '../../config/database';
import { Prisma, GoalType, GoalStatus, FitnessGoal } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errorHandler';

interface CreateGoalData {
  goalType: GoalType;
  title: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  startDate: string;
  targetDate: string;
}

interface UpdateGoalData {
  goalType?: GoalType;
  title?: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  startDate?: string;
  targetDate?: string;
  status?: GoalStatus;
}

interface GoalResponse {
  id: number;
  userId: number;
  goalType: GoalType;
  title: string;
  description: string | null;
  targetValue: string | null;
  currentValue: string | null;
  unit: string | null;
  startDate: Date;
  targetDate: Date;
  status: GoalStatus;
  progressPercentage: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GoalService {
  /**
   * Создать новую фитнес-цель
   */
  async createGoal(userId: number, data: CreateGoalData): Promise<GoalResponse> {
    const startDate = new Date(data.startDate);
    const targetDate = new Date(data.targetDate);

    if (targetDate <= startDate) {
      throw new BadRequestError('Target date must be after start date');
    }

    const progressPercentage = this.calculateProgress(
      data.currentValue ?? null,
      data.targetValue ?? null
    );

    const goal = await prisma.fitnessGoal.create({
      data: {
        userId,
        goalType: data.goalType,
        title: data.title,
        description: data.description || null,
        targetValue: data.targetValue != null ? String(data.targetValue) : null,
        currentValue: data.currentValue != null ? String(data.currentValue) : null,
        unit: data.unit || null,
        startDate,
        targetDate,
        progressPercentage,
      },
    });

    return this.formatGoalResponse(goal);
  }

  /**
   * Обновить фитнес-цель
   */
  async updateGoal(userId: number, goalId: number, data: UpdateGoalData): Promise<GoalResponse> {
    const goal = await prisma.fitnessGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const updateData: Prisma.FitnessGoalUpdateInput = {};

    if (data.goalType !== undefined) updateData.goalType = data.goalType;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.targetDate !== undefined) updateData.targetDate = new Date(data.targetDate);
    if (data.status !== undefined) updateData.status = data.status;

    if (data.targetValue !== undefined) {
      updateData.targetValue = data.targetValue != null ? String(data.targetValue) : null;
    }
    if (data.currentValue !== undefined) {
      updateData.currentValue = data.currentValue != null ? String(data.currentValue) : null;
    }

    // Recalculate progress if values changed
    const newCurrentValue = data.currentValue !== undefined ? data.currentValue : (goal.currentValue ? Number(goal.currentValue) : null);
    const newTargetValue = data.targetValue !== undefined ? data.targetValue : (goal.targetValue ? Number(goal.targetValue) : null);
    updateData.progressPercentage = this.calculateProgress(newCurrentValue, newTargetValue);

    // Auto-complete goal if progress reaches 100%
    if (Number(updateData.progressPercentage) >= 100 && goal.status === 'active') {
      updateData.status = 'completed';
    }

    const updatedGoal = await prisma.fitnessGoal.update({
      where: { id: goalId },
      data: updateData,
    });

    return this.formatGoalResponse(updatedGoal);
  }

  /**
   * Обновить прогресс цели
   */
  async updateProgress(userId: number, goalId: number, currentValue: number): Promise<GoalResponse> {
    const goal = await prisma.fitnessGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    if (goal.status !== 'active') {
      throw new BadRequestError('Can only update progress for active goals');
    }

    const targetValue = goal.targetValue ? Number(goal.targetValue) : null;
    const progressPercentage = this.calculateProgress(currentValue, targetValue);

    const updateData: Prisma.FitnessGoalUpdateInput = {
      currentValue: String(currentValue),
      progressPercentage,
    };

    // Auto-complete if 100%
    if (Number(progressPercentage) >= 100) {
      updateData.status = 'completed';
    }

    const updatedGoal = await prisma.fitnessGoal.update({
      where: { id: goalId },
      data: updateData,
    });

    return this.formatGoalResponse(updatedGoal);
  }

  /**
   * Получить цель по ID
   */
  async getGoalById(userId: number, goalId: number): Promise<GoalResponse> {
    const goal = await prisma.fitnessGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    return this.formatGoalResponse(goal);
  }

  /**
   * Получить все цели пользователя
   */
  async getUserGoals(userId: number, params: {
    page?: number;
    limit?: number;
    status?: GoalStatus;
    goalType?: GoalType;
  }): Promise<{ goals: GoalResponse[]; total: number; page: number; limit: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FitnessGoalWhereInput = { userId };

    if (params.status) {
      where.status = params.status;
    }
    if (params.goalType) {
      where.goalType = params.goalType;
    }

    const [goals, total] = await Promise.all([
      prisma.fitnessGoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fitnessGoal.count({ where }),
    ]);

    return {
      goals: goals.map((g) => this.formatGoalResponse(g)),
      total,
      page,
      limit,
    };
  }

  /**
   * Удалить цель
   */
  async deleteGoal(userId: number, goalId: number): Promise<{ message: string }> {
    const goal = await prisma.fitnessGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    await prisma.fitnessGoal.delete({
      where: { id: goalId },
    });

    return { message: 'Goal deleted successfully' };
  }

  /**
   * Получить статистику целей пользователя
   */
  async getGoalStats(userId: number): Promise<{
    total: number;
    active: number;
    completed: number;
    paused: number;
    abandoned: number;
    completionRate: string;
  }> {
    const [total, active, completed, paused, abandoned] = await Promise.all([
      prisma.fitnessGoal.count({ where: { userId } }),
      prisma.fitnessGoal.count({ where: { userId, status: 'active' } }),
      prisma.fitnessGoal.count({ where: { userId, status: 'completed' } }),
      prisma.fitnessGoal.count({ where: { userId, status: 'paused' } }),
      prisma.fitnessGoal.count({ where: { userId, status: 'abandoned' } }),
    ]);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

    return { total, active, completed, paused, abandoned, completionRate };
  }

  /**
   * Рассчитать процент прогресса
   * Для weight_loss: прогресс = сколько уже сброшено от начального → целевого
   * Для остальных: прогресс = currentValue / targetValue * 100
   */
  private calculateProgress(
    currentValue: number | null,
    targetValue: number | null,
    goalType?: GoalType,
    startValue?: number | null
  ): number {
    if (targetValue == null || currentValue == null) {
      return 0;
    }

    // For weight loss: progress is from startValue down to targetValue
    if (goalType === 'weight_loss' && startValue != null && startValue !== targetValue) {
      const totalToLose = startValue - targetValue;
      const lost = startValue - currentValue;
      const progress = (lost / totalToLose) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }

    if (targetValue === 0) return 0;

    const progress = (currentValue / targetValue) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  private formatGoalResponse(goal: FitnessGoal): GoalResponse {
    return {
      id: goal.id,
      userId: goal.userId,
      goalType: goal.goalType,
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue?.toString() ?? null,
      currentValue: goal.currentValue?.toString() ?? null,
      unit: goal.unit,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      status: goal.status,
      progressPercentage: goal.progressPercentage.toString(),
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}
