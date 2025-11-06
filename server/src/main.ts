import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true }); // Enable CORS
  app.enableCors(); // <-- This enables CORS for all routes and origins
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // set true to reject unknown props
      transform: true,
    }),
  );

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Bookshelf API')
    .setDescription('API documentation for your Bookshelf project')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // <-- This defines the /api route

  await app.listen(3000);
  console.log(`🚀 Application running on: http://localhost:3000/api`);
}

bootstrap();
