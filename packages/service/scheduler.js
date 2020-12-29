/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const Bull = require('bull');
const dayjs = require('dayjs');
const consola = require('consola');
const db = require('@gittrends/database-config');

const { program } = require('commander');
const { difference, chunk, intersection } = require('lodash');

const {
  config: { resources: defaultResources },
  version
} = require('./package.json');

/* COMMANDS */
const resourcesParser = (resources) => {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return defaultResources;
  if (nr.length === intersection(nr, defaultResources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
};

const repositoriesScheduler = async (queue, resources, wait) => {
  // find and save jobs on queue
  let count = 0;

  return Promise.each(
    db.Repository.query().select(['id', 'updated_at', 'name_with_owner']),
    async (data) => {
      const exclude = (await db.Metadata.query().where({ id: data.id, key: 'updatedAt' }))
        .filter((data) => dayjs().subtract(wait, 'hours').isBefore(data.value))
        .map((data) => data.resource);

      const _resources = difference(resources, exclude);

      if (_resources.length) {
        await queue.add(
          { id: data.id, resources: _resources },
          { jobId: data.name_with_owner.toLowerCase() }
        );
        count += 1;
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue, wait, limit = 100000) => {
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
      .leftJoin(
        db.Metadata.query()
          .where({ resource: 'actor', key: 'updatedAt' })
          .select('id', 'value')
          .as('metadata'),
        'metadata.id',
        'actors.id'
      )
      .whereNotIn('actors.id', waiting)
      .andWhere((builder) =>
        builder.whereNull('metadata.id').orWhere('metadata.value', '<', before)
      )
      .select('actors.id')
      .limit(limit)
  ).map((r) => r.id);
  // add to queue
  return Promise.all(
    chunk(usersIds, 10).map((ids) => queue.add({ ids }, { jobId: `users@${ids[0]}+` }))
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
    const resources = resourcesParser([resource, ...other]);

    async function prepareQueue(name) {
      const queue = new Bull(name, {
        redis: {
          host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
          port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
          db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
        },
        settings: { maxStalledCount: 5 },
        defaultOptions: {
          attempts: parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS || 3, 10),
          removeOnComplete: true,
          removeOnFail: true
        }
      });

      await queue.clean(1000 * 60 * 60 * program.wait, 'completed');
      await queue.clean(0, 'failed');

      if (program.destroyQueue) await queue.empty();

      return queue;
    }

    // store promises running
    const promises = [];

    // schedule repositories updates
    const reposResources = resources.filter((r) => r !== 'users');
    if (reposResources) {
      const queue = await prepareQueue('repositories');
      promises.push(repositoriesScheduler(queue, reposResources, program.wait));
    }

    // schedule users updates
    if (resources.indexOf('users') >= 0) {
      const queue = await prepareQueue('users');
      promises.push(usersScheduler(queue, program.wait, program.limit));
    }

    // await promises and finish script
    return Promise.all(promises)
      .catch((err) => consola.error(err))
      .finally(() => db.knex.destroy())
      .finally(() => process.exit(0));
  })
  .parse(process.argv);
