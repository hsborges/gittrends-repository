/*
 *  Author: Hudson S. Borges
 */
import express from 'express';
import consola from 'consola';
import { redisOptions } from '../redis';
import Arena from 'bull-arena';
import BeeQueue from 'bee-queue';

const app = express();
app.use(
  '/',
  Arena(
    {
      Bee: BeeQueue,
      queues: ['repositories', 'users'].map((name) => ({
        type: 'bee',
        name,
        hostId: name,
        redis: redisOptions
      }))
    },
    { basePath: '/', disableListen: true }
  )
);

const port = process.env.GITTRENDS_QUEUE_BOARD_PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
