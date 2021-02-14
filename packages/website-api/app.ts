/* eslint-disable @typescript-eslint/no-floating-promises */
import { join } from 'path';

import cors from 'fastify-cors';
import helmet from 'fastify-helmet';
import AutoLoad from 'fastify-autoload';
import fastify, { FastifyInstance, FastifyServerFactory } from 'fastify';

import compact from './helpers/compact';

export default function (serverFactory?: FastifyServerFactory): FastifyInstance {
  const server: FastifyInstance = fastify({ logger: true, serverFactory });

  server.register(helmet);
  server.register(cors);

  // This loads all plugins defined in routes
  server.register(AutoLoad, { dir: join(__dirname, 'routes') });

  server.addHook('preSerialization', async (request, reply, payload) => compact(payload));

  return server;
}
