/*
 *  Author: Hudson S. Borges
 */
import async from 'async';
import consola from 'consola';
import dayjs from 'dayjs';
import { cyan, bold } from 'colors';
import { omit, pick } from 'lodash';
import cliProgress from 'cli-progress';
import { Option, program } from 'commander';

import mikroConfig from '../mikro-orm.config';
import { MikroORM, wrap } from '@mikro-orm/core';

import mongo, * as MongoModels from '@gittrends/database-config';
import {
  Actor,
  Repository,
  Tag,
  StargazerTimeseries,
  Stargazer,
  RepositoryMetadata
} from '../models';

import * as dataImport from './import';
import { version } from '../package.json';

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
    const orm = await MikroORM.init(mikroConfig);

    const queue = async.queue(async (id: string, callback) => {
      const data = await dataImport.repository(id);
      if (!data) throw new Error('Repository not fond!');

      await orm.em
        .transactional(async (em) => {
          // eslint-disable-next-line prefer-const
          let [_owner, _repo] = await Promise.all([
            em.findOne(Actor, { id: data.owner?.id }),
            em.findOne(Repository, { id: data.id })
          ]);

          if (_owner) data.owner = wrap(_owner).assign(data.owner);
          if (_repo) wrap(_repo).assign(omit(data, 'metadata'));

          await em.persist(_repo || data).flush();

          const metadata = await _repo?.metadata.loadItems();
          await em.nativeDelete(RepositoryMetadata, { repository: id });
          await em
            .persist(
              data.metadata
                .toArray()
                .map((meta) => new RepositoryMetadata({ ...meta, repository: _repo || data }))
            )
            .flush();

          const ltm = metadata?.find((m) => m.resource === 'tags');
          const tm = data.metadata.getItems().find((m) => m.resource === 'tags');

          if (!ltm || !dayjs(ltm?.updated_at).isSame(tm?.updated_at)) {
            try {
              await em.nativeDelete(Tag, { repository: id });
              const tags = await dataImport.tags(id);
              tags.forEach((tag) => (tag.repository = _repo || data));

              em.persist(tags);
            } catch (error) {
              consola.error(error);
            }
          }

          const lsm = metadata?.find((m) => m.resource === 'stargazers');
          const sm = data.metadata.getItems().find((m) => m.resource === 'stargazers');

          if (!lsm || !dayjs(lsm?.updated_at).isSame(sm?.updated_at)) {
            try {
              const [timeseries, first, last] = await dataImport.stargazersTimeseries(id);
              timeseries.forEach((ts) => (ts.repository = _repo || data));

              await Promise.all(
                [first, last].map(async (stargazer) => {
                  if (!stargazer) return;
                  stargazer.repository = _repo || data;
                  const actor = await em.findOne(Actor, { id: stargazer.user.id });
                  stargazer.user = actor ? wrap(actor).assign(stargazer.user) : stargazer.user;
                })
              );

              await Promise.all([
                em.nativeDelete(StargazerTimeseries, { repository: id }),
                em.nativeDelete(Stargazer, { repository: id })
              ]);

              em.persist([...timeseries, first, last]);
            } catch (error) {
              consola.error(error);
            }
          }
        })
        .catch(consola.error);

      progressBar.increment();
      callback();
    }, options.workers);

    consola.info('Getting list of repositories to export ...');
    await MongoModels.Repository.collection
      .find()
      .sort(options.sort, options.order)
      .limit(options.limit || Number.MAX_SAFE_INTEGER)
      .project(['_id'])
      .map((doc) => doc._id)
      .toArray()
      .then((ids) => {
        consola.info('Preparing progress bar and task queue ...');
        if (!process.env.DEBUG) progressBar.start(ids.length, 0);
        queue.push(ids);
      })
      .then(() => queue.drain())
      .finally(() => progressBar.stop());

    consola.success('Done! Closing connections.');
    await orm.close();
    await mongo.close();
  })
  .parse(process.argv);
