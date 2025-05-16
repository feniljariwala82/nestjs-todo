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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import {
  UnauthorizedResponseDto,
  ZodValidationErrorDto,
} from '../../common/dto/error.dto';
import { SERVER_ERROR_MESSAGE } from '../../config/constants';
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
import {
  CreateTaskSwaggerDto,
  UpdateTaskSwaggerDto,
} from './tasks.swagger.input.dto';
import { TaskResponseDto } from './tasks.swagger.output.dto';

@Controller('tasks')
@ApiTags('Tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  // docs
  @ApiBearerAuth('jwt')
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiOkResponse({
    description: 'Successfully fetched task list of the given logged in user',
    type: TaskResponseDto,
    isArray: true,
  })
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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe<CreateTaskDto>(createTaskSchema))
  // docs
  @ApiBearerAuth('jwt')
  @ApiBody({
    description: 'Creates the task',
    required: true,
    type: CreateTaskSwaggerDto,
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiCreatedResponse({ type: String, description: 'Task created.' })
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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Get(':id')
  // docs
  @ApiBearerAuth('jwt')
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiForbiddenResponse({
    type: String,
    description: "You don't have access to this task or Task not found.",
  })
  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    description: 'ID of the task',
    example: 1,
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    description: 'Task successfully fetched',
    type: TaskResponseDto,
  })
  async show(@Res() response: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const task = await this.tasksService.findOne({ where: { id } });
      return response.status(HttpStatus.OK).json(task);
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Put(':id')
  @UsePipes(new ZodValidationPipe<UpdateTaskDto>(updateTaskSchema))
  // docs
  @ApiBearerAuth('jwt')
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiForbiddenResponse({
    type: String,
    description: "You don't have access to this task or Task not found.",
  })
  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    description: 'ID of the task',
    example: 1,
    type: Number,
    required: true,
  })
  @ApiBody({
    description: 'Updates the task',
    required: true,
    type: UpdateTaskSwaggerDto,
  })
  @ApiOkResponse({ description: 'Task updated.', type: TaskResponseDto })
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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, TaskOwnershipGuard)
  @Delete(':id')
  // docs
  @ApiBearerAuth('jwt')
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiForbiddenResponse({
    type: String,
    description: "You don't have access to this task or Task not found.",
  })
  @ApiParam({
    name: 'id',
    allowEmptyValue: false,
    description: 'ID of the task',
    example: 1,
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    description: 'Task deleted.',
    type: String,
  })
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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }
}
