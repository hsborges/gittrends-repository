/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const Bull = require('bull');
const program = require('commander');

// constants
const {
  config: { resources: DEFAULT_RESOURCES }
} = require('../package.json');

const redis = {
  host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
  db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
};

const resourceParser = (resource) => {
  if (DEFAULT_RESOURCES.indexOf(resource.toLowerCase()) >= 0) return resource.toLowerCase();
  throw new Error("Invalid 'resource' argument values!");
};

/* execute */
program
  .arguments('<resource> [otherResources...]')
  .description('Remove all jobs from the processing queues')
  .action((queue, otherQueues) =>
    Promise.all(
      (queue.toLowerCase() === 'all'
        ? DEFAULT_RESOURCES
        : [queue, ...(otherQueues || [])].map(resourceParser)
      ).map(async (name) => {
        const bq = new Bull(`updates:${name}`, { redis });
        return Promise.all([bq.empty(), bq.clean(0)]);
      })
    ).then(() => process.exit(0))
  )
  .parse(process.argv);
