import z from 'zod';

const userSchema = z.object({
  firstName: z.string({ invalid_type_error: 'Name must be a string' }),
  lastName: z.string({ invalid_type_error: 'Last name must be a string' }),
  email: z.string({ invalid_type_error: 'Email must be a string' }).email(),
  password: z.string().min(6),
  location: z.string().optional(),
  friends: z.string().array().optional(),
  views: z.string().array().optional(),
  verified: z.boolean().default(false).optional(),
});

export function validateUser(input) {
  return userSchema.safeParse(input);
}
