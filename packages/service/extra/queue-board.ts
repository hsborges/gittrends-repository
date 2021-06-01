/*
 *  Author: Hudson S. Borges
 */
import { Queue } from 'bullmq';
import express from 'express';
import consola from 'consola';
import { redisOptions } from '../redis';
const { createBullBoard } = require('bull-board');
const { BullMQAdapter } = require('bull-board/bullMQAdapter');

const { router } = createBullBoard(
  ['repositories', 'users'].map(
    (queue) => new BullMQAdapter(new Queue(queue, { connection: redisOptions }))
  )
);

const app = express();
app.use('/', router);

const port = process.env.GITTRENDS_QUEUE_BOARD_PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
