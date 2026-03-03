import { prisma } from '../../config/database';
import { Prisma, WorkoutType, WorkoutStatus, Intensity, Workout } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errorHandler';

interface WorkoutExerciseData {
  exerciseId: number;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  notes?: string | null;
  orderIndex: number;
}

interface CreateWorkoutData {
  goalId?: number | null;
  title: string;
  description?: string | null;
  workoutType?: WorkoutType | null;
  scheduledDate?: string | null;
  durationMinutes?: number | null;
  intensity?: Intensity | null;
  notes?: string | null;
  exercises: WorkoutExerciseData[];
}

interface UpdateWorkoutData {
  goalId?: number | null;
  title?: string;
  description?: string | null;
  workoutType?: WorkoutType | null;
  scheduledDate?: string | null;
  durationMinutes?: number | null;
  caloriesBurned?: number | null;
  intensity?: Intensity | null;
  status?: WorkoutStatus;
  notes?: string | null;
  exercises?: WorkoutExerciseData[];
}

interface GetWorkoutsFilters {
  page?: number;
  limit?: number;
  goalId?: number;
  workoutType?: WorkoutType;
  status?: WorkoutStatus;
  intensity?: Intensity;
  startDate?: string;
  endDate?: string;
}

type WorkoutWithExercises = Workout & {
  workoutExercises: Array<{
    id: number;
    sets: number | null;
    reps: number | null;
    weight: Prisma.Decimal | null;
    durationSeconds: number | null;
    distanceMeters: Prisma.Decimal | null;
    notes: string | null;
    orderIndex: number;
    exercise: {
      id: number;
      name: string;
      category: string;
      muscleGroups: string[];
      equipment: string[];
      difficulty: string | null;
      imageUrl: string | null;
    };
  }>;
  goal: {
    id: number;
    title: string;
    goalType: string;
  } | null;
};

