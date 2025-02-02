import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseMiddleware } from './middlewares/response.middleware';
import { Users1730276645782 } from './migrations/1730276645782-users';
import { Tasks1730282339113 } from './migrations/1730282339113-tasks';
import { AuthModule } from './modules/auth/auth.module';
import { Task } from './modules/tasks/tasks.entity';
import { TasksModule } from './modules/tasks/tasks.module';
import { User } from './modules/users/users.entity';
import { UsersModule } from './modules/users/users.module';
import { EnvironmentVariables } from './types/environment';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object<EnvironmentVariables>({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .required(),
        PORT: Joi.number().port().required().default(8080),
        TEST_DATABASE_URL: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_AUTH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      }),
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        type: 'sqlite',
        database:
          config.get('NODE_ENV') === 'test'
            ? config.get('TEST_DATABASE_URL')
            : config.get('DATABASE_URL'),
        migrations: [Users1730276645782, Tasks1730282339113],
        entities: [User, Task],
        migrationsRun: true,
        logging: true,
      }),
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseMiddleware).forRoutes('*'); // Apply the middleware to all routes
  }
}
