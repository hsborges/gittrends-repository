/*
 *  Author: Hudson S. Borges
 */
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import consola from 'consola';
import express from 'express';

import * as redis from '../redis';

const app = express();
const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: ['repositories', 'users'].map(
    (queue) =>
      new BullMQAdapter(
        new Queue(queue, { connection: redis.scheduler.options, sharedConnection: true })
      )
  ),
  serverAdapter
});

app.use('/', serverAdapter.getRouter());

const port = process.env.PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
