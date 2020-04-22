/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config();
require('pretty-error').start();

const Bull = require('bull');
const app = require('express')();
const { setQueues, UI } = require('bull-board');

// constants
const {
  config: { resources }
} = require('../package.json');

const redis = {
  host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
  db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
};

// queues
setQueues(resources.map((_resource) => new Bull(`updates:${_resource}`, { redis })));

/* execute */
app.use('/', UI);
app.listen(8082, () => console.log(`Bull Dashboard running on http://localhost:${8082}`));
