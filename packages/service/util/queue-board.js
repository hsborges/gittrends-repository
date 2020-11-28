/*
 *  Author: Hudson S. Borges
 */
// eslint-disable-next-line import/no-extraneous-dependencies
require('@hsborges/env-config');

// Mandatory import of queue library.
const Bee = require('bee-queue');
const Arena = require('bull-arena');
const { capitalize } = require('lodash');

// constants
const {
  config: { resources }
} = require('../package.json');

// queues
Arena(
  {
    Bee,
    queues: resources.map((_resource) => ({
      name: `updates:${_resource}`,
      hostId: capitalize(_resource),
      redis: {
        host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
        port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
        db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
      },
      type: 'bee',
      prefix: 'bq'
    }))
  },
  { port: process.env.GITTRENDS_QUEUE_BOARD_PORT }
);
