import { z } from 'zod';

export const createConsultationSchema = z.object({
  body: z.object({
    trainerId: z.number().int().positive('Выберите тренера'),
    sessionType: z.enum(['one_time', 'recurring', 'package'], {
      required_error: 'Выберите тип консультации',
    }),
    title: z.string().min(2, 'Минимум 2 символа').max(200),
    description: z.string().max(1000).optional().nullable(),
    scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Неверный формат даты',
    }),
    durationMinutes: z.number().int().min(15).max(480).default(60),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateConsultationSchema = z.object({
  body: z.object({
    sessionType: z.enum(['one_time', 'recurring', 'package']).optional(),
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    scheduledDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Неверный формат даты' })
      .optional(),
    durationMinutes: z.number().int().min(15).max(480).optional(),
    status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
    meetingLink: z.string().url().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateConsultationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['confirmed', 'in_progress', 'completed', 'cancelled']),
    notes: z.string().max(1000).optional().nullable(),
  }),
});
