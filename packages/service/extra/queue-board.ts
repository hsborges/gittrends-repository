/*
 *  Author: Hudson S. Borges
 */
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import consola from 'consola';
import express from 'express';
import ip from 'ip';

import { REDIS_CONNECTION } from '../redis';

const port = process.env.PORT || 8082;
const ipAddress = ip.address();

const app = express();
const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: ['repositories', 'users'].map(
    (source) => new BullMQAdapter(new Queue(source, { connection: REDIS_CONNECTION }))
  ),
  serverAdapter: serverAdapter
});

app.use('/', serverAdapter.getRouter());

app.listen({ port, host: ipAddress }, () =>
  consola.success(`Bull board running on http://${ipAddress}:${port}`)
);
