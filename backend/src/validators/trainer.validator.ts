import { z } from 'zod';

export const registerTrainerSchema = z.object({
  body: z.object({
    specialization: z
      .array(z.string().min(1).max(100))
      .min(1, 'At least one specialization is required')
      .max(10, 'Maximum 10 specializations'),
    bio: z
      .string()
      .min(10, 'Bio must be at least 10 characters')
      .max(2000, 'Bio is too long')
      .trim(),
    experienceYears: z
      .number()
      .int()
      .min(0, 'Experience years must be non-negative')
      .max(50, 'Experience years seems too high'),
    certifications: z
      .array(z.string().min(1).max(200))
      .optional()
      .default([]),
    hourlyRate: z
      .number()
      .min(0, 'Hourly rate must be non-negative')
      .max(100000, 'Hourly rate is too high')
      .optional()
      .nullable()
      .transform((val) => (val !== null && val !== undefined ? String(val) : null)),
    availability: z
      .record(z.any())
      .optional()
      .nullable(),
  }),
});

export const updateTrainerSchema = z.object({
  body: z.object({
    specialization: z
      .array(z.string().min(1).max(100))
      .min(1, 'At least one specialization is required')
      .max(10, 'Maximum 10 specializations')
      .optional(),
    bio: z
      .string()
      .min(10, 'Bio must be at least 10 characters')
      .max(2000, 'Bio is too long')
      .trim()
      .optional(),
    experienceYears: z
      .number()
      .int()
      .min(0, 'Experience years must be non-negative')
      .max(50, 'Experience years seems too high')
      .optional(),
    certifications: z
      .array(z.string().min(1).max(200))
      .optional(),
    hourlyRate: z
      .number()
      .min(0, 'Hourly rate must be non-negative')
      .max(100000, 'Hourly rate is too high')
      .optional()
      .nullable()
      .transform((val) => (val !== null && val !== undefined ? String(val) : null)),
    availability: z
      .record(z.any())
      .optional()
      .nullable(),
  }),
});

export const getTrainerByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
