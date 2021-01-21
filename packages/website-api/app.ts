/* eslint-disable @typescript-eslint/no-floating-promises */
import { join } from 'path';

import cors from 'fastify-cors';
import helmet from 'fastify-helmet';
import AutoLoad from 'fastify-autoload';
import fastify, { FastifyInstance } from 'fastify';

export default function (): FastifyInstance {
  const server: FastifyInstance = fastify({ logger: true });

  server.register(helmet);
  server.register(cors);

  // This loads all plugins defined in routes
  server.register(AutoLoad, { dir: join(__dirname, 'routes') });

  return server;
}
