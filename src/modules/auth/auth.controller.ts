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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import {
  UnauthorizedResponseDto,
  ZodValidationErrorDto,
} from '../../common/dto/error.dto';
import { BCRYPT_ROUNDS, SERVER_ERROR_MESSAGE } from '../../config/constants';
import { ZodValidationPipe } from '../../pipes/ZodValidationPipe';
import { EnvironmentVariables } from '../../types/environment';
import {
  CreateUserDto,
  createUserSchema,
  LoginDto,
  loginUserSchema,
} from '../users/users.dto';
import { UsersService } from '../users/users.service';
import {
  CreateUserSwaggerDto,
  LoginSwaggerDto,
} from './auth.swagger.input.dto';
import {
  GetUserResponseDto,
  LoginResponseDto,
  SignupResponseDto,
} from './auth.swagger.output.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiBearerAuth('jwt')
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiOkResponse({
    description: 'User successfully fetched.',
    type: GetUserResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  async getUser(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(request.user);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe<LoginDto>(loginUserSchema))
  @ApiBody({
    description: 'Login API',
    required: true,
    type: LoginSwaggerDto,
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiOkResponse({
    description: 'Successfully logged in.',
    type: LoginResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.', type: String })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
  async login(@Body() body: LoginDto, @Res() response: Response) {
    try {
      const user = await this.userService.findOne({
        where: { email: body.email },
      });

      // throwing an error when user not found
      if (!user) {
        return response.status(HttpStatus.NOT_FOUND).json('User not found.');
      }

      // matching password
      const matches = await bcrypt.compare(body.password, user.password);
      if (!matches) {
        return response
          .status(HttpStatus.UNAUTHORIZED)
          .json('Invalid credentials.');
      }

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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup')
  @UsePipes(new ZodValidationPipe<CreateUserDto>(createUserSchema))
  @ApiBody({
    description: 'Signup API',
    required: true,
    type: CreateUserSwaggerDto,
  })
  @ApiUnauthorizedResponse({
    type: UnauthorizedResponseDto,
  })
  @ApiCreatedResponse({ description: 'User created.', type: SignupResponseDto })
  @ApiConflictResponse({
    description: 'User already exists with given email.',
    type: String,
  })
  @ApiInternalServerErrorResponse({
    description: SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    type: String,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed due to invalid input.',
    type: ZodValidationErrorDto, // Add the 422 response
  })
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
        .json(SERVER_ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }
}
