/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const consola = require('consola');
const { omit } = require('lodash');
const { program } = require('commander');
const { mongo } = require('@gittrends/database-config');
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
      return get(..._repo.split('/')).then(async ({ repository, users }) => {
        await mongo.connect();
        await mongo.users
          .insertMany(
            users.map((u) => omit({ _id: u.id, ...u }, 'id')),
            { ordered: false, checkKeys: false }
          )
          .catch((err) => (err.code === 11000 ? Promise.resolve() : Promise.reject(err)));
        await mongo.repositories
          .insertOne(omit({ _id: repository.id, ...repository }, 'id'), {
            checkKeys: false
          })
          .catch((err) => (err.code === 11000 ? Promise.resolve() : Promise.reject(err)));
        await mongo.disconnect();
      });
    })
      .then(() => {
        consola.success('Repository successfully added!');
        process.exit(0);
      })
      .catch((err) => {
        consola.error(err);
        process.exit(1);
      })
  )
  .parse(process.argv);
