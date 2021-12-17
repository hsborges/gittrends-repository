/*
 *  Author: Hudson S. Borges
 */
import { PrismaClient } from '@prisma/client';
import async from 'async';
import cliProgress from 'cli-progress';
import { bold, cyan } from 'colors';
import { Option, program } from 'commander';
import consola from 'consola';
import { omit, pick } from 'lodash';

import mongo, {
  ActorRepository,
  RepositoryRepository,
  StargazerRepository,
  TagRepository
} from '@gittrends/database';

import { version } from '../package.json';
import * as dataImport from './import';

function jsonFormatter(object: Record<string, any>): string {
  return Object.entries(object)
    .map(([k, v]) => `${bold(k)}: ${v}`)
    .join(', ');
}

/* Script entry point */
program
  .version(version)
  .option('-w, --workers [number]', 'Maximun number of workers', Number, 1)
  .option('-l, --limit [number]', 'Maximum number of repositories', Number)
  .addOption(
    new Option('-s, --sort [string]', 'Sort repositories by')
      .choices(['stargazers_count', 'forks_count', 'created_at', 'updated_at', 'pushed_at'])
      .default('stargazers_count')
  )
  .addOption(
    new Option('-o, --order [string]', 'Sort order').choices(['asc', 'desc']).default('desc')
  )
  .action(async () => {
    const options = program.opts();

    const optionsStr = jsonFormatter(pick(options, ['limit', 'sort', 'order']));
    consola.info('Starting importer with: %s', optionsStr);

    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |' + cyan('{bar}') + '| {percentage}% | {value}/{total} projects',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    consola.info('Connecting to mongo database ...');
    await mongo.connect();

    consola.info('Preparing sqlite file database ...');
    const prisma = new PrismaClient();

    const queue = async.queue(async (id: string) => {
      const data = await dataImport.repository(id);
      if (!data) throw new Error('Repository not fond!');

      const metadata = await prisma.repositoryMetadata.findMany({
        where: { repository_id: data.id }
      });

      const operations = [];

      operations.push(
        prisma.repository.upsert({
          where: { id: data.id },
          create: {
            ...omit(data, ['owner', 'metadata', 'repository_topics']),
            owner: data.owner && {
              connectOrCreate: { where: { id: data.owner.id }, create: data.owner }
            }
          },
          update: {
            ...omit(data, ['owner', 'metadata', 'repository_topics']),
            owner: data.owner && {
              connectOrCreate: { where: { id: data.owner.id }, create: data.owner }
            }
          }
        })
      );

      operations.push(
        prisma.repositoryMetadata.deleteMany({ where: { repository_id: data.id } }),
        ...data.metadata.map((meta) =>
          prisma.repositoryMetadata.create({
            data: { ...meta, repository: { connect: { id: data.id } } }
          })
        ),
        prisma.repositoryTopic.deleteMany({ where: { repository_id: data.id } }),
        ...(data.repository_topics || []).map((topic) =>
          prisma.repositoryTopic.create({
            data: { topic, repository: { connect: { id: data.id } } }
          })
        )
      );

      const ltm = metadata?.find((m) => m.resource === 'tags');
      const tm = data.metadata.find((m) => m.resource === 'tags');

      if (ltm?.end_cursor != tm?.end_cursor) {
        operations.push(
          prisma.tag.deleteMany({ where: { repository_id: data.id } }),
          ...(await dataImport.tags(id)).map((tag) =>
            prisma.tag.create({ data: { repository_id: data.id, ...tag } })
          )
        );
      }

      const lsm = metadata?.find((m) => m.resource === 'stargazers');
      const sm = data.metadata.find((m) => m.resource === 'stargazers');

      if (lsm?.end_cursor != sm?.end_cursor) {
        const [timeseries, first, last] = await dataImport.stargazersTimeseries(id);

        operations.push(
          prisma.stargazerTimeseries.deleteMany({ where: { repository_id: data.id } }),
          ...timeseries.map((ts) =>
            prisma.stargazerTimeseries.create({ data: { repository_id: data.id, ...ts } })
          )
        );

        operations.push(prisma.stargazer.deleteMany({ where: { repository_id: data.id } }));
        [first, last].forEach(async (stargazer) => {
          if (!stargazer) return;
          operations.push(
            prisma.stargazer.create({
              data: {
                ...stargazer,
                repository: { connect: { id: data.id } },
                user: {
                  connectOrCreate: { where: { id: stargazer.user.id }, create: stargazer.user }
                }
              }
            })
          );
        });
      }

      await prisma.$transaction(operations);

      progressBar.increment();
    }, options.workers);

    consola.info('Getting list of repositories to export ...');
    await RepositoryRepository.collection
      .find({ '_metadata.repository': { $exists: true } })
      .sort(options.sort, options.order)
      .limit(options.limit || Number.MAX_SAFE_INTEGER)
      .project(['_id'])
      .map((doc) => doc._id)
      .toArray()
      .then(async (ids) => {
        consola.info('Exporting database resources stats ...');
        await Promise.all(
          [RepositoryRepository, ActorRepository, StargazerRepository, TagRepository].map(
            (DataRepository) => DataRepository.collection.estimatedDocumentCount()
          )
        ).then(([reposCount, actorsCount, stargazersCount, tagsCount]) =>
          prisma.$transaction([
            prisma.resourceStat.deleteMany({ where: {} }),
            prisma.resourceStat.create({ data: { resource: 'repositories', count: reposCount } }),
            prisma.resourceStat.create({ data: { resource: 'actors', count: actorsCount } }),
            prisma.resourceStat.create({
              data: { resource: 'stargazers', count: stargazersCount }
            }),
            prisma.resourceStat.create({ data: { resource: 'tags', count: tagsCount } })
          ])
        );

        consola.info('Preparing progress bar and task queue ...');
        if (!process.env.DEBUG) progressBar.start(ids.length, 0);
        for (const id of ids) queue.pushAsync(id).catch(consola.error);
      })
      .then(() => queue.drain())
      .finally(() => progressBar.stop());

    consola.success('Done! Closing connections.');

    await prisma.$disconnect();
    await mongo.close();
  })
  .parse(process.argv);
