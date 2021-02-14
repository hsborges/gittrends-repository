/*
 *  Author: Hudson S. Borges
 */
import consola from 'consola';
import program from 'commander';
import mongoClient from '@gittrends/database-config';
import { bold } from 'chalk';
import { QueueScheduler, Worker, Job } from 'bullmq';

import { version } from './package.json';
import { redisOptions } from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import RepositoryUpdater, { THandler } from './updater/RepositoryUpdater';
import Cache from './updater/Cache';

type TJob = { id: string | string[]; resources: string[]; done: string[]; errors: string[] };
type TUpdaterType = 'users' | 'repositories';

async function worker(job: Job<TJob>, type: TUpdaterType, cache?: Cache): Promise<void> {
  if (type === 'users') {
    return new ActorsUpdater(job.data.id, { job }).update();
  } else {
    const id = job.data.id as string;
    const resources = job.data.resources as THandler[];
    return new RepositoryUpdater(id, resources, { job, cache }).update();
  }
}

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-t, --type [type]', 'Update "repositories" or "users"', 'repositories')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async () => {
    await mongoClient.connect();

    const options = program.opts();
    consola.info(`Updating ${options.type} using ${options.workers} workers`);

    const cache = new Cache(parseInt(process.env.GITTRENDS_CACHE_SIZE ?? '25000', 10));

    const queueScheduler = new QueueScheduler(options.type, {
      connection: redisOptions,
      maxStalledCount: Number.MAX_SAFE_INTEGER
    });

    const queue = new Worker(
      options.type,
      async (job: Job) => {
        await worker(job, options.type, cache)
          .catch((err) => {
            consola.error(`Error thrown by ${job.id}.`, (err && err.stack) || (err && err.message));
            throw err;
          })
          .finally(() => (global.gc ? global.gc() : null));
      },
      { connection: redisOptions, concurrency: options.workers }
    );

    queue.on('progress', ({ id }, progress) => {
      const bar = new Array(Math.ceil(progress / 10)).fill('=').join('').padEnd(10, '-');
      const progressStr = `${progress}`.padStart(3);
      consola[progress === 100 ? 'success' : 'info'](`[${bar}|${progressStr}%] ${bold(id)}.`);
    });

    let timeout: NodeJS.Timeout;
    process.on('SIGTERM', async () => {
      consola.warn('Signal received: closing queues');
      if (!timeout) {
        Promise.all([queue.close(), queueScheduler.close(), mongoClient.close()]).then(() =>
          process.exit(0)
        );
        timeout = setTimeout(() => process.exit(1), 10 * 1000);
      }
    });
  })
  .parse(process.argv);
