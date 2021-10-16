/*
 *  Author: Hudson S. Borges
 */
import { PrismaClient } from '@prisma/client';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express, { Express, RequestHandler } from 'express';

import actorRouter from './routes/actor.routes';
import githubRouter from './routes/github.routes';
import repositoryRouter from './routes/repository.routes';

export const prisma = new PrismaClient();

export function configureApp(): Express {
  const app = express();

  app.use(compression());
  app.use(cors());
  app.use(json() as RequestHandler);
  app.use(urlencoded({ extended: true }) as RequestHandler);

  app.use('/user', actorRouter);
  app.use('/repo', repositoryRouter);
  app.use('/github', githubRouter);

  return app;
}
