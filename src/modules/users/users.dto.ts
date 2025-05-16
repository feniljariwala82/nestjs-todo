import { z } from 'zod';

const createUserSchema = z
  .object({
    first_name: z
      .string({ required_error: 'First name is required' })
      .max(50, 'First name should not be longer than 50 characters')
      .trim(),
    last_name: z
      .string({ required_error: 'Last name is required' })
      .max(50, 'Last name should not be longer than 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .max(200, 'Email should not be longer than 100 characters')
      .email()
      .trim(),
    password: z.string({ required_error: 'Password is required' }).trim(),
  })
  .required();
type CreateUserDto = z.infer<typeof createUserSchema>;

const loginUserSchema = createUserSchema
  .pick({
    email: true,
    password: true,
  })
  .required();
type LoginDto = z.infer<typeof loginUserSchema>;

export { CreateUserDto, createUserSchema, LoginDto, loginUserSchema };
