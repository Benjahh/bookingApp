import z from 'zod';

const friendRequestSchema = z.object({
  requestTo: z.object(),
  requestFrom: z.object(),
  requestStatus: z.string().default('Pending').optional(),
});

export function validateFriendRequest(input) {
  return friendRequestSchema.safeParse(input);
}
