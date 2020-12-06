/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const { chain, mergeWith, isArray } = require('lodash');
const { knex, Actor, Repository } = require('@gittrends/database-config');
const { program } = require('commander');
const { version } = require('./package.json');

const search = require('./github/graphql/repositories/search');

/* Script entry point */
program
  .version(version)
  .option('--limit <number>', 'Maximun number of repositories', Number, 1)
  .option('--language [string]', 'Major programming language')
  .parse(process.argv);

consola.info('Searching for the top-%s repositories with more stars on GitHub ...', program.limit);

Promise.map(new Array(3), () => search(program.limit, { language: program.language }))
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
