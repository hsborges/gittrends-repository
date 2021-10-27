/*
 *  Author: Hudson S. Borges
 */
import { PrismaClient } from '@prisma/client';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express, { Express, RequestHandler } from 'express';
import morgan from 'morgan';

import actorRouter from './routes/actor.routes';
import githubRouter from './routes/github.routes';
import mainRouter from './routes/main.routes';
import repositoryRouter from './routes/repository.routes';

export const prisma = new PrismaClient();

export function configureApp(): Express {
  const app = express();

  app.use(compression());
  app.use(cors());
  app.use(json() as RequestHandler);
  app.use(urlencoded({ extended: true }) as RequestHandler);
  app.use(morgan('tiny') as RequestHandler);

  app.use('/', mainRouter);
  app.use('/user', actorRouter);
  app.use('/repo', repositoryRouter);
  app.use('/github', githubRouter);

  return app;
}
