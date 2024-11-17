import { z } from 'zod';
import { TaskPriority } from '../../migrations/1730282339113-tasks';

export const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .max(50, 'Title should not be longer than 50 characters')
      .trim(),
    description: z.string({ required_error: 'Description is required' }).trim(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.low),
  })
  .required();
export type CreateTaskDto = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
