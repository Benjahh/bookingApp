import z from 'zod';

const passwordResetSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  token: z.string(),
  createdAt: z.number(),
  expiresAt: z.number(),
});

export function validatePasswordReset(input) {
  return passwordResetSchema.safeParse(input);
}
