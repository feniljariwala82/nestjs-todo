import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TasksController } from './tasks.controller';
import { Task } from './tasks.entity';
import { TasksService } from './tasks.service';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [UsersModule, TypeOrmModule.forFeature([Task])],
})
export class TasksModule {}
