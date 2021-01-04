/*
 *  Author: Hudson S. Borges
 */
import Bull, { Job } from 'bull';
import async from 'async';
import consola from 'consola';
import program from 'commander';
import retry from 'retry';

import { version } from './package.json';

import { redisOptions } from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import Updater from './updater/Updater';

function getUpdater(job: Job, type: string): Updater {
  switch (type) {
    case 'users':
      return new ActorsUpdater(job.data.id || job.data.ids);
    default:
      throw new Error(`Updater not avaliable for ${type}.`);
  }
}

async function retriableWorker(job: Job, type: string) {
  const options = { retries: 5, minTimeout: 1000, maxTimeout: 5000, randomize: true };
  const operation = retry.operation(options);

  return new Promise((resolve, reject) => {
    operation.attempt(() =>
      getUpdater(job, type)
        .update()
        .then(() => resolve(null))
        .catch((err) => {
          if (err.message && /recovery.mode|rollback/gi.test(err.message) && operation.retry(err))
            return null;
          else reject(operation.mainError() || err);
        })
    );
  })
    .then(() => consola.success(`[${job.id}] finished!`))
    .catch((err) => {
      consola.error(err);
      throw err;
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

    const queue = new Bull(program.type, {
      redis: redisOptions,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true
      }
    });

    const workersQueue = async.priorityQueue<Job>(async (job) => {
      await retriableWorker(job, program.type).catch((err) => {
        consola.error(`Error thrown by ${job.id}.`);
        consola.error(err);
        throw err;
      });

      if (global.gc) global.gc();
    }, program.workers);

    queue.process('*', program.workers, (job, done) =>
      workersQueue.push(job, job.opts.priority || 1, done)
    );

    let timeout: NodeJS.Timeout;
    process.on('SIGTERM', async () => {
      consola.warn('Signal received: closing queues');
      if (!timeout) {
        await queue.close().then(() => process.exit(0));
        timeout = setTimeout(() => process.exit(1), 30 * 1000);
      }
    });
  })
  .parse(process.argv);
