/*
 *  Author: Hudson S. Borges
 */
import Queue from 'bee-queue';
import { bold, dim } from 'chalk';
import { program, Option } from 'commander';
import consola from 'consola';
import fetch from 'node-fetch';
import UserAgent from 'user-agents';

import mongoClient, { MongoRepository, ErrorLog } from '@gittrends/database-config';

import HttpClient from './github/HttpClient';
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
  return fetch(`${protocol}://${host}:${port}/status`, { timeout: 5000 })
    .then((request) => request.ok)
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
      redis: connectionOptions('scheduler'),
      stallInterval: 30 * 1000,
      isWorker: true,
      sendEvents: false,
      storeJobs: false
    });

    const httpClient = new HttpClient({
      protocol: process.env.GT_PROXY_PROTOCOL ?? 'http',
      host: process.env.GT_PROXY_HOST ?? 'localhost',
      port: parseInt(process.env.GT_PROXY_PORT ?? '3000', 10),
      timeout: parseInt(process.env.GT_PROXY_TIMEOUT ?? '15000', 10),
      retries: parseInt(process.env.GT_PROXY_RETRIES ?? '0', 5),
      userAgent: process.env.GT_PROXY_USER_AGENT ?? new UserAgent().random().toString()
    });

    queue.checkStalledJobs(5000);

    queue.process(options.workers, async (job) => {
      const cache = new Cache(parseInt(process.env.GT_CACHE_SIZE ?? '1000', 10));

      const originalReportProgress = job.reportProgress.bind(job);
      job.reportProgress = (data: any) => {
        let progress: number;

        if (typeof data === 'number') progress = data;
        else progress = (data.done.length / (data.pending.length + data.done.length)) * 100;

        const bar = new Array(Math.ceil(progress / 10)).fill('=').join('').padEnd(10, '-');

        const message =
          `[${bar}|${`${Math.ceil(progress)}`.padStart(3)}%] ${bold(job.id)} ` +
          (typeof data !== 'number' && data.pending.length
            ? dim(`(pending: ${data.pending.join(', ')})`)
            : '');

        consola[progress === 100 ? 'success' : 'info'](message);

        originalReportProgress(data);
      };

      try {
        if (options.type === 'users') {
          return new ActorsUpdater(job.data.id, httpClient, { job }).update();
        } else if (options.type === 'repositories') {
          const resources = (job.data.resources || []) as RepositoryUpdaterHandler[];
          if (job.data?.errors?.length)
            resources.push(...(job.data.errors as RepositoryUpdaterHandler[]));
          if (resources.length)
            return new RepositoryUpdater(job.data.id, resources, httpClient, {
              job,
              cache
            }).update();
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
  })
  .parse(process.argv);
