/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const Bull = require('bull');
const app = require('express')();
const { setQueues, UI } = require('bull-board');

// constants
const {
  config: { resources }
} = require('../package.json');

// queues
setQueues(
  resources.map(
    (_resource) =>
      new Bull(`updates:${_resource}`, {
        redis: {
          host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
          port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
          db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
        }
      })
  )
);

console.log(require('path').resolve(__dirname, '../../../.env'));

/* execute */
app.use('/', UI);
app.listen(process.env.BULL_BOARD_PORT || 8081, () =>
  console.log(`Bull Dashboard running on http://localhost:${process.env.BULL_BOARD_PORT || 8081}`)
);
