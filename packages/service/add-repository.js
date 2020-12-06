/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const { program } = require('commander');
const { knex, Actor, Repository } = require('@gittrends/database-config');
const { version } = require('./package.json');

const get = require('./github/graphql/repositories/get');

/* Script entry point */
program
  .version(version)
  .arguments('<repository> [repositories...]')
  .description('Add one or more repositories to database')
  .action(async (repo, otherRepos) =>
    Promise.mapSeries([repo, ...otherRepos], (_repo) => {
      if (!/.*\/.*/.test(_repo)) throw new TypeError(`Invalid repository name (${_repo})!`);
      consola.info(`Searching for repository ${_repo} ...`);
      return get(..._repo.split('/')).then(async ({ repository, users }) =>
        knex.transaction(async (trx) => {
          await Actor.query(trx).insert(users).onConflict('id').ignore();
          return Repository.query(trx).insert(repository).onConflict('id').ignore();
        })
      );
    })
      .then(() => {
        consola.success('Repository successfully added!');
        process.exit(0);
      })
      .catch((err) => {
        consola.error(err);
        process.exit(1);
      })
      .then(() => knex.destroy())
  )
  .parse(process.argv);
