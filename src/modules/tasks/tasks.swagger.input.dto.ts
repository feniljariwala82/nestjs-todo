import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TaskPriority } from '../../migrations/1730282339113-tasks';

class CreateTaskSwaggerDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Sample task title',
    maxLength: 50,
    required: true,
  })
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Sample task description',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'The priority of the task',
    example: 'low',
    required: true,
    default: TaskPriority.low,
    enum: TaskPriority,
  })
  priority: string;
}

class UpdateTaskSwaggerDto extends PartialType(CreateTaskSwaggerDto) {}

export { CreateTaskSwaggerDto, UpdateTaskSwaggerDto };
