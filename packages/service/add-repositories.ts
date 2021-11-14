/*
 *  Author: Hudson S. Borges
 */
import { filter } from 'bluebird';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { chain, get, min, uniqBy } from 'lodash';

import mongoClient, { Actor, Repository } from '@gittrends/database-config';
import { ActorRepository, RepositoryRepository } from '@gittrends/database-config';

import SearchComponent from './github/components/SearchComponent';
import Query from './github/Query';
import { BadGatewayError } from './helpers/errors';
import parser from './helpers/response-parser';
import { version } from './package.json';

async function search(
  limit = 1000,
  opts?: {
    language?: string;
    name?: string;
    minStargazers?: number;
    maxStargazers?: number;
    sort?: 'stars' | 'created' | 'updated' | undefined;
    order?: 'asc' | 'desc' | undefined;
  }
) {
  if (opts?.minStargazers && opts?.maxStargazers && opts.minStargazers > opts?.maxStargazers)
    throw new Error(
      `Min must be lower or equal to the max number of stargazers (${opts.minStargazers} > ${opts?.maxStargazers})`
    );

  let repos: TObject[] = [];
  let actors: TObject[] = [];

  let after = undefined;
  let maxStargazers = opts?.maxStargazers ?? undefined;
  let total = Math.min(100, limit);
  let hasMoreRepos = true;

  do {
    await Query.create()
      .compose(
        new SearchComponent(
          { ...opts, maxStargazers },
          after,
          Math.min(100, total, limit - repos.length)
        ).setAlias('search')
      )
      .run()
      .then((response) => parser(response))
      .then(({ data, actors: _actors = [] }) => {
        const newRepos = get(data, 'search.nodes', []).filter(
          (nr: any) => repos.findIndex((cr) => cr.id === nr.id) < 0
        );

        actors.push(..._actors);
        repos.push(...newRepos);

        if (!repos.length) throw new Error('Repositories not found for the provided parameters.');

        if (get(data, 'search.page_info.has_next_page')) {
          after = get(data, 'search.page_info.end_cursor');
          hasMoreRepos = true;
        } else {
          after = null;
          const newMaxStargazers = min(repos.map((r) => r.stargazers_count as number));
          if (newMaxStargazers != maxStargazers) maxStargazers = newMaxStargazers;
          else if (maxStargazers) maxStargazers -= 1;

          hasMoreRepos =
            (opts?.minStargazers ?? 0) <= (maxStargazers ?? Number.MAX_SAFE_INTEGER) &&
            newRepos.length > 0;
        }

        total = 100;
        actors = uniqBy(actors, 'id');
        repos = uniqBy(repos, 'id');
      })
      .catch((err) => {
        if (err instanceof BadGatewayError) return (total = Math.ceil(total / 2));
        throw err;
      });
  } while (!opts?.name && repos.length < limit && hasMoreRepos);

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
  .option('--min-stargazers [number]', 'Minimun number of stars of the repositories', Number, 1)
  .option('--max-stargazers [number]', 'Maximun number of stars of the repositories')
  .option('--workers [number]', 'Number of parallel workers', Number, 3)
  .addOption(
    new Option('--sort [string]', 'Define the sort fiel')
      .choices(['stars', 'created', 'updated', 'default'])
      .default('stars')
  )
  .addOption(
    new Option('--order [string]', 'Define the sort order')
      .choices(['asc', 'desc', 'default'])
      .default('desc')
  )
  .addArgument(new Argument('[name]', 'Find using a repository name (or fragment)'))
  .action(async (repositoryName, options) => {
    const minStr = options.minStargazers || '0';
    const maxStr = options.maxStargazers || '*';
    consola.info(
      `Searching for repositories with ${minStr}..${maxStr} stars on GitHub ...`,
      options.limit
    );

    return Promise.all(
      new Array(options.workers).fill(0).map(() =>
        search(options.limit, {
          language: options.language,
          name: repositoryName,
          minStargazers: options.minStargazers && parseInt(options.minStargazers, 10),
          maxStargazers: options.maxStargazers && parseInt(options.maxStargazers, 10),
          sort: options.sort === 'default' ? undefined : options.sort,
          order: options.order === 'default' ? undefined : options.order
        })
      )
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
            RepositoryRepository.collection
              .findOne({ _id: repo.id }, { projection: { _id: 1 } })
              .then((data) => !data)
          ),
          filter(users, (user) =>
            ActorRepository.collection
              .findOne({ _id: user.id }, { projection: { _id: 1 } })
              .then((data) => !data)
          )
        ]);
      })
      .then(async ([repos, users]) => {
        consola.info('Adding repositories to database ...');
        await ActorRepository.insert(users.map((user) => new Actor(user)));
        await RepositoryRepository.insert(repos.map((repo) => new Repository(repo)));
      })
      .then(() => consola.success('Repositories successfully added!'))
      .catch((err) => consola.error(err))
      .finally(() => mongoClient.close());
  })
  .parse(process.argv);
