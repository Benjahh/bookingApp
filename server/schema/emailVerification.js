import z from 'zod';

const emailVeriificationSchema = z.object({
  userId: z.string(),
  token: z.string(),
  createdAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

export function validateEmailVerification(input) {
  return emailVeriificationSchema.safeParse(input);
}
