/*
 *  Author: Hudson S. Borges
 */
import consola from 'consola';
import program from 'commander';
import retry from 'retry';
import { bold } from 'chalk';
import { QueueScheduler, Worker, Job } from 'bullmq';

import { version } from './package.json';
import { redisOptions } from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import Updater from './updater/Updater';
import RepositoryUpdater, { THandler } from './updater/RepositoryUpdater';
import Cache from './updater/Cache';

type TJob = { id: string | string[]; resources: string[]; done: string[]; errors: string[] };

async function retriableWorker(job: Job<TJob>, type: string, cache?: Cache) {
  const options = { retries: 3, minTimeout: 1000, maxTimeout: 5000, randomize: true };
  const operation = retry.operation(options);

  return new Promise((resolve, reject) => {
    let updater: Updater;

    if (type === 'users') {
      updater = new ActorsUpdater(job.data.id);
    } else if (type === 'repositories') {
      const id = job.data.id as string;
      const resources = job.data.resources as THandler[];
      updater = new RepositoryUpdater(id, resources, { job, cache });
    }

    operation.attempt(() =>
      updater
        .update()
        .then(() => resolve(null))
        .catch((err) => {
          if (err.message && /recovery.mode|rollback/gi.test(err.message) && operation.retry(err))
            return null;
          else reject(operation.mainError() ?? err);
        })
    );
  });
}

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-t, --type [type]', 'Update "repositories" or "users"', 'repositories')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async () => {
    consola.info(`Updating ${program.type} using ${program.workers} workers`);

    const cache = new Cache(process.env.GITTRENDS_CACHE_SIZE ?? 25000);
    const queueScheduler = new QueueScheduler(program.type, {
      connection: redisOptions,
      maxStalledCount: Number.MAX_SAFE_INTEGER
    });

    const queue = new Worker(
      program.type,
      (job: Job) =>
        retriableWorker(job, program.type, cache)
          .catch((err) => {
            consola.error(`Error thrown by ${job.id}.`, (err && err.stack) || (err && err.message));
            throw err;
          })
          .finally(() => (global.gc ? global.gc() : null)),
      { connection: redisOptions, concurrency: program.workers }
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
        Promise.all([queue.close(), queueScheduler.close()]).then(() => process.exit(0));
        timeout = setTimeout(() => process.exit(1), 10 * 1000);
      }
    });
  })
  .parse(process.argv);
