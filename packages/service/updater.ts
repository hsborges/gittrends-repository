/*
 *  Author: Hudson S. Borges
 */
import axios from 'axios';
import consola from 'consola';
import BeeQueue from 'bee-queue';
import { bold } from 'chalk';
import { program, Option } from 'commander';
import mongoClient from '@gittrends/database-config';

import { version } from './package.json';
import { redisOptions } from './redis';
import ActorsUpdater from './updater/ActorUpdater';
import RepositoryUpdater, { THandler } from './updater/RepositoryUpdater';
import Cache from './updater/Cache';

async function proxyServerHealthCheck(): Promise<boolean> {
  const protocol = process.env.GITTRENDS_PROXY_PROTOCOL ?? 'http';
  const host = process.env.GITTRENDS_PROXY_HOST ?? 'localhost';
  const port = parseInt(process.env.GITTRENDS_PROXY_PORT ?? '3000', 10);
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

    const cache = new Cache(parseInt(process.env.GITTRENDS_CACHE_SIZE ?? '25000', 10));

    type RepositoryQueue = { id: string; resources: string[] };
    type UsersQueue = { id: string | string[] };

    const queue = new BeeQueue<RepositoryQueue | UsersQueue>(options.type, {
      redis: redisOptions,
      isWorker: true,
      getEvents: false,
      sendEvents: false
    });

    queue.checkStalledJobs(15000);

    queue.process(options.workers, async (job: BeeQueue.Job<any>) => {
      const reportProgress = job.reportProgress.bind(job);
      job.reportProgress = (progress: any) => {
        const bar = new Array(Math.ceil(<number>progress / 10)).fill('=').join('').padEnd(10, '-');
        const progressStr = `${progress}`.padStart(3);
        consola[progress === 100 ? 'success' : 'info'](`[${bar}|${progressStr}%] ${bold(job.id)}.`);
        return reportProgress(progress);
      };

      try {
        switch (options.type) {
          case 'users':
            await new ActorsUpdater(job.data.id, { job }).update();
            break;
          case 'repositories':
            const id = job.data.id as string;
            const resources = job.data.resources as THandler[];
            const errors = (job.data.errors || []) as THandler[];
            if (errors.length) resources.push(...errors);
            if (resources.length)
              await new RepositoryUpdater(id, resources, { job, cache }).update();
            break;
          default:
            consola.error(new Error('Invalid "type" option!'));
            process.exit(1);
        }
      } catch (err: any) {
        consola.error(`Error thrown by ${job.id}.`, (err && err.stack) || (err && err.message));
        throw err;
      }
    });
  })
  .parse(process.argv);
