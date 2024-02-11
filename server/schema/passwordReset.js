import z from 'zod';

const passwordResetSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  token: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export function validatePasswordReset(input) {
  return passwordResetSchema.safeParse(input);
}