export class WorkoutService {
  /**
   * Get user workouts with filters
   */
  async getUserWorkouts(userId: number, filters: GetWorkoutsFilters) {
    const {
      page = 1,
      limit = 10,
      goalId,
      workoutType,
      status,
      intensity,
      startDate,
      endDate,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.WorkoutWhereInput = {
      userId,
    };

    if (goalId) where.goalId = goalId;
    if (workoutType) where.workoutType = workoutType;
    if (status) where.status = status;
    if (intensity) where.intensity = intensity;

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          goal: {
            select: {
              id: true,
              title: true,
              goalType: true,
            },
          },
          workoutExercises: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  muscleGroups: true,
                  equipment: true,
                  difficulty: true,
                  imageUrl: true,
                },
              },
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      }),
      prisma.workout.count({ where }),
    ]);

    return {
      workouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get workout by ID
   */
  async getWorkoutById(userId: number, workoutId: number): Promise<WorkoutWithExercises> {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            goalType: true,
          },
        },
        workoutExercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                muscleGroups: true,
                equipment: true,
                difficulty: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    return workout as WorkoutWithExercises;
  }

  /**
   * Create new workout
   */
  async createWorkout(userId: number, data: CreateWorkoutData): Promise<WorkoutWithExercises> {
    // Validate goal belongs to user if provided
    if (data.goalId) {
      const goal = await prisma.fitnessGoal.findFirst({
        where: { id: data.goalId, userId },
      });
      if (!goal) {
        throw new BadRequestError('Goal not found or does not belong to you');
      }
    }

    // Validate all exercises exist
    if (data.exercises && data.exercises.length > 0) {
      const exerciseIds = data.exercises.map((e) => e.exerciseId);
      const exercises = await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
      });

      if (exercises.length !== exerciseIds.length) {
        throw new BadRequestError('One or more exercises not found');
      }
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        goalId: data.goalId || null,
        title: data.title,
        description: data.description || null,
        workoutType: data.workoutType || null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        durationMinutes: data.durationMinutes || null,
        intensity: data.intensity || null,
        notes: data.notes || null,
        status: WorkoutStatus.planned,
        workoutExercises: {
          create: data.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets || null,
            reps: ex.reps || null,
            weight: ex.weight != null ? String(ex.weight) : null,
            durationSeconds: ex.durationSeconds || null,
            distanceMeters: ex.distanceMeters != null ? String(ex.distanceMeters) : null,
            notes: ex.notes || null,
            orderIndex: ex.orderIndex,
          })),
        },
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            goalType: true,
          },
        },
        workoutExercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                muscleGroups: true,
                equipment: true,
                difficulty: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return workout as WorkoutWithExercises;
  }

  /**
   * Update workout
   */
  async updateWorkout(
    userId: number,
    workoutId: number,
    data: UpdateWorkoutData
  ): Promise<WorkoutWithExercises> {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    // Validate goal if provided
    if (data.goalId !== undefined && data.goalId !== null) {
      const goal = await prisma.fitnessGoal.findFirst({
        where: { id: data.goalId, userId },
      });
      if (!goal) {
        throw new BadRequestError('Goal not found or does not belong to you');
      }
    }

    // Update exercises if provided
    if (data.exercises) {
      // Delete existing workout exercises
      await prisma.workoutExercise.deleteMany({
        where: { workoutId },
      });

      // Validate all exercises exist
      const exerciseIds = data.exercises.map((e) => e.exerciseId);
      const exercises = await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
      });

      if (exercises.length !== exerciseIds.length) {
        throw new BadRequestError('One or more exercises not found');
      }

      // Create new workout exercises
      await prisma.workoutExercise.createMany({
        data: data.exercises.map((ex) => ({
          workoutId,
          exerciseId: ex.exerciseId,
          sets: ex.sets || null,
          reps: ex.reps || null,
          weight: ex.weight != null ? String(ex.weight) : null,
          durationSeconds: ex.durationSeconds || null,
          distanceMeters: ex.distanceMeters != null ? String(ex.distanceMeters) : null,
          notes: ex.notes || null,
          orderIndex: ex.orderIndex,
        })),
      });
    }

    const updated = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        ...(data.goalId !== undefined && { goalId: data.goalId }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.workoutType !== undefined && { workoutType: data.workoutType }),
        ...(data.scheduledDate !== undefined && {
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.caloriesBurned !== undefined && { caloriesBurned: data.caloriesBurned }),
        ...(data.intensity !== undefined && { intensity: data.intensity }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status === WorkoutStatus.completed && { completedAt: new Date() }),
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            goalType: true,
          },
        },
        workoutExercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                muscleGroups: true,
                equipment: true,
                difficulty: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return updated as WorkoutWithExercises;
  }

  /**
   * Complete workout (log as completed)
   */
  async completeWorkout(
    userId: number,
    workoutId: number,
    data: {
      durationMinutes?: number;
      caloriesBurned?: number;
      notes?: string;
    }
  ): Promise<WorkoutWithExercises> {
    return this.updateWorkout(userId, workoutId, {
      status: WorkoutStatus.completed,
      durationMinutes: data.durationMinutes,
      caloriesBurned: data.caloriesBurned,
      notes: data.notes,
    });
  }

  /**
   * Delete workout
   */
  async deleteWorkout(userId: number, workoutId: number): Promise<{ message: string }> {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!workout) {
      throw new NotFoundError('Workout not found');
    }

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return { message: 'Workout deleted successfully' };
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(userId: number) {
    const [total, planned, inProgress, completed, skipped] = await Promise.all([
      prisma.workout.count({ where: { userId } }),
      prisma.workout.count({ where: { userId, status: WorkoutStatus.planned } }),
      prisma.workout.count({ where: { userId, status: WorkoutStatus.in_progress } }),
      prisma.workout.count({ where: { userId, status: WorkoutStatus.completed } }),
      prisma.workout.count({ where: { userId, status: WorkoutStatus.skipped } }),
    ]);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      planned,
      inProgress,
      completed,
      skipped,
      completionRate,
    };
  }
}
