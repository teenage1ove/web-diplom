import { prisma } from '../../config/database';
import { Prisma, Trainer, User } from '@prisma/client';
import { UserRepository } from '../../repositories/UserRepository';
import { NotFoundError, ConflictError } from '../../utils/errorHandler';

type TrainerWithUser = Trainer & {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatarUrl'>;
};

interface RegisterTrainerData {
  specialization: string[];
  bio: string;
  experienceYears: number;
  certifications?: string[];
  hourlyRate?: string | null;
  availability?: Record<string, string[]> | null;
}

interface UpdateTrainerData {
  specialization?: string[];
  bio?: string;
  experienceYears?: number;
  certifications?: string[];
  hourlyRate?: string | null;
  availability?: Record<string, string[]> | null;
}

interface TrainerResponse {
  id: number;
  userId: number;
  specialization: string[];
  bio: string;
  experienceYears: number;
  certifications: string[];
  hourlyRate: string | null;
  rating: string;
  totalReviews: number;
  availability: Prisma.JsonValue;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export class TrainerService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Зарегистрировать пользователя как тренера
   */
  async registerAsTrainer(userId: number, data: RegisterTrainerData): Promise<TrainerResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Проверяем, не является ли пользователь уже тренером
    const existingTrainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (existingTrainer) {
      throw new ConflictError('User is already registered as a trainer');
    }

    const trainer = await prisma.trainer.create({
      data: {
        userId,
        specialization: data.specialization,
        bio: data.bio,
        experienceYears: data.experienceYears,
        certifications: data.certifications || [],
        hourlyRate: data.hourlyRate ? data.hourlyRate : null,
        availability: data.availability || Prisma.JsonNull,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.formatTrainerResponse(trainer);
  }

  /**
   * Обновить профиль тренера
   */
  async updateTrainerProfile(userId: number, data: UpdateTrainerData): Promise<TrainerResponse> {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundError('Trainer profile not found');
    }

    const updateData: Prisma.TrainerUpdateInput = {};

    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
    if (data.certifications !== undefined) updateData.certifications = data.certifications;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.availability !== undefined) updateData.availability = data.availability || Prisma.JsonNull;

    const updatedTrainer = await prisma.trainer.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.formatTrainerResponse(updatedTrainer);
  }

  /**
   * Получить профиль тренера по userId
   */
  async getTrainerByUserId(userId: number): Promise<TrainerResponse> {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundError('Trainer profile not found');
    }

    return this.formatTrainerResponse(trainer);
  }

  /**
   * Получить профиль тренера по ID
   */
  async getTrainerById(trainerId: number): Promise<TrainerResponse> {
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundError('Trainer not found');
    }

    return this.formatTrainerResponse(trainer);
  }

  /**
   * Получить список всех тренеров
   */
  async getAllTrainers(params: {
    page?: number;
    limit?: number;
    specialization?: string;
    isVerified?: boolean;
  }): Promise<{ trainers: TrainerResponse[]; total: number; page: number; limit: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TrainerWhereInput = {};

    if (params.specialization) {
      where.specialization = { has: params.specialization };
    }

    if (params.isVerified !== undefined) {
      where.isVerified = params.isVerified;
    }

    const [trainers, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.trainer.count({ where }),
    ]);

    return {
      trainers: trainers.map((t) => this.formatTrainerResponse(t)),
      total,
      page,
      limit,
    };
  }

  private formatTrainerResponse(trainer: TrainerWithUser): TrainerResponse {
    return {
      id: trainer.id,
      userId: trainer.userId,
      specialization: trainer.specialization,
      bio: trainer.bio ?? '',
      experienceYears: trainer.experienceYears ?? 0,
      certifications: trainer.certifications,
      hourlyRate: trainer.hourlyRate?.toString() ?? null,
      rating: trainer.rating.toString(),
      totalReviews: trainer.totalReviews ?? 0,
      availability: trainer.availability,
      isVerified: trainer.isVerified,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
      user: trainer.user,
    };
  }
}
