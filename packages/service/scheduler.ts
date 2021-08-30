/*
 *  Author: Hudson S. Borges
 */
import dayjs from 'dayjs';
import consola from 'consola';
import BeeQueue from 'bee-queue';

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

const repositoriesScheduler = async (queue: BeeQueue, resources: string[], wait = 24) => {
  // find and save jobs on queue
  let count = 0;

  return each(
    Repository.collection
      .find({}, { projection: { _id: 1, name_with_owner: 1, _metadata: 1 } })
      .toArray(),
    async (data) => {
      const exclude: string[] = resources.filter((resource) => {
        const updatedAt = get(data, ['_metadata', resource, 'updatedAt']);
        return updatedAt && dayjs().subtract(wait, 'hour').isBefore(updatedAt);
      });

      const _resources = difference(resources, exclude);

      if (_resources.length) {
        await queue
          .createJob({ id: data._id, resources: _resources })
          .setId((data.name_with_owner as string).toLowerCase())
          .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS ?? '3', 10))
          .save();
        count += 1;
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue: BeeQueue, wait = 24, limit = 100000) => {
  // get jobs on queue
  await queue.destroy();

  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hour').toISOString();
  // get metadata
  const usersIds = await Actor.collection
    .find(
      {
        $or: [
          { '_metadata.updatedAt': { $exists: false } },
          { '_metadata.updatedAt': { $lt: before } }
        ]
      },
      { projection: { _id: 1 } }
    )
    .limit(limit)
    .toArray()
    .then((users) => users.map((r) => r._id));
  // add to queue
  return Promise.all(
    chunk(usersIds, 25).map((id) =>
      queue
        .createJob({ id })
        .setId(`users@${id[0]}+`)
        .retries(parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS ?? '3', 10))
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
  .action(async (resource: string, other: string[]): Promise<void> => {
    const options = program.opts();
    const resources = resourcesParser([resource, ...other]);

    async function prepareQueue<T>(name: string, removeOnComplete = false, removeOnFail = false) {
      const queue = new BeeQueue<T>(name, {
        redis: redisOptions,
        isWorker: false,
        getEvents: false,
        sendEvents: false,
        removeOnSuccess: removeOnComplete,
        removeOnFailure: removeOnFail
      });

      await (options.destroyQueue
        ? queue.destroy()
        : Promise.all(
            ['succeeded', 'failed'].map((type) =>
              queue
                .getJobs(type, { size: Number.MAX_SAFE_INTEGER })
                .then((jobs) => Promise.all(jobs.map((job) => job.remove())))
            )
          ));

      return queue;
    }

    // connect to database
    await mongoClient.connect();

    // store promises running
    const promises = [];

    // schedule repositories updates
    const reposResources = resources.filter((r) => r !== 'users');
    if (reposResources) {
      const queue = await prepareQueue<{ id: string; resources: string[] }>('repositories');
      promises.push(repositoriesScheduler(queue, reposResources, options.wait));
    }

    // schedule users updates
    if (resources.indexOf('users') >= 0) {
      const queue = await prepareQueue<{ id: string | string[] }>('users', true, true);
      promises.push(usersScheduler(queue, options.wait, options.limit));
    }

    // await promises and finish script
    await Promise.all(promises)
      .catch((err) => consola.error(err))
      .finally(() => mongoClient.close())
      .finally(() => process.exit(0));
  })
  .parse(process.argv);
