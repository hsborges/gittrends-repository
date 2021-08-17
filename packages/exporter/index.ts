/*
 *  Author: Hudson S. Borges
 */
import consola from 'consola';
import mongoClient, { Repository, Actor, Stargazer, Tag, Model } from '@gittrends/database-config';

import async from 'async';
import mkdirp from 'mkdirp';
import cliProgress from 'cli-progress';
import { cyan } from 'colors';
import { Option, program } from 'commander';
import { dirname, join } from 'path';
import { writeFileSync, existsSync } from 'fs';

import { repository, stargazers, tags } from './modules';
import { version } from './package.json';

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
  .argument('<destination>', 'Exports the website data into json files')
  .action(async (dir) => {
    const options = program.opts();

    function writeFile(content: any, destination: string): void {
      const finalDest = join(dir, destination);
      const destDir = dirname(finalDest);
      if (!existsSync(destDir)) mkdirp.sync(destDir);
      writeFileSync(finalDest, JSON.stringify(content), { encoding: 'utf8' });
    }

    consola.info('Connecting to mongo database ...');
    await mongoClient.connect().catch((error) => {
      consola.error(error);
      throw error;
    });

    consola.info('Getting repositories list ...');
    const repos = await Repository.collection
      .find(
        {},
        {
          projection: { _id: 0, name_with_owner: 1, primary_language: 1, stargazers_count: 1 },
          limit: options.limit ?? undefined,
          sort: options.sort
        }
      )
      .toArray();

    consola.info(
      `Exporting resources from repositories (${repos.length} repos using ${options.workers} workers) ...`
    );
    const progressBar = new cliProgress.SingleBar({
      format: 'Progress |' + cyan('{bar}') + '| {percentage}% | {value}/{total} projects',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    if (!process.env.DEBUG) progressBar.start(repos.length, 0);

    const queue = async.queue((repo: any, callback) => {
      consola.debug(`Exporting resources from ${repo.name_with_owner}`);

      const errorHandler = (err: any) => {
        consola.debug(err.message);
        return null;
      };

      return Promise.all([
        repository(repo.name_with_owner),
        stargazers(repo.name_with_owner).catch(errorHandler),
        tags(repo.name_with_owner).catch(errorHandler)
      ]).then(([repo, stargazers, tags]) => {
        writeFile(
          { ...repo, stargazers, tags },
          join(...`${repo.name_with_owner}.json`.split('/'))
        );
        progressBar.increment();
        callback();
      });
    }, options.workers);

    await queue.push(repos);
    await queue.drain().then(() => progressBar.stop());

    consola.info(`Exporting repositories list ...`);
    writeFile(repos.map(Object.values), 'repos.json');

    consola.info(`Exporting repositories stats ...`);
    async function query<T extends Model>(model: T) {
      return model.collection.estimatedDocumentCount();
    }

    writeFile(
      {
        repositories: await query(Repository),
        users: await query(Actor),
        stargazers: await query(Stargazer),
        tags: await query(Tag)
      },
      'stats.json'
    );

    consola.success('Done');
    process.exit(0);
  })
  .parse(process.argv);
