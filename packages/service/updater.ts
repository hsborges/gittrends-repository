/*
 *  Author: Hudson S. Borges
 */
import axios from 'axios';
import { Worker, QueueScheduler } from 'bullmq';
import { bold } from 'chalk';
import { program, Option } from 'commander';
import consola from 'consola';

import mongoClient, { ErrorLogRepository, ErrorLog } from '@gittrends/database-config';

import { RepositoryUpdateError } from './helpers/errors';
import { version } from './package.json';
import * as redis from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import Cache from './updater/Cache';
import RepositoryUpdater, { THandler } from './updater/RepositoryUpdater';

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

    type RepositoryQueue = { id: string; resources: string[]; errors: string[]; done: string[] };
    type UsersQueue = { id: string | string[] };

    const queue = new Worker<RepositoryQueue & UsersQueue>(
      options.type,
      async (job) => {
        const cache = new Cache(parseInt(process.env.GT_CACHE_SIZE ?? '1000', 10));

        try {
          switch (options.type) {
            case 'users': {
              await new ActorsUpdater(job.data.id, { job }).update();
              break;
            }
            case 'repositories': {
              const resources = (job.data.resources || []) as THandler[];
              if (job.data?.errors?.length) resources.push(...(job.data.errors as THandler[]));
              if (resources.length)
                await new RepositoryUpdater(job.data.id, resources, { job, cache }).update();
              break;
            }
            default: {
              consola.error(new Error('Invalid "type" option!'));
              process.exit(1);
            }
          }
        } catch (error: any) {
          consola.error(`Error thrown by ${job.id}.`, error);

          if (error instanceof Error) {
            await ErrorLogRepository.upsert(
              error instanceof RepositoryUpdateError
                ? error.errors.map((e) => ErrorLog.from(e))
                : ErrorLog.from(error)
            );
          }

          throw error;
        }
      },
      {
        connection: redis.scheduler,
        concurrency: options.workers,
        autorun: true,
        lockDuration: 30000,
        lockRenewTime: 5000
      }
    );

    queue.on('progress', (job, progress) => {
      const bar = new Array(Math.ceil((progress as number) / 10))
        .fill('=')
        .join('')
        .padEnd(10, '-');
      const progressStr = `${progress}`.padStart(3);
      consola[progress === 100 ? 'success' : 'info'](`[${bar}|${progressStr}%] ${bold(job.id)}.`);
    });

    new QueueScheduler(options.type, { connection: redis.scheduler, autorun: true });
  })
  .parse(process.argv);
