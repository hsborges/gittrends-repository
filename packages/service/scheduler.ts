/*
 *  Author: Hudson S. Borges
 */
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import consola from 'consola';

import { each } from 'bluebird';
import { program } from 'commander';
import { difference, chunk, intersection, get } from 'lodash';
import mongoClient, { Actor, Repository } from '@gittrends/database-config';

import { redisOptions } from './redis';
import { version, config } from './package.json';

/* COMMANDS */
function resourcesParser(resources: string[]): string[] {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return config.resources;
  if (nr.length === intersection(nr, config.resources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
}

const repositoriesScheduler = async (queue: Queue, resources: string[], wait = 24) => {
  // find and save jobs on queue
  let count = 0;

  return each(
    Repository.collection
      .find({}, { projection: { _id: 1, name_with_owner: 1, _metadata: 1 } })
      .toArray(),
    async (data: TObject) => {
      const exclude: string[] = resources.filter((resource) => {
        const updatedAt = get(data, ['_metadata', resource, 'updatedAt']);
        return updatedAt && dayjs().subtract(wait, 'hour').isBefore(updatedAt);
      });

      const _resources = difference(resources, exclude);

      if (_resources.length) {
        await queue.add(
          'update',
          { id: data._id, resources: _resources },
          { jobId: (data.name_with_owner as string).toLowerCase() }
        );
        count += 1;
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue: Queue, wait = 24, limit = 100000) => {
  // get jobs on queue
  const waiting = await queue
    .getJobs('waiting', 0, Number.MAX_SAFE_INTEGER)
    .then((jobs) =>
      jobs
        .filter(({ id }) => /users@.+/i.test(id as string))
        .reduce((acc, j) => acc.concat(j.data.id || []), [])
    );

  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hour').toISOString();
  // get metadata
  const usersIds = await Actor.collection
    .find(
      {
        _id: { $nin: waiting },
        $or: [
          { '_metadata.updatedAt': { $exists: false } },
          { '_metadata.updatedAt': { $lt: before } }
        ]
      },
      { projection: { _id: 1 } }
    )
    .limit(limit)
    .toArray()
    .then((users) => users.map((r: TObject) => r._id));
  // add to queue
  return Promise.all(
    chunk(usersIds, 25).map((id) => queue.add('update', { id }, { jobId: `users@${id[0]}+` }))
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
  .action(
    async (resource: string, other: string[]): Promise<void> => {
      const options = program.opts();
      const resources = resourcesParser([resource, ...other]);

      async function prepareQueue<T>(name: string, removeOnComplete = false, removeOnFail = false) {
        const queue = new Queue<T>(name, {
          connection: redisOptions,
          defaultJobOptions: {
            attempts: parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS ?? '3', 10),
            removeOnComplete,
            removeOnFail
          }
        });

        await queue.clean(1000 * 60 * 60 * options.wait, Number.MAX_SAFE_INTEGER, 'completed');
        await queue.clean(0, Number.MAX_SAFE_INTEGER, 'failed');

        if (options.destroyQueue) await queue.drain();

        return queue;
      }

      // connect to database
      await mongoClient.connect();

      // store promises running
      const promises = [];

      // schedule repositories updates
      const reposResources = resources.filter((r) => r !== 'users');
      if (reposResources) {
        const queue = await prepareQueue('repositories');
        promises.push(repositoriesScheduler(queue, reposResources, options.wait));
      }

      // schedule users updates
      if (resources.indexOf('users') >= 0) {
        const queue = await prepareQueue('users', true, true);
        promises.push(usersScheduler(queue, options.wait, options.limit));
      }

      // await promises and finish script
      await Promise.all(promises)
        .catch((err) => consola.error(err))
        .finally(() => mongoClient.close())
        .finally(() => process.exit(0));
    }
  )
  .parse(process.argv);
