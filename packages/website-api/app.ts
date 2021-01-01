/* eslint-disable @typescript-eslint/no-floating-promises */
import { join } from 'path';
import compact from './helpers/compact';

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

  // compact responses
  server.addHook('onSend', (request, reply, payload, done) => {
    if (payload == null) done(null, payload);
    else done(null, JSON.stringify(compact(JSON.parse(payload as string))));
  });

  return server;
}
