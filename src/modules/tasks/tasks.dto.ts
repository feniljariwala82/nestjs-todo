import { z } from 'zod';
import { TaskPriority } from '../../migrations/1730282339113-tasks';

const createTaskSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .max(50, 'Title should not be longer than 50 characters')
      .trim(),
    description: z.string({ required_error: 'Description is required' }).trim(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.low),
  })
  .required();
type CreateTaskDto = z.infer<typeof createTaskSchema>;

const updateTaskSchema = createTaskSchema.partial();
type UpdateTaskDto = z.infer<typeof updateTaskSchema>;

export { CreateTaskDto, createTaskSchema, UpdateTaskDto, updateTaskSchema };
