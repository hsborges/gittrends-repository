/*
 *  Author: Hudson S. Borges
 */
import express from 'express';
import consola from 'consola';
import BullQueue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { redisOptions } from '../redis';

const app = express();
const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: ['repositories', 'users'].map(
    (queue) => new BullAdapter(new BullQueue(queue, { redis: redisOptions }))
  ),
  serverAdapter
});

app.use('/', serverAdapter.getRouter());

const port = process.env.GITTRENDS_QUEUE_BOARD_PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
