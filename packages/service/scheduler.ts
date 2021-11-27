/*
 *  Author: Hudson S. Borges
 */
import { each } from 'bluebird';
import { Queue } from 'bullmq';
import { program } from 'commander';
import consola from 'consola';
import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { difference, chunk, intersection, get } from 'lodash';

import mongoClient, { Actor, MongoRepository, Repository } from '@gittrends/database-config';

import { version, config } from './package.json';
import { createRedisConnection } from './redis';

/* COMMANDS */
function resourcesParser(resources: string[]): string[] {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return config.resources;
  if (nr.length === intersection(nr, config.resources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
}

const repositoriesScheduler = async (
  queue: Queue<RepositoryJob>,
  resources: string[],
  wait = 24
) => {
  // find and save jobs on queue
  let count = 0;

  return each(
    MongoRepository.get(Repository)
      .collection.find(
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
        await queue
          .getJob((data.name_with_owner as string).toLowerCase())
          .then(async (job) => !(await job?.isActive()) && job?.remove());
        await queue.add(
          '__default__',
          { id: data._id.toString(), resources: _resources, excluded: exclude },
          { jobId: (data.name_with_owner as string).toLowerCase() }
        );
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue: Queue<UsersJob>, wait = 24, limit = 100000) => {
  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hour').toISOString();
  // get metadata
  const usersIds = await MongoRepository.get(Actor)
    .collection.find(
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
    .then((users) => users.map((r) => r._id.toString()));
  // add to queue
  return Promise.all(
    chunk(usersIds, 25).map((id) => queue.add('__default__', { id }, { jobId: `users@${id[0]}+` }))
  ).then(() => consola.success(`Number of users scheduled: ${usersIds.length}`));
};

type SchedulerOptions = {
  resources: string[];
  limit?: number;
  wait?: number;
  destroyQueue?: boolean;
};

type RepositoryJob = {
  id: string;
  resources: string[];
  done?: string[];
  errors?: string[];
  excluded?: string[];
};

type UsersJob = {
  id: string | string[];
};

const scheduler = async (options: SchedulerOptions) => {
  consola.info(`Scheduling ${options.resources.join(', ')} ...`);

  async function prepareQueue<T>(name: string, removeOnComplete = false, removeOnFail = false) {
    const queue = new Queue<T>(name, {
      connection: createRedisConnection('scheduler'),
      sharedConnection: true,
      defaultJobOptions: { attempts: 3, removeOnComplete, removeOnFail }
    });

    if (options.destroyQueue) {
      await Promise.all([
        queue.clean(0, Number.MAX_SAFE_INTEGER, 'completed'),
        queue.clean(0, Number.MAX_SAFE_INTEGER, 'failed'),
        queue.drain(true)
      ]);
    }

    return queue;
  }

  // store promises running
  const promises = [];

  // schedule repositories updates
  const reposResources = options.resources.filter((r) => r !== 'users');

  let queue: Queue;

  if (reposResources) {
    queue = await prepareQueue<RepositoryJob>('repositories');
    promises.push(repositoriesScheduler(queue, reposResources, options.wait));
  }

  // schedule users updates
  if (options.resources.indexOf('users') >= 0) {
    queue = await prepareQueue<UsersJob>('users', true);
    promises.push(usersScheduler(queue, options.wait, options.limit));
  }

  // await promises and finish script
  return Promise.all(promises).finally(() => queue.close());
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
          ? new Promise(() => new CronJob(options.cron, schedulerFn, null, true))
          : Promise.resolve()
      )
      .catch((err) => consola.error(err))
      .finally(() => mongoClient.close())
      .finally(() => process.exit(0));
  })
  .parse(process.argv);
