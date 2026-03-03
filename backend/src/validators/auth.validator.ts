import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    firstName: z
      .string({
        required_error: 'First name is required',
      })
      .min(1, 'First name is required')
      .max(100, 'First name is too long')
      .trim(),
    lastName: z
      .string({
        required_error: 'Last name is required',
      })
      .min(1, 'Last name is required')
      .max(100, 'Last name is too long')
      .trim(),
    dateOfBirth: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string({
      required_error: 'Verification token is required',
    }),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});
