/*
 *  Author: Hudson S. Borges
 */
import Bee from 'bee-queue';
import Arena from 'bull-arena';
import consola from 'consola';
import express from 'express';

import { connectionOptions } from '../redis';

const app = express();

const arena = Arena(
  {
    Bee,
    queues: ['repositories', 'users'].map((source) => ({
      type: 'bee',
      name: source,
      hostId: source,
      redis: connectionOptions('scheduler')
    }))
  },
  { disableListen: true }
);

app.use('/', arena);

const port = process.env.PORT || 8082;
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
