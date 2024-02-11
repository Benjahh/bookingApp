import z from 'zod';

const userSchema = z.object({
  firstName: z.string({ invalid_type_error: 'Name must be a string' }),
  lastName: z.string({ invalid_type_error: 'Last name must be a string' }),
  email: z.string({ invalid_type_error: 'Email must be a string' }).email(),
  pasword: z.pasword().string().min(6),
  location: z.string(),
  friends: z.string().array(),
  views: z.string().array(),
  verified: z.boolean().default(false),
});

export function validateUser(input) {
  return userSchema.safeParse(input);
}
