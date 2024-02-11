import z from 'zod';

const emailVeriificationSchema = z.object({
  userId: z.string(),
  token: z.string(),
  createdAt: z.number(),
  expiresAt: z.number(),
});

export function validateEmailVerification(input) {
  return emailVeriificationSchema.safeParse(input);
}
