/*
 *  Author: Hudson S. Borges
 */
import consola from 'consola';
import { program } from 'commander';
import { chain, get, min, uniqBy } from 'lodash';
import { filter } from 'bluebird';
import mongoClient, { Actor, Repository } from '@gittrends/database-config';

import parser from './helpers/response-parser';
import { version } from './package.json';
import { BadGatewayError } from './helpers/errors';

import Query from './github/Query';
import SearchComponent from './github/components/SearchComponent';

async function search(limit = 1000, language?: string, name?: string) {
  let repos: TObject[] = [];
  let actors: TObject[] = [];

  let after = undefined;
  let maxStargazers = undefined;
  let total = Math.min(100, limit);

  do {
    await Query.create()
      .compose(
        new SearchComponent(
          { maxStargazers, language, name },
          after,
          Math.min(100, total, limit - repos.length)
        ).setAlias('search')
      )
      .run()
      .then((response) => parser(response))
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

        total = 100;
        actors = uniqBy(actors, 'id');
        repos = uniqBy(repos, 'id');
      })
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
  .action(async () => {
    const options = program.opts();

    consola.info(
      'Searching for the top-%s repositories with more stars on GitHub ...',
      options.limit
    );

    return Promise.all(
      [1, 1, 1].map(() => search(options.limit, options.language, options.repositoryName))
    )
      .then((results) => {
        const result = results.reduce(
          (acc, result) => ({
            repositories: acc.repositories.concat(result.repositories),
            users: acc.users.concat(result.users)
          }),
          { repositories: new Array<TObject>(), users: new Array<TObject>() }
        );

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
        await mongoClient.connect();

        return Promise.all([
          filter(repos, (repo) =>
            Repository.collection
              .findOne({ _id: repo.id }, { projection: { _id: 1 } })
              .then((data) => !data)
          ),
          filter(users, (user) =>
            Actor.collection
              .findOne({ _id: user.id }, { projection: { _id: 1 } })
              .then((data) => !data)
          )
        ]);
      })
      .then(async ([repos, users]) => {
        consola.info('Adding repositories to database ...');
        await Actor.insert(users);
        await Repository.insert(repos);
      })
      .then(() => consola.success('Repositories successfully added!'))
      .catch((err) => consola.error(err))
      .finally(() => mongoClient.close());
  })
  .parse(process.argv);
