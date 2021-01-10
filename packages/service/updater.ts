/*
 *  Author: Hudson S. Borges
 */
import Bull, { Job } from 'bull';
import consola from 'consola';
import program from 'commander';
import retry from 'retry';

import { version } from './package.json';
import { redisOptions } from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import Updater from './updater/Updater';
import RepositoryUpdater from './updater/RepositoryUpdater';
import Cache from './updater/Cache';

async function retriableWorker(job: Job, type: string, cache?: Cache) {
  const options = { retries: 3, minTimeout: 1000, maxTimeout: 5000, randomize: true };
  const operation = retry.operation(options);

  return new Promise((resolve, reject) => {
    let updater: Updater;

    if (type === 'users') {
      updater = new ActorsUpdater(job.data.id ?? job.data.ids);
    } else if (type === 'repositories') {
      updater = new RepositoryUpdater(job.data.id, job.data.resources, { job, cache });
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
    const queue = new Bull(program.type, { redis: redisOptions });

    queue.process('*', program.workers, (job) =>
      retriableWorker(job, program.type, cache)
        .then(() => consola.success(`[${job.id}] finished!`))
        .catch((err) => {
          consola.error(`Error thrown by ${job.id}.`, err);
          throw err;
        })
        .finally(() => (global.gc ? global.gc() : null))
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
