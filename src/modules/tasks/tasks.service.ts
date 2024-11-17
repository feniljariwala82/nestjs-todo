import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../config/base-service';
import { Task } from './tasks.entity';

@Injectable()
export class TasksService extends BaseService<Task> {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {
    super(tasksRepository);
  }
}
