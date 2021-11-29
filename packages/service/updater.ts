/*
 *  Author: Hudson S. Borges
 */
import axios from 'axios';
import Queue from 'bee-queue';
import { bold, dim } from 'chalk';
import { program, Option } from 'commander';
import consola from 'consola';

import mongoClient, { MongoRepository, ErrorLog } from '@gittrends/database-config';

import { RepositoryUpdateError } from './helpers/errors';
import { version } from './package.json';
import { connectionOptions } from './redis';
import { ActorsUpdater } from './updater/ActorUpdater';
import { Cache } from './updater/Cache';
import { RepositoryUpdater, RepositoryUpdaterHandler } from './updater/RepositoryUpdater';

async function proxyServerHealthCheck(): Promise<boolean> {
  const protocol = process.env.GT_PROXY_PROTOCOL ?? 'http';
  const host = process.env.GT_PROXY_HOST ?? 'localhost';
  const port = parseInt(process.env.GT_PROXY_PORT ?? '3000', 10);
  return axios
    .get(`${protocol}://${host}:${port}/status`, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
}

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .addOption(
    new Option('-t, --type [type]', 'Update "repositories" or "users"')
      .choices(['repositories', 'users'])
      .default('repositories')
  )
  .action(async () => {
    if (!(await proxyServerHealthCheck())) {
      consola.error('Proxy server not responding, exiting ...');
      process.exit(1);
    }

    await mongoClient.connect();

    const options = program.opts();
    consola.info(`Updating ${options.type} using ${options.workers} workers`);

    const queue = new Queue(options.type, {
      storeJobs: false,
      redis: connectionOptions('scheduler')
    });

    queue.checkStalledJobs(5000);

    queue.process(options.workers, async (job) => {
      const cache = new Cache(parseInt(process.env.GT_CACHE_SIZE ?? '1000', 10));

      try {
        if (options.type === 'users') {
          return new ActorsUpdater(job.data.id, { job }).update();
        } else if (options.type === 'repositories') {
          const resources = (job.data.resources || []) as RepositoryUpdaterHandler[];
          if (job.data?.errors?.length)
            resources.push(...(job.data.errors as RepositoryUpdaterHandler[]));
          if (resources.length)
            return new RepositoryUpdater(job.data.id, resources, { job, cache }).update();
        } else {
          consola.error(new Error('Invalid "type" option!'));
          process.exit(1);
        }
      } catch (error: any) {
        consola.error(`Error thrown by ${job.id}.`, error);

        if (error instanceof Error) {
          await MongoRepository.get(ErrorLog).upsert(
            error instanceof RepositoryUpdateError
              ? error.errors.map((e) => ErrorLog.from(e))
              : ErrorLog.from(error)
          );
        }

        throw error;
      }
    });

    queue.on('job progress', (jobId, data) => {
      let progress: number;

      if (typeof data === 'number') progress = data;
      else progress = (data.done.length / (data.pending.length + data.done.length)) * 100;

      const bar = new Array(Math.ceil(progress / 10)).fill('=').join('').padEnd(10, '-');

      const message =
        `[${bar}|${`${Math.ceil(progress)}`.padStart(3)}%] ${bold(jobId)} ` +
        (typeof data !== 'number' && data.pending.length
          ? dim(`(pending: ${data.pending.join(', ')})`)
          : '');

      consola[progress === 100 ? 'success' : 'info'](message);
    });
  })
  .parse(process.argv);
