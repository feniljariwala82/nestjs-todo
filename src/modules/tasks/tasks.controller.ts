import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TaskOwnershipGuard } from '../../guards/tasks/TaskOwnershipGuard';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateTaskDto,
  createTaskSchema,
  UpdateTaskDto,
  updateTaskSchema,
} from './tasks.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index(@Res() response: Response, @Req() request: Request) {
    try {
      const tasks = await this.tasksService.find({
        where: { user_id: request.user.id },
        order: {
          id: 'desc',
        },
      });

      return response.status(HttpStatus.OK).json(tasks);
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe<CreateTaskDto>(createTaskSchema))
  async create(
    @Body() body: CreateTaskDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      await this.tasksService.create({ ...body, user_id: request.user.id });
      return response.status(HttpStatus.CREATED).json('Task created.');
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Get(':id')
  async show(@Res() response: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const task = await this.tasksService.findOne({ where: { id } });
      return response.status(HttpStatus.OK).json(task);
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Put(':id')
  @UsePipes(new ZodValidationPipe<UpdateTaskDto>(updateTaskSchema))
  async update(
    @Body() body: UpdateTaskDto,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const task = await this.tasksService.update(id, body);
      return response.status(HttpStatus.OK).json(task);
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Delete(':id')
  async destroy(
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.tasksService.delete(id);
      return response.status(HttpStatus.OK).json('Task deleted.');
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }
}
