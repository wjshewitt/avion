import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email('Enter a valid email');

const passwordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
