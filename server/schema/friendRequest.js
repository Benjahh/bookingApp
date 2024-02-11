import z from 'zod';

const friendRequestSchema = z.object({
  userId: z.string(),
  requestStatus: z.string().default('Pending'),
});

export function validateFriendRequest(input) {
  return friendRequestSchema.safeParse(input);
}
