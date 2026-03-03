import { ConsultationStatus, SessionType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface CreateConsultationData {
  trainerId: number;
  sessionType: SessionType;
  title: string;
  description?: string | null;
  scheduledDate: string;
  durationMinutes?: number;
  notes?: string | null;
}

interface UpdateConsultationData {
  sessionType?: SessionType;
  title?: string;
  description?: string | null;
  scheduledDate?: string;
  durationMinutes?: number;
  status?: ConsultationStatus;
  meetingLink?: string | null;
  notes?: string | null;
}

interface GetConsultationsFilters {
  page?: number;
  limit?: number;
  status?: ConsultationStatus;
  trainerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export class ConsultationService {
  /**
   * Get consultations for a user
   */
  async getUserConsultations(userId: number, filters: GetConsultationsFilters) {
    const { page = 1, limit = 10, status, trainerId, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (status) where.status = status;
    if (trainerId) where.trainerId = trainerId;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) (where.scheduledDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.scheduledDate as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: {
          trainer: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultation.count({ where }),
    ]);

    return {
      consultations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get consultations for a trainer
   */
  async getTrainerConsultations(trainerId: number, filters: GetConsultationsFilters) {
    const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { trainerId };
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) (where.scheduledDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.scheduledDate as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
          trainer: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultation.count({ where }),
    ]);

    return { consultations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get consultation by ID
   */
  async getConsultationById(consultationId: number, userId: number) {
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [
          { userId },
          { trainer: { userId } },
        ],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        trainer: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundError('Consultation not found');
    }

    return consultation;
  }

  /**
   * Create a consultation booking
   */
  async createConsultation(userId: number, data: CreateConsultationData) {
    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: data.trainerId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (!trainer) {
      throw new NotFoundError('Trainer not found');
    }

    if (trainer.userId === userId) {
      throw new BadRequestError('Cannot book consultation with yourself');
    }

    const scheduledDate = new Date(data.scheduledDate);
    if (scheduledDate <= new Date()) {
      throw new BadRequestError('Scheduled date must be in the future');
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        trainerId: data.trainerId,
        sessionType: data.sessionType,
        title: data.title,
        description: data.description || null,
        scheduledDate,
        durationMinutes: data.durationMinutes || 60,
        notes: data.notes || null,
        price: trainer.hourlyRate
          ? (Number(trainer.hourlyRate) * (data.durationMinutes || 60)) / 60
          : null,
      },
      include: {
        trainer: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    logger.info(`Consultation created: ${consultation.id} by user ${userId} with trainer ${data.trainerId}`);
    return consultation;
  }

  /**
   * Update a consultation
   */
  async updateConsultation(consultationId: number, userId: number, data: UpdateConsultationData) {
    const existing = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [{ userId }, { trainer: { userId } }],
      },
    });

    if (!existing) {
      throw new NotFoundError('Consultation not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sessionType !== undefined) updateData.sessionType = data.sessionType;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed') updateData.completedAt = new Date();
    }
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: updateData,
      include: {
        trainer: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    logger.info(`Consultation updated: ${consultationId}`);
    return consultation;
  }

  /**
   * Cancel a consultation
   */
  async cancelConsultation(consultationId: number, userId: number) {
    const existing = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        OR: [{ userId }, { trainer: { userId } }],
      },
    });

    if (!existing) {
      throw new NotFoundError('Consultation not found');
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      throw new BadRequestError('Cannot cancel a completed or already cancelled consultation');
    }

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'cancelled' },
    });

    logger.info(`Consultation cancelled: ${consultationId}`);
    return consultation;
  }

  /**
   * Get consultation stats for a user
   */
  async getStats(userId: number) {
    const [total, scheduled, completed, cancelled] = await Promise.all([
      prisma.consultation.count({ where: { userId } }),
      prisma.consultation.count({ where: { userId, status: 'scheduled' } }),
      prisma.consultation.count({ where: { userId, status: 'completed' } }),
      prisma.consultation.count({ where: { userId, status: 'cancelled' } }),
    ]);

    const upcoming = await prisma.consultation.findMany({
      where: {
        userId,
        status: { in: ['scheduled', 'confirmed'] },
        scheduledDate: { gte: new Date() },
      },
      include: {
        trainer: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 5,
    });

    return { total, scheduled, completed, cancelled, upcoming };
  }
}
