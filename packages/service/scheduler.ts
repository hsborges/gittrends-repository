/*
 *  Author: Hudson S. Borges
 */
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import consola from 'consola';

import { each } from 'bluebird';
import { program } from 'commander';
import { difference, chunk, intersection } from 'lodash';
import { Actor, Repository, Metadata } from '@gittrends/database-config';

import { redisOptions } from './redis';
import { version, config } from './package.json';
import knex from '@gittrends/database-config/dist/knex';

/* COMMANDS */
function resourcesParser(resources: string[]): string[] {
  const nr = resources.map((r) => r.toLowerCase());
  if (resources.indexOf('all') >= 0) return config.resources;
  if (nr.length === intersection(nr, config.resources).length) return nr;
  throw new Error("Invalid 'resources' argument values!");
}

const repositoriesScheduler = async (queue: Queue, resources: string[], wait = 24) => {
  // find and save jobs on queue
  let count = 0;

  return each(
    Repository.query().select(['id', 'updated_at', 'name_with_owner']),
    async (data: TObject) => {
      const exclude: string[] = (await Metadata.query().where({ id: data.id, key: 'updatedAt' }))
        .filter((data: TObject) =>
          dayjs()
            .subtract(wait, 'hour')
            .isBefore(data.value as Date)
        )
        .map((data: TObject) => data.resource);

      const _resources = difference(resources, exclude);

      if (_resources.length) {
        await queue.add(
          'update',
          { id: data.id, resources: _resources },
          { jobId: (data.name_with_owner as string).toLowerCase() }
        );
        count += 1;
      }
    }
  ).then(async () => consola.success(`Number of repositories scheduled: ${count}`));
};

const usersScheduler = async (queue: Queue, wait = 24, limit = 100000) => {
  // get jobs on queue
  const waiting = await queue
    .getJobs('waiting', 0, Number.MAX_SAFE_INTEGER)
    .then((jobs) =>
      jobs
        .filter(({ id }) => /users@.+/i.test(id as string))
        .reduce((acc, j) => acc.concat(j.data.id || []), [])
    );

  // find and save jobs on queue
  const before = dayjs().subtract(wait, 'hour').toISOString();
  // get metadata
  const usersIds = (
    await Actor.query()
      .select('actors.id')
      .leftJoin(
        Metadata.query()
          .where({ resource: 'actor', key: 'updatedAt' })
          .select('id', 'value')
          .as('metadata'),
        'metadata.id',
        'actors.id'
      )
      .whereNotIn('actors.id', waiting)
      .andWhere((builder) =>
        builder.whereNull('metadata.id').orWhere('metadata.value', '<', before)
      )
      .select('actors.id')
      .limit(limit)
  ).map((r: TObject) => r.id);
  // add to queue
  return Promise.all(
    chunk(usersIds, 25).map((id) => queue.add('update', { id }, { jobId: `users@${id[0]}+` }))
  ).then(() => consola.success(`Number of users scheduled: ${usersIds.length}`));
};

/* Script entry point */
program
  .version(version)
  .arguments('<resource> [other_resources...]')
  .description('Schedule jobs on queue to further processing')
  .option('-w, --wait [number]', 'Waiting interval since last execution in hours', Number, 24)
  .option('-l, --limit [number]', 'Maximum number of resources to update', Number, 100000)
  .option('--destroy-queue', 'Destroy queue before scheduling resources')
  .action(
    async (resource: string, other: string[]): Promise<void> => {
      const resources = resourcesParser([resource, ...other]);

      async function prepareQueue<T>(name: string) {
        const queue = new Queue<T>(name, {
          connection: redisOptions,
          defaultJobOptions: {
            attempts: process.env.GITTRENDS_QUEUE_ATTEMPS ?? 3,
            removeOnComplete: true
          }
        });

        await queue.clean(1000 * 60 * 60 * program.wait, Number.MAX_SAFE_INTEGER, 'completed');
        await queue.clean(0, Number.MAX_SAFE_INTEGER, 'failed');

        if (program.destroyQueue) await queue.drain();

        return queue;
      }

      // store promises running
      const promises = [];

      // schedule repositories updates
      const reposResources = resources.filter((r) => r !== 'users');
      if (reposResources) {
        const queue = await prepareQueue('repositories');
        promises.push(repositoriesScheduler(queue, reposResources, program.wait));
      }

      // schedule users updates
      if (resources.indexOf('users') >= 0) {
        const queue = await prepareQueue('users');
        promises.push(usersScheduler(queue, program.wait, program.limit));
      }

      // await promises and finish script
      await Promise.all(promises)
        .catch((err) => consola.error(err))
        .finally(() => knex.destroy())
        .finally(() => process.exit(0));
    }
  )
  .parse(process.argv);
