/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const _ = require('lodash');
const moment = require('moment');
const consola = require('consola');
const BeeQueue = require('bee-queue');

const { program } = require('commander');
const { mongo } = require('@gittrends/database-config');

const {
  config: { resources: defaultResources },
  version
} = require('./package.json');

// queue connection options
const beeSettings = {
  redis: {
    host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
    port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
    db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
  },
  isWorker: false,
  getEvents: false,
  sendEvents: false,
  storeJobs: false,
  removeOnSuccess: true,
  removeOnFailure: true
};

async function scheduleIssueOrPullDetails(res, repoId) {
  const cursor = await mongo[res].aggregate(
    [
      ...(repoId ? [{ $match: { repository: repoId } }] : []),
      { $match: { '_meta.updated_at': { $exists: false } } },
      { $project: { _id: 1 } }
    ],
    { allowDiskUse: true }
  );

  // get queue connection
  const queue = new BeeQueue(`updates:${res}`, beeSettings);

  const promises = [];
  let record = null;

  // eslint-disable-next-line no-cond-assign
  while ((record = await cursor.next())) {
    promises.push(queue.createJob({}).setId(`d-${record._id}`).save());
  }

  return Promise.all(promises).then(() => queue.close());
}

/* COMMANDS */
const resourcesParser = (resources) => {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return defaultResources;
  if (nr.length === _.intersection(nr, defaultResources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
};

const repositoriesScheduler = async (res, wait, limit = 10000) => {
  // get queue connection
  const queue = new BeeQueue(`updates:${res}`, beeSettings);
  // find and save jobs on queue
  const prefix = res === 'repos' ? '_meta' : `_meta.${res}`;
  const before = moment().subtract(wait, 'hours').toDate();
  // get metadata
  const jobsList = (
    await mongo.repositories
      .aggregate(
        [
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
              name_with_owner: 1
            }
          }
        ],
        { allowDiskUse: true }
      )
      .toArray()
  ).map((r) =>
    queue
      .createJob({ name: r.name_with_owner })
      .setId(r._id)
      .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10))
      .save()
  );
  // add to queue
  return Promise.all(jobsList)
    .then(async () => {
      if (['issues', 'pulls'].indexOf(res) < 0) return null;
      return scheduleIssueOrPullDetails(res);
    })
    .then(async () => consola.success(`Number of ${res} scheduled: ${jobsList.length}`))
    .finally(() => queue.close());
};

const usersScheduler = async (wait, limit = 100000) => {
  // get queue connection
  const queue = new BeeQueue('updates:users', beeSettings);
  // throws an error when there is more than 1k jobs waiting
  const counts = await queue.checkHealth();
  if (counts.waiting > 1000)
    throw new Error('There are already more than 1k users batch jobs scheduled!');
  // get jobs on queue
  const waiting = await queue
    .getJobs('waiting', { size: Number.MAX_SAFE_INTEGER })
    .then((jobs) => jobs.map((job) => job.data.ids).reduce((acc, u) => acc.concat(u), []));
  const active = await queue
    .getJobs('active', { size: Number.MAX_SAFE_INTEGER })
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
  return Promise.all(
    _.chunk(usersIds, 50).map((ids) =>
      queue
        .createJob({ ids })
        .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10))
        .save()
    )
  )
    .then(() => consola.success(`Number of users scheduled: ${usersIds.length}`))
    .finally(() => queue.close());
};

/* Script entry point */
if (require.main === module) {
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
            consola.info(`Scheduling ${res} jobs ...`);
            switch (res) {
              case 'users':
                return usersScheduler(program.wait, program.limit);
              default:
                return repositoriesScheduler(res, program.wait, program.limit);
            }
          })
        )
        .catch((err) => consola.error(err))
        .finally(() => mongo.disconnect())
        .finally(() => process.exit(0))
    )
    .parse(process.argv);
} else {
  module.exports.repositories = repositoriesScheduler;
  module.exports.users = usersScheduler;
  module.exports.issues = (id) => scheduleIssueOrPullDetails('issues', id);
  module.exports.pulls = (id) => scheduleIssueOrPullDetails('pulls', id);
}
