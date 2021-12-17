/*
 *  Author: Hudson S. Borges
 */
import chalk from 'chalk';
import { startCase, difference, get } from 'lodash';
import numeral from 'numeral';
import { table } from 'table';

import mongoClient, { MongoRepository, Repository } from '@gittrends/database';

import packageJson from '../package.json';

(async () => {
  await mongoClient.connect();

  const reposResources = difference(packageJson.config.resources, ['users']);

  const repositories = await MongoRepository.get(Repository)
    .collection.find({}, { projection: { _id: 1, _metadata: 1 } })
    .toArray();

  if (repositories.length === 0) throw new Error('Database is empty!');

  const data = [];

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const resource of reposResources) {
    const updatedRepos = repositories
      .filter((repo) => get(repo, ['_metadata', resource, 'updatedAt']))
      .map((repo) => repo._id);

    const updating = difference(
      repositories.filter((repo) => get(repo, ['_metadata', resource])).map((repo) => repo._id),
      updatedRepos
    ).length;

    data.push([
      startCase(resource),
      numeral(updatedRepos.length).format('0,0'),
      numeral(updatedRepos.length / repositories.length).format('0.[00]%'),
      numeral(updating).format('0,0'),
      numeral(updating / repositories.length).format('0.[00]%'),
      numeral(repositories.length - updatedRepos.length - updating).format('0,0'),
      numeral((repositories.length - updatedRepos.length - updating) / repositories.length).format(
        '0.[00]%'
      )
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
  .finally(() => mongoClient.close());
