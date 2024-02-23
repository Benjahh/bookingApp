import z from 'zod';

const friendRequestSchema = z.object({
  requestTo: z.string(),
  requestFrom: z.string(),
  requestStatus: z.string().default('Pending').optional(),
});

export function validateFriendRequest(input) {
  return friendRequestSchema.safeParse(input);
}
