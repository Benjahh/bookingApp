import z from 'zod';

const postSchema = z.object({
  userId: z.string(),
  description: z.string(),
  image: z.string(),
  likes: z.string().array(),
  comments: z.string().array(),
});

export function validatePost(input) {
  return postSchema.safeParse(input);
}
