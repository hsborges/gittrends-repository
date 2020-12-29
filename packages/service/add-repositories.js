/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const { chain, mergeWith, isArray, get, differenceBy, min } = require('lodash');
const { knex, Actor, Repository } = require('@gittrends/database-config');
const { program } = require('commander');
const { version } = require('./package.json');
const { BadGatewayError } = require('./helpers/errors.js');

const Query = require('./github/graphql/Query');
const SearchComponent = require('./github/graphql/components/SearchComponent');

async function search(limit, language, name) {
  const repos = [];
  const actors = [];

  let after = null;
  let total = 100;
  let maxStargazers = null;

  do {
    await Query.create()
      .compose(
        SearchComponent.create({ after, first: total, query: { maxStargazers, language, name } })
      )
      .then(({ data, actors: _actors = [] }) => {
        actors.push(...(_actors || []));
        repos.push(...differenceBy(get(data, 'search.nodes', []), repos, 'id'));

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
  .option('--limit [number]', 'Maximun number of repositories', Number, 1)
  .option('--language [string]', 'Major programming language')
  .option('--repository-name [name]', 'Repository name to search')
  .parse(process.argv);

consola.info('Searching for the top-%s repositories with more stars on GitHub ...', program.limit);

Promise.map(new Array(3), () => search(program.limit, program.language, program.repositoryName))
  .then((results) => {
    const result = results.reduce(
      (acc, res) => mergeWith(acc, res, (a, b) => (isArray(a) ? a.concat(b) : a)),
      {}
    );

    const repositories = chain(result.repositories)
      .uniqBy('id')
      .orderBy('stargazers_count', 'desc')
      .slice(0, program.limit)
      .value();

    const users = chain(result.users)
      .uniqBy('id')
      .intersectionWith(repositories, (u, r) => u.id === r.owner)
      .value();

    return [repositories, users];
  })
  .spread(async (repos, users) => {
    consola.info('Adding repositories to database ...');

    return knex.transaction(async (trx) => {
      await Actor.query(trx).insert(users).onConflict('id').ignore();
      return Repository.query(trx).insert(repos).onConflict('id').ignore();
    });
  })
  .then(() => consola.success('Repositories successfully added!'))
  .catch((err) => consola.error(err))
  .finally(() => knex.destroy());
