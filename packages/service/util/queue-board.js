/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

// eslint-disable-next-line import/no-extraneous-dependencies
require('@gittrends/env-config');

const Queue = require('bull');
const app = require('express')();
const consola = require('consola');
const { router, setQueues, BullAdapter } = require('bull-board');

setQueues([
  new BullAdapter(
    new Queue('updates', {
      redis: {
        host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
        port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
        db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
      }
    })
  )
]);

app.use('/', router);

const port = parseInt(process.env.GITTRENDS_QUEUE_BOARD_PORT || 8082 || 10);
app.listen(port, () => consola.success(`Bull board running on http://localhost:${port}`));
