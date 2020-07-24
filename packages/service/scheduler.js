/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const _ = require('lodash');
const moment = require('moment');
const Bull = require('bull');
const { program } = require('commander');
const { mongo } = require('@monorepo/database-config');

const {
  config: { resources: defaultResources },
  version
} = require('./package.json');

// queue connection options
const bullOptions = {
  redis: {
    host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
    port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
    db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
  },
  defaultJobOptions: {
    attempts: parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10)
  },
  settings: {
    stalledInterval: 60000,
    maxStalledCount: 25
  }
};

/* COMMANDS */
const resourcesParser = (resources) => {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return defaultResources;
  if (nr.length === _.intersection(nr, defaultResources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
};

const repositoriesScheduler = async (res, wait, limit = 10000) => {
  // get queue connection
  const queue = new Bull(`updates:${res}`, bullOptions);
  // get jobs on queue
  const waiting = await queue
    .getWaiting(0, Number.MAX_SAFE_INTEGER)
    .then((jobs) => jobs.map((job) => job.id));
  const active = await queue
    .getActive(0, Number.MAX_SAFE_INTEGER)
    .then((jobs) => jobs.map((job) => job.id));
  // find and save jobs on queue
  const prefix = res === 'repos' ? '_meta' : `_meta.${res}`;
  const before = moment().subtract(wait, 'hours').toDate();
  // get metadata
  const jobsMetadata = (
    await mongo.repositories
      .aggregate(
        [
          { $match: { _id: { $nin: [...waiting, ...active] } } },
          { $match: { '_meta.removed': { $ne: true } } },
          {
            $match: {
              $or: [
                { [`${prefix}.updated_at`]: { $exists: false } },
                { [`${prefix}.updated_at`]: { $eq: null } },
                { [`${prefix}.updated_at`]: { $lt: before } }
              ]
            }
          },
          { $sort: { [`${prefix}.updated_at`]: 1 } },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name_with_owner: 1,
              [`${prefix}.updated_at`]: 1
            }
          }
        ],
        { allowDiskUse: true }
      )
      .toArray()
  ).map((r) => ({
    id: r._id,
    name: r.name_with_owner,
    updated_at: _.get(r, `${prefix}.updated_at`)
  }));
  // clean completed and failed queues
  await Promise.all([
    queue.clean(wait * 60 * 60 * 1000, 'completed'),
    queue.clean(wait * 60 * 60 * 1000, 'failed')
  ]);
  // add to queue
  return Promise.mapSeries(jobsMetadata, (meta) =>
    queue.add(`${res}@${meta.name}`, null, {
      jobId: meta.id,
      priority: !meta.updated_at ? 1 : undefined
    })
  )
    .then(() => console.log(`Number of ${res} scheduled: ${jobsMetadata.length}`))
    .finally(() => queue.close());
};

const usersScheduler = async (wait, limit = 100000) => {
  // get queue connection
  const queue = new Bull('updates:users', bullOptions);
  // throws an error when there is more than 1k jobs waiting
  if ((await queue.getWaitingCount()) > 1000)
    throw new Error('There are already more than 1k users batch jobs scheduled!');
  // get jobs on queue
  const waiting = await queue
    .getWaiting(0, Number.MAX_SAFE_INTEGER)
    .then((jobs) => jobs.map((job) => job.data.ids).reduce((acc, u) => acc.concat(u), []));
  const active = await queue
    .getActive(0, Number.MAX_SAFE_INTEGER)
    .then((jobs) => jobs.map((job) => job.data.ids).reduce((acc, u) => acc.concat(u), []));
  // find and save jobs on queue
  const before = moment().subtract(wait, 'hours').toDate();
  // get metadata
  const usersIds = (
    await mongo.users
      .aggregate(
        [
          { $match: { _id: { $nin: [...waiting, ...active] } } },
          { $match: { '_meta.removed': { $ne: true } } },
          {
            $match: {
              $or: [
                { '_meta.updated_at': { $exists: false } },
                { '_meta.updated_at': { $eq: null } },
                { '_meta.updated_at': { $lt: before } }
              ]
            }
          },
          { $limit: limit },
          { $project: { _id: 1 } }
        ],
        { allowDiskUse: true }
      )
      .toArray()
  ).map((r) => r._id);
  // add to queue
  return Promise.map(_.chunk(usersIds, 50), (ids) =>
    queue.add(
      `users-bucket@${ids[0]}+`,
      { ids },
      {
        jobId: ids[0],
        removeOnComplete: true,
        removeOnFail: true
      }
    )
  )
    .then(() => console.log(`Number of users scheduled: ${usersIds.length}`))
    .finally(() => queue.close());
};

/* Script entry point */
program
  .version(version)
  .arguments('<resource> [other_resources...]')
  .description('Schedule jobs on queue to further processing')
  .option('-w, --wait [number]', 'Waiting interval since last execution in hours', Number, 24)
  .option('-l, --limit [number]', 'Maximum number of resources to update', Number, 100000)
  .action(async (resource, other) =>
    mongo
      .connect()
      .then(() =>
        Promise.mapSeries(resourcesParser([resource, ...other]), async (res) => {
          console.log(`Scheduling ${res} jobs ...`);
          switch (res) {
            case 'users':
              return usersScheduler(program.wait, program.limit);
            default:
              return repositoriesScheduler(res, program.wait, program.limit);
          }
        })
      )
      .catch((err) => console.error(err))
      .finally(() => mongo.disconnect())
      .finally(() => process.exit(0))
  )
  .parse(process.argv);
