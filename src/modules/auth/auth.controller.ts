import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { BCRYPT_ROUNDS } from '../..//config/constants';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { EnvironmentVariables } from '../../types/environment';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  CreateUserDto,
  createUserSchema,
  LoginDto,
  loginUserSchema,
} from '../users/users.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(request.user);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe<LoginDto>(loginUserSchema))
  async login(@Body() body: LoginDto, @Res() response: Response) {
    try {
      const user = await this.userService.findOne({
        where: { email: body.email },
      });

      // throwing an error when user not found
      if (!user)
        return response.status(HttpStatus.NOT_FOUND).json('User not found.');

      // matching password
      const matches = await bcrypt.compare(body.password, user.password);
      if (!matches)
        return response
          .status(HttpStatus.UNAUTHORIZED)
          .json('Invalid credentials.');

      // notification
      this.notificationGateway.notify(
        `/users/${user.id}`,
        `New login detected from a different device`,
      );

      // creating auth token
      return response.status(HttpStatus.OK).json(
        this.jwtService.sign(
          { sub: user.id, email: user.email },
          {
            expiresIn: this.configService.get('JWT_AUTH_TOKEN_EXPIRATION_TIME'),
          },
        ),
      );
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }

  @Post('signup')
  @UsePipes(new ZodValidationPipe<CreateUserDto>(createUserSchema))
  async signup(@Body() body: CreateUserDto, @Res() response: Response) {
    try {
      const user = await this.userService.findOne({
        where: { email: body.email },
      });

      // throwing an error when user not found
      if (user)
        return response
          .status(HttpStatus.CONFLICT)
          .json('User already exists with given email.');

      // hashing password
      const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

      // creating user
      await this.userService.create({
        ...body,
        password: hashedPassword,
      });

      return response.status(HttpStatus.CREATED).json('User created.');
    } catch (error) {
      console.error(error);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(error.message);
    }
  }
}
