import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EntityNotFoundExceptionFilter } from './errors/entity-not-found.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new EntityNotFoundExceptionFilter());

  app.enableCors({
    origin: [process.env.DOMAIN_URL],
    methods: ['POST', 'PATCH', 'DELETE', 'GET']
  });

  const swaggerOptions = new DocumentBuilder()
    .setTitle('To-Do List API')
    .setDescription('API Documentation "To-Do List"')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api/v1/docs', app, swaggerDocument);

  const applicationPort = process.env.APP_PORT || process.env.PORT || 3333;

  await app.listen(applicationPort);

  console.log(`🚀 API: http://localhost:${applicationPort}/api/v1/`);
  console.log(`📝 DOC: http://localhost:${applicationPort}/api/v1/docs`);
}
bootstrap();
