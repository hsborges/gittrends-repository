/*
 *  Author: Hudson S. Borges
 */
import chalk from 'chalk';
import numeral from 'numeral';
import { table } from 'table';
import { startCase, difference } from 'lodash';

import knex, { Repository, Metadata } from '@gittrends/database-config';
import packageJson from '../package.json';

(async () => {
  const reposResources = difference(packageJson.config.resources, ['users']);

  const { total: totalRepositories } = (await Repository.query()
    .count('*', { as: 'total' })
    .first()) || { total: 0 };

  if (totalRepositories === 0) throw new Error('Database is empty!');

  const data = [];

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const resource of reposResources) {
    const updatedRepos = (
      await Metadata.query().where({ resource, key: 'updatedAt' }).select('id')
    ).map((m: TObject) => m.id);

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
