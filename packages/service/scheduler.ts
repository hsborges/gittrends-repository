/*
 *  Author: Hudson S. Borges
 */
import dayjs from 'dayjs';
import consola from 'consola';
import BullQueue from 'bull';
import { CronJob } from 'cron';

import { each } from 'bluebird';
import { program } from 'commander';
import { difference, chunk, intersection, get } from 'lodash';
import mongoClient, { Actor, Repository } from '@gittrends/database-config';

import * as redis from './redis';
import { version, config } from './package.json';

/* COMMANDS */
function resourcesParser(resources: string[]): string[] {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return config.resources;
  if (nr.length === intersection(nr, config.resources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
}

const repositoriesScheduler = async (queue: BullQueue.Queue, resources: string[], wait = 24) => {
  // find and save jobs on queue
  let count = 0;

  return each(
    Repository.collection
      .find(
        { '_metadata.removed': { $exists: false } },
        { projection: { _id: 1, name_with_owner: 1, _metadata: 1 } }
      )
      .toArray(),
    async (data) => {
      const exclude: string[] = resources.filter((resource) => {
        const updatedAt = get(data, ['_metadata', resource, 'updatedAt']);
        return updatedAt && dayjs().subtract(wait, 'hour').isBefore(updatedAt);
      });

      const _resources = difference(resources, exclude);

      if (_resources.length) {
        count += 1;
        return queue.add(
          { id: data._id, resources: _resources },
          { jobId: (data.name_with_owner as string).toLowerCase() }
        );
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue: BullQueue.Queue, wait = 24, limit = 100000) => {
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
    chunk(usersIds, 25).map((id) => queue.add({ id }, { jobId: `users@${id[0]}+` }))
  ).then(() => consola.success(`Number of users scheduled: ${usersIds.length}`));
};

type SchedulerOptions = {
  resources: string[];
  limit?: number;
  wait?: number;
  destroyQueue?: boolean;
};

const scheduler = async (options: SchedulerOptions) => {
  consola.info(`Scheduling ${options.resources.join(', ')} ...`);

  async function prepareQueue<T>(name: string, removeOnComplete = false, removeOnFail = false) {
    const queue = new BullQueue<T>(name, {
      redis: redis.scheduler.options,
      defaultJobOptions: {
        attempts: parseInt(process.env.GITTRENDS_QUEUE_ATTEMPS ?? '3', 10),
        removeOnComplete,
        removeOnFail
      },
      settings: {
        maxStalledCount: 10
      }
    });

    await queue.clean(1000 * 60 * 60 * (options.wait || 0), 'completed');
    await queue.clean(0, 'failed');

    if (options.destroyQueue) await queue.empty();

    return queue;
  }

  // store promises running
  const promises = [];

  // schedule repositories updates
  const reposResources = options.resources.filter((r) => r !== 'users');
  if (reposResources) {
    const queue = await prepareQueue<{ id: string; resources: string[] }>('repositories', true);
    promises.push(repositoriesScheduler(queue, reposResources, options.wait));
  }

  // schedule users updates
  if (options.resources.indexOf('users') >= 0) {
    const queue = await prepareQueue<{ id: string | string[] }>('users', true, true);
    promises.push(usersScheduler(queue, options.wait, options.limit));
  }

  // await promises and finish script
  return Promise.all(promises);
};

/* Script entry point */
program
  .version(version)
  .arguments('<resource> [other_resources...]')
  .description('Schedule jobs on queue to further processing')
  .option('-w, --wait [number]', 'Waiting interval since last execution in hours', Number, 24)
  .option('-l, --limit [number]', 'Maximum number of resources to update', Number, 100000)
  .option('--cron [pattern]', 'Execute scheduler according to the pattern')
  .option('--destroy-queue', 'Destroy queue before scheduling resources')
  .action(async (resource: string, other: string[]): Promise<void> => {
    const options = program.opts();
    const resources = resourcesParser([resource, ...other]);

    // connect to database
    await mongoClient.connect();

    const schedulerFn = () =>
      scheduler({
        resources,
        limit: options.limit,
        wait: options.wait,
        destroyQueue: options.destroyQueue
      });

    // await promises and finish script
    await schedulerFn()
      .then(() =>
        options.cron
          ? new Promise(() => new CronJob(options.cron, schedulerFn, null, true, 'UTC'))
          : Promise.resolve()
      )
      .catch((err) => consola.error(err))
      .finally(() => mongoClient.close())
      .finally(() => process.exit(0));
  })
  .parse(process.argv);
