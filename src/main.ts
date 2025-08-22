import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Protect Swagger with basic auth
  app.use(
    '/docs', // The Swagger UI endpoint
    basicAuth({
      users: { admin: '12345678' }, // Replace with your credentials
      challenge: true, // Prompts the user for credentials
      unauthorizedResponse: 'Unauthorized',
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      // Define Bearer Token authentication
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional: specifies the token format
        description: 'Bearer token',
      },
      'jwt', // Name of the security scheme (used in @ApiBearerAuth('jwt') if you customize it)
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: '/docs/swagger/json',
    yamlDocumentUrl: '/docs/swagger/yaml',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
