import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../../migrations/1730282339113-tasks';

class TaskResponseDto {
  @ApiProperty({
    description: 'ID of the task',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the task',
    example: 'Sample title',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the task',
    example: 'Sample description',
  })
  description: string;

  @ApiProperty({
    description: 'The priority of the task',
    example: 'low',
    enum: TaskPriority,
  })
  priority: string;

  @ApiProperty({
    description: 'The id of the user who created the task',
    example: 1,
  })
  user_id: number;
}

export { TaskResponseDto };
