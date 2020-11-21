/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const chalk = require('chalk');
const numeral = require('numeral');
const { table } = require('table');
const { startCase, difference } = require('lodash');

const { knex, Repository, Metadata } = require('@gittrends/database-config');
const { resources } = require('../package.json').config;

(async () => {
  const reposResources = difference(resources, ['users']);

  const { total: totalRepositories } = (await Repository.query()
    .count('*', { as: 'total' })
    .first()) || { total: 0 };

  if (totalRepositories === 0) throw new Error('Database is empty!');

  const data = [];

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const resource of reposResources) {
    const updatedRepos = (
      await Metadata.query()
        .whereNotIn(
          'id',
          Metadata.query()
            .where({ resource, key: 'pending' })
            .andWhere('value', '<>', '0')
            .select('id')
        )
        .where({ resource, key: 'updatedAt' })
        .select('id')
    ).map((m) => m.id);

    const updated = updatedRepos.length;

    const updating = difference(
      (await Metadata.query().where({ resource }).distinct('id')).map((m) => m.id),
      updatedRepos
    ).length;

    data.push([
      startCase(resource),
      updated,
      numeral(updated / totalRepositories).format('0.[00]%'),
      updating,
      numeral(updating / totalRepositories).format('0.[00]%'),
      totalRepositories - updated - updating,
      numeral((totalRepositories - updated - updating) / totalRepositories).format('0.[00]%')
    ]);
  }

  return data.sort((a, b) => a[0].localeCompare(b[0]));
})()
  .then((data) =>
    table(
      [
        ['Resource', 'Updated', '%', 'In Prog', '%', 'Pending', '%'].map((v) => chalk.bold(v))
      ].concat(data),
      {
        columnDefault: { alignment: 'right' },
        columns: { 0: { alignment: 'left' } }
      }
    )
  )
  .then((data) => console.log(data))
  .catch(console.error)
  .finally(() => knex.destroy());
