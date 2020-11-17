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
const {
  knex,
  Metadata,
  Actor,
  Repository,
  Issue,
  PullRequest
} = require('@gittrends/database-config');

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
  const Model = res === 'issues' ? Issue : PullRequest;
  const typeName = res === 'issues' ? 'ISSUE' : 'PULL_REQUEST';

  // get queue connection
  const queue = new BeeQueue(`updates:${res}`, beeSettings);

  const promises = [];

  await Model.query()
    .leftJoin(
      Metadata.query()
        .where({ id: repoId, resource: res.slice(0, -1), key: 'updatedAt' })
        .as('metadata'),
      'metadata.id',
      `issues.id`
    )
    .where({ repository: repoId, type: typeName })
    .orWhereNull('metadata.value')
    .select(`issues.id`)
    .toKnexQuery()
    .stream((stream) =>
      stream.on('data', (record) =>
        promises.push(queue.createJob({}).setId(`d-${record.id}`).save())
      )
    );

  return Promise.all(promises).then(() => queue.close());
}

/* COMMANDS */
const resourcesParser = (resources) => {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return defaultResources;
  if (nr.length === _.intersection(nr, defaultResources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
};

const repositoriesScheduler = async (res, wait) => {
  // get queue connection
  const queue = new BeeQueue(`updates:${res}`, beeSettings);
  // find and save jobs on queue
  const before = moment().subtract(wait, 'hours').toISOString();

  // get metadata
  const jobsList = (
    await Repository.query()
      .leftJoin(
        Metadata.query()
          .where('metadata.resource', res)
          .andWhere('metadata.key', 'updatedAt')
          .as('metadata'),
        'repositories.id',
        'metadata.id'
      )
      .where('metadata.value', '<=', before)
      .orWhereNull('metadata.id')
  ).map((r) =>
    queue
      .createJob({ name: r.name_with_owner })
      .setId(r.id)
      .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10))
      .save()
  );
  // add to queue
  return Promise.all(jobsList)
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
  const before = moment().subtract(wait, 'hours').toISOString();
  // get metadata
  const usersIds = (
    await Actor.query()
      .whereNotIn('id', active.concat(waiting))
      .andWhere((builder) => builder.whereNull('_updated_at').orWhere('_updated_at', '<', before))
      .select('id')
      .limit(limit - counts.waiting)
  ).map((r) => r.id);
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
      Promise.mapSeries(resourcesParser([resource, ...other]), async (res) => {
        consola.info(`Scheduling ${res} jobs ...`);
        switch (res) {
          case 'users':
            return usersScheduler(program.wait, program.limit);
          default:
            return repositoriesScheduler(res, program.wait, program.limit);
        }
      })
        .catch((err) => consola.error(err))
        .finally(() => knex.destroy())
        .finally(() => process.exit(0))
    )
    .parse(process.argv);
} else {
  module.exports.repositories = repositoriesScheduler;
  module.exports.users = usersScheduler;
  module.exports.issues = (id) => scheduleIssueOrPullDetails('issues', id);
  module.exports.pulls = (id) => scheduleIssueOrPullDetails('pulls', id);
}
