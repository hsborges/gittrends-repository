/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const redis = require('redis');
const dayjs = require('dayjs');
const consola = require('consola');
const BeeQueue = require('bee-queue');
const db = require('@gittrends/database-config');

const { program } = require('commander');
const { chunk, intersection } = require('lodash');

const {
  config: { resources: defaultResources },
  version
} = require('./package.json');

// queue connection
const queue = new BeeQueue('updates', {
  redis: redis.createClient({
    host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
    port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
    db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
  }),
  isWorker: false,
  getEvents: false,
  sendEvents: false,
  storeJobs: false,
  removeOnSuccess: true,
  removeOnFailure: true
});

/* COMMANDS */
const resourcesParser = (resources) => {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return defaultResources;
  if (nr.length === intersection(nr, defaultResources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
};

const repositoriesScheduler = async (res, wait) => {
  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hours').toISOString();

  // get metadata
  const jobsList = (
    await db.Repository.query()
      .leftJoin(
        db.Metadata.query()
          .whereIn('metadata.key', ['updatedAt', 'pending'])
          .andWhere('metadata.resource', res)
          .as('metadata'),
        'repositories.id',
        'metadata.id'
      )
      .where((builder) =>
        builder.where('metadata.key', 'updatedAt').andWhere('metadata.value', '<=', before)
      )
      .orWhere((builder) =>
        builder.where('metadata.key', 'pending').andWhere('metadata.value', '<>', '0')
      )
      .orWhereNull('metadata.id')
      .distinct(['repositories.id', 'repositories.name_with_owner'])
  ).map((r) =>
    queue
      .createJob({ name: r.name_with_owner })
      .setId(`${res}@${r.id}`)
      .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10))
      .save()
  );
  // add to queue
  return Promise.all(jobsList).then(async () =>
    consola.success(`Number of ${res} scheduled: ${jobsList.length}`)
  );
};

const usersScheduler = async (wait, limit = 100000) => {
  // get jobs on queue
  const waiting = await queue
    .getJobs('waiting', { size: Number.MAX_SAFE_INTEGER })
    .then((jobs) =>
      jobs.filter(({ id }) => /users@.+/i.test(id)).reduce((acc, j) => acc.concat(j.data.ids), [])
    );
  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hours').toISOString();
  // get metadata
  const usersIds = (
    await db.Actor.query()
      .whereNotIn('id', waiting)
      .andWhere((builder) => builder.whereNull('_updated_at').orWhere('_updated_at', '<', before))
      .select('id')
      .limit(limit)
  ).map((r) => r.id);
  // add to queue
  return Promise.all(
    chunk(usersIds, 50).map((ids) =>
      queue
        .createJob({ ids })
        .setId(`users@${ids[0]}+`)
        .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10))
        .save()
    )
  ).then(() => consola.success(`Number of users scheduled: ${usersIds.length}`));
};

/* Script entry point */
program
  .version(version)
  .arguments('<resource> [other_resources...]')
  .description('Schedule jobs on queue to further processing')
  .option('-w, --wait [number]', 'Waiting interval since last execution in hours', Number, 24)
  .option('-l, --limit [number]', 'Maximum number of resources to update', Number, 100000)
  .option('--destroy-queue', 'Destroy queue before scheduling resources')
  .action(async (resource, other) => {
    if (program.destroyQueue) await queue.destroy();

    return Promise.map(resourcesParser([resource, ...other]), async (res) => {
      consola.info(`Scheduling ${res} jobs ...`);
      switch (res) {
        case 'users':
          return usersScheduler(program.wait, program.limit);
        default:
          return repositoriesScheduler(res, program.wait, program.limit);
      }
    })
      .catch((err) => consola.error(err))
      .finally(() => db.knex.destroy())
      .finally(() => queue.close())
      .finally(() => process.exit(0));
  })
  .parse(process.argv);
