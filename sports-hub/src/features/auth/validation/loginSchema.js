import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address').trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password cannot exceed 64 characters'),
});
