/*
 *  Author: Hudson S. Borges
 */
import consola from 'consola';
import { program } from 'commander';
import { version } from './package.json';
import { chain, get, min } from 'lodash';
import { BadGatewayError } from './helpers/errors';
import knex, { Actor, Repository } from '@gittrends/database-config';

import Query from './github/Query';
import SearchComponent from './github/components/SearchComponent';

async function search(limit = 1000, language?: string, name?: string) {
  const repos: TObject[] = [];
  const actors: TObject[] = [];

  let after = undefined;
  let total = Math.min(100, limit);
  let maxStargazers = undefined;

  do {
    await Query.create()
      .compose(
        new SearchComponent({ maxStargazers, language, name }, after, total).setAlias('search')
      )
      .run()
      .then(({ data, actors: _actors = [] }) => {
        actors.push(..._actors);
        repos.push(...get(data, 'search.nodes', []));

        if (!repos.length) throw new Error('Repositories not found for the provided parameters.');

        if (get(data, 'search.page_info.has_next_page')) {
          after = get(data, 'search.page_info.end_cursor');
        } else {
          after = null;
          maxStargazers = min(repos.map((r) => r.stargazers_count));
        }
      })
      .then(() => (total = 100))
      .catch((err) => {
        if (err instanceof BadGatewayError) return (total = Math.ceil(total / 2));
        throw err;
      });
  } while (name ? false : repos.length < limit);

  return {
    repositories: chain(repos).compact().sortBy('stargazers_count', 'desc').value(),
    users: chain(actors).uniqBy('id').compact().value()
  };
}

/* Script entry point */
program
  .version(version)
  .option('--limit [number]', 'Maximun number of repositories', Number, 100)
  .option('--language [string]', 'Major programming language')
  .option('--repository-name [name]', 'Repository name to search')
  .action(() => {
    const options = program.opts();

    consola.info(
      'Searching for the top-%s repositories with more stars on GitHub ...',
      options.limit
    );

    search(options.limit, options.language, options.repositoryName)
      .then((result) => {
        const repositories = chain(result.repositories)
          .uniqBy('id')
          .orderBy('stargazers_count', 'desc')
          .slice(0, options.limit)
          .value();

        const users = chain(result.users)
          .uniqBy('id')
          .intersectionWith(repositories, (u, r) => u.id === r.owner)
          .value();

        return [repositories, users];
      })
      .then(async ([repos, users]) => {
        consola.info('Adding repositories to database ...');

        return knex.transaction(async (trx) => {
          await Actor.insert(users, trx);
          return Repository.insert(repos, trx);
        });
      })
      .then(() => consola.success('Repositories successfully added!'))
      .catch((err) => consola.error(err))
      .finally(() => knex.destroy());
  })
  .parse(process.argv);
