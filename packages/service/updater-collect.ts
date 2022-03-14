/*
 *  Author: Hudson S. Borges
 */
import { Worker, Job, QueueScheduler } from 'bullmq';
import { bold, dim } from 'chalk';
import { program, Option } from 'commander';
import consola from 'consola';
import { isNil } from 'lodash';
import fetch from 'node-fetch';

import { MongoRepository, ErrorLog } from '@gittrends/database';

import compact from './helpers/compact';
import { RepositoryUpdateError } from './helpers/errors';
import httpClient from './helpers/proxy-http-client';
import { useRedis } from './helpers/redis';
import { version } from './package.json';
import { ActorsUpdater } from './updater/ActorUpdater';
import { Cache } from './updater/Cache';
import { RepositoryUpdater, RepositoryUpdaterHandler } from './updater/RepositoryUpdater';
import Updater from './updater/Updater';

async function proxyServerHealthCheck(): Promise<boolean> {
  return fetch(`${process.env.GT_PROXY_URL || 'http://localhost:3000'}/status`, { timeout: 5000 })
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
  .hook('preAction', () => MongoRepository.connect().then())
  .hook('postAction', () => MongoRepository.close())
  .action(async () => {
    if (!(await proxyServerHealthCheck())) {
      consola.error('Proxy server not responding, exiting ...');
      process.exit(1);
    }

    const options = program.opts();
    consola.info(`Updating ${options.type} using ${options.workers} workers`);

    const cacheSize = parseInt(process.env.GT_CACHE_SIZE ?? '1000', 10);
    const cache = cacheSize > 0 ? new Cache(cacheSize) : undefined;

    const redis = useRedis();

    const worker = new Worker(
      options.type,
      async (job: Job) => {
        if (isNil(job.data.id)) throw new Error(`Invalid job data! (${job.name}: ${job.data.id})`);

        let updater: Updater | null = null;

        if (options.type === 'users') {
          updater = new ActorsUpdater(job.data.id, httpClient, { job });
        } else if (options.type === 'repositories') {
          const resources = (job.data.resources || []) as RepositoryUpdaterHandler[];
          if (job.data?.errors?.length) {
            resources.push(...(job.data.errors as RepositoryUpdaterHandler[]));
          }
          if (resources.length) {
            updater = new RepositoryUpdater(job.data.id, resources, httpClient, {
              job,
              cache,
              writeBatchSize: parseInt(process.env.GT_WRITE_BATCH_SIZE ?? '500', 10)
            });
          }
        } else {
          consola.error(new Error('Invalid "type" option!'));
          process.exit(1);
        }

        if (updater) {
          const originalUpdateProgress = job.updateProgress.bind(job);
          job.updateProgress = async (data: any) => {
            let progress: number;

            if (typeof data === 'number') {
              progress = data;
            } else {
              const totalJobs = data.pending.length + data.done.length + data.errors.length;
              progress = (data.done.length / totalJobs) * 100;
            }

            const bar = new Array(Math.ceil(progress / 10)).fill('=').join('').padEnd(10, '-');

            const message =
              `[${bar}|${`${Math.ceil(progress)}`.padStart(3)}%] ${bold(job.name)} ` +
              (typeof data !== 'number' && data.pending.length
                ? dim(`(pending: ${data.pending.join(', ')})`)
                : '');

            consola[progress === 100 ? 'success' : 'info'](message);

            if (typeof data !== 'number') {
              await job.update(
                compact({
                  ...job.data,
                  resources: data.pending,
                  done: data.done,
                  errors: data.errors
                })
              );
            }

            return originalUpdateProgress(Math.trunc(progress * 100) / 100);
          };

          await updater.update().catch(async (error) => {
            consola.error(`Error thrown by ${job.name}.`, error);

            if (error instanceof Error) {
              await MongoRepository.get(ErrorLog).upsert(
                error instanceof RepositoryUpdateError
                  ? error.errors.map((e) => ErrorLog.from(e))
                  : ErrorLog.from(error)
              );
            }

            throw error;
          });
        }
      },
      {
        connection: redis,
        concurrency: options.workers,
        autorun: true,
        sharedConnection: true,
        lockDuration: 5 * 60 * 1000,
        lockRenewTime: 30 * 1000
      }
    );

    const scheduler = new QueueScheduler(options.type, {
      connection: redis,
      sharedConnection: true,
      autorun: true,
      maxStalledCount: Number.MAX_SAFE_INTEGER,
      stalledInterval: 60 * 1000
    });

    if (globalThis.gc) setInterval(() => globalThis.gc && globalThis.gc(), 30 * 1000);

    return new Promise<void>((resolve) => worker.on('closed', resolve))
      .finally(() => scheduler.close())
      .finally(() => redis.disconnect());
  })
  .parseAsync(process.argv);
