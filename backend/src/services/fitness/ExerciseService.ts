import { prisma } from '../../config/database';
import { Prisma, ExerciseCategory, Difficulty, Exercise } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errorHandler';

interface CreateExerciseData {
  name: string;
  description?: string | null;
  category: ExerciseCategory;
  muscleGroups: string[];
  equipment: string[];
  difficulty?: Difficulty | null;
  instructions?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  isCustom?: boolean;
  createdBy?: number | null;
}

interface UpdateExerciseData {
  name?: string;
  description?: string | null;
  category?: ExerciseCategory;
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: Difficulty | null;
  instructions?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
}

interface GetExercisesFilters {
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

export class ExerciseService {
  /**
   * Get all exercises with filters
   */
  async getExercises(filters: GetExercisesFilters) {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      muscleGroups,
      equipment,
      search,
      isCustom,
      createdBy,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {};

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (isCustom !== undefined) where.isCustom = isCustom;
    if (createdBy) where.createdBy = createdBy;

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by muscle groups (array contains any of the specified)
    if (muscleGroups && muscleGroups.length > 0) {
      where.muscleGroups = {
        hasSome: muscleGroups,
      };
    }

    // Filter by equipment
    if (equipment && equipment.length > 0) {
      where.equipment = {
        hasSome: equipment,
      };
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isCustom: 'asc' }, { name: 'asc' }],
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(exerciseId: number, userId?: number): Promise<Exercise> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    // If exercise is custom, only creator can view it
    if (exercise.isCustom && userId && exercise.createdBy !== userId) {
      throw new NotFoundError('Exercise not found');
    }

    return exercise;
  }

  /**
   * Create new exercise (custom or default)
   */
  async createExercise(userId: number | null, data: CreateExerciseData): Promise<Exercise> {
    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        muscleGroups: data.muscleGroups,
        equipment: data.equipment,
        difficulty: data.difficulty || null,
        instructions: data.instructions || null,
        videoUrl: data.videoUrl || null,
        imageUrl: data.imageUrl || null,
        isCustom: data.isCustom !== undefined ? data.isCustom : (userId !== null),
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return exercise;
  }

  /**
   * Update exercise
   */
  async updateExercise(
    userId: number,
    exerciseId: number,
    data: UpdateExerciseData
  ): Promise<Exercise> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    // Only creator can update custom exercises
    if (exercise.isCustom && exercise.createdBy !== userId) {
      throw new BadRequestError('You can only update your own custom exercises');
    }

    // Can't update default exercises
    if (!exercise.isCustom) {
      throw new BadRequestError('Cannot update default exercises');
    }

    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.muscleGroups && { muscleGroups: data.muscleGroups }),
        ...(data.equipment && { equipment: data.equipment }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete exercise
   */
  async deleteExercise(userId: number, exerciseId: number): Promise<{ message: string }> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    // Only creator can delete custom exercises
    if (exercise.isCustom && exercise.createdBy !== userId) {
      throw new BadRequestError('You can only delete your own custom exercises');
    }

    // Can't delete default exercises
    if (!exercise.isCustom) {
      throw new BadRequestError('Cannot delete default exercises');
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });

    return { message: 'Exercise deleted successfully' };
  }

  /**
   * Get exercise categories
   */
  async getCategories(): Promise<string[]> {
    return Object.values(ExerciseCategory);
  }

  /**
   * Get available muscle groups
   */
  async getMuscleGroups(): Promise<string[]> {
    const exercises = await prisma.exercise.findMany({
      select: { muscleGroups: true },
    });

    const muscleGroupsSet = new Set<string>();
    exercises.forEach((ex) => {
      ex.muscleGroups.forEach((mg) => muscleGroupsSet.add(mg));
    });

    return Array.from(muscleGroupsSet).sort();
  }

  /**
   * Get available equipment
   */
  async getEquipment(): Promise<string[]> {
    const exercises = await prisma.exercise.findMany({
      select: { equipment: true },
    });

    const equipmentSet = new Set<string>();
    exercises.forEach((ex) => {
      ex.equipment.forEach((eq) => equipmentSet.add(eq));
    });

    return Array.from(equipmentSet).sort();
  }
}
