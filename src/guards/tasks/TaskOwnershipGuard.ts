import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from '../../modules/tasks/tasks.service';

@Injectable()
export class TaskOwnershipGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const taskId = parseInt(request.params.id, 10); // assumes task ID is passed as a route parameter
    const user = request.user;

    if (isNaN(taskId)) {
      throw new ForbiddenException('Invalid task ID.');
    }

    // verify if the task exists and belongs to the user
    const task = await this.tasksService.exists({
      where: { id: taskId, user_id: user.id },
    });

    if (!task) {
      throw new ForbiddenException(
        "You don't have access to this task or Task not found.",
      );
    }

    // if task is found and belongs to the user, allow access
    return true;
  }
}
