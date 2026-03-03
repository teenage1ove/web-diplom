import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name is too long')
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name is too long')
      .trim()
      .optional(),
    dateOfBirth: z
      .string()
      .optional()
      .nullable(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
    height: z
      .number()
      .min(50, 'Height must be at least 50 cm')
      .max(300, 'Height must be at most 300 cm')
      .optional()
      .nullable(),
    weight: z
      .number()
      .min(20, 'Weight must be at least 20 kg')
      .max(500, 'Weight must be at most 500 kg')
      .optional()
      .nullable(),
    phone: z
      .string()
      .max(20, 'Phone number is too long')
      .optional()
      .nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current password is required',
    }),
    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
