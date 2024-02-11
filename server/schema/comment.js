import z from 'zod';

const commentSchema = z.object({
  userId: z.string(),
  postId: z.string(),
  comment: z.string(),
  from: z.string().array(),
  replies: z.string().array(),
  likes: z.string().array(),
  timeStamp: z.timeStamp(),
});

export function validateComment(input) {
  return commentSchema.safeParse(input);
}
