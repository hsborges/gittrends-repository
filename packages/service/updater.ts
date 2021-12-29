/*
 *  Author: Hudson S. Borges
 */
import { Worker, Job, QueueScheduler } from 'bullmq';
import { bold, dim } from 'chalk';
import { program, Option } from 'commander';
import consola from 'consola';
import fetch from 'node-fetch';
import UserAgent from 'user-agents';

import mongoClient, { MongoRepository, ErrorLog } from '@gittrends/database';

import HttpClient from './github/HttpClient';
import compact from './helpers/compact';
import { RepositoryUpdateError } from './helpers/errors';
import { version } from './package.json';
import { REDIS_CONNECTION } from './redis';
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
  .action(async () => {
    if (!(await proxyServerHealthCheck())) {
      consola.error('Proxy server not responding, exiting ...');
      process.exit(1);
    }

    await mongoClient.connect();

    const options = program.opts();
    consola.info(`Updating ${options.type} using ${options.workers} workers`);

    const proxyUrl = new URL(process.env.GT_PROXY || 'http://localhost:3000');

    const httpClient = new HttpClient({
      protocol: proxyUrl.protocol,
      host: proxyUrl.hostname,
      port: parseInt(proxyUrl.port, 10),
      timeout: parseInt(process.env.GT_PROXY_TIMEOUT ?? '15000', 10),
      retries: parseInt(process.env.GT_PROXY_RETRIES ?? '0', 5),
      userAgent: process.env.GT_PROXY_USER_AGENT ?? new UserAgent().random().toString()
    });

    new Worker(
      options.type,
      async (job: Job) => {
        const cache = new Cache(parseInt(process.env.GT_CACHE_SIZE ?? '1000', 10));

        const originalReportProgress = job.updateProgress.bind(job);
        type JobProgressReport = { pending: string[]; done: string[]; errors: string[] };

        job.updateProgress = async (data: number | JobProgressReport) => {
          let progress: number;

          if (typeof data === 'number') progress = data;
          else progress = (data.done.length / (data.pending.length + data.done.length)) * 100;

          const bar = new Array(Math.ceil(progress / 10)).fill('=').join('').padEnd(10, '-');

          const message =
            `[${bar}|${`${Math.ceil(progress)}`.padStart(3)}%] ${bold(job.name)} ` +
            (typeof data !== 'number' && data.pending.length
              ? dim(`(pending: ${data.pending.join(', ')})`)
              : '');

          consola[progress === 100 ? 'success' : 'info'](message);

          if (typeof data !== 'number')
            await job.update(
              compact({
                resources: data.pending,
                done: data.done,
                errors: data.errors
              })
            );

          return originalReportProgress(progress);
        };

        let updater: Updater | null = null;

        if (options.type === 'users') {
          updater = new ActorsUpdater(job.data.id, httpClient, { job });
        } else if (options.type === 'repositories') {
          const resources = (job.data.resources || []) as RepositoryUpdaterHandler[];
          if (job.data?.errors?.length)
            resources.push(...(job.data.errors as RepositoryUpdaterHandler[]));
          if (resources.length)
            updater = new RepositoryUpdater(job.data.id, resources, httpClient, { job, cache });
        } else {
          consola.error(new Error('Invalid "type" option!'));
          process.exit(1);
        }

        if (updater) {
          await updater.update().catch(async (error) => {
            consola.error(`Error thrown by ${job.id}.`, error);

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
        connection: REDIS_CONNECTION,
        concurrency: options.workers,
        autorun: true,
        sharedConnection: true,
        lockDuration: 5 * 60 * 1000,
        lockRenewTime: 30 * 1000
      }
    );

    new QueueScheduler(options.type, {
      connection: REDIS_CONNECTION,
      sharedConnection: true,
      autorun: true,
      maxStalledCount: Number.MAX_SAFE_INTEGER,
      stalledInterval: 60 * 1000
    });
  })
  .parse(process.argv);
