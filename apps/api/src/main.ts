import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env when running from monorepo (cwd is apps/api)
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type NextFunction, type Request, type Response } from 'express';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Stripe webhook needs raw body for signature verification (express.raw not in Nest's bundled express)
  app.use('/donations/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === '/donations/webhook') return next();
    bodyParser.json()(req, res, next);
  });
  const allowedOrigins = [
    'https://screenriot-web.vercel.app',
    'https://screenriot-admin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002',
  ];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Screen Riot API')
    .setDescription('API for Screen Riot: films, donations, auth')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://0.0.0.0:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
}
bootstrap();
