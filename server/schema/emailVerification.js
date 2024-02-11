import z from 'zod';

const emailVeriificationSchema = z.object({
  userId: z.string(),
  token: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export function validateEmailVerification(input) {
  return emailVeriificationSchema.safeParse(input);
}
