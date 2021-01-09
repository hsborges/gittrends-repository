/*
 *  Author: Hudson S. Borges
 */
import Queue from 'bull';
import express from 'express';
import consola from 'consola';
import { redisOptions } from '../redis';
import { router, setQueues, BullAdapter } from 'bull-board';

setQueues(
  ['repositories', 'users'].map(
    (queue) => new BullAdapter(new Queue(queue, { redis: redisOptions }))
  )
);

const app = express();
app.use('/', router);

const port = process.env.GITTRENDS_QUEUE_BOARD_PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
