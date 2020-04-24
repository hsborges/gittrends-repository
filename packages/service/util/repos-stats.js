/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const chalk = require('chalk');
const numeral = require('numeral');
const { table } = require('table');
const { startCase } = require('lodash');

const connection = require('../modules/connection.js');
const { resources } = require('../package.json').config;

Promise.resolve()
  .then(() => connection.connect())
  .then(() => {
    const fields = resources.reduce(
      (acc, f) => ({
        ...acc,
        [f]: { $cond: [{ $ifNull: [`$_meta.${f}.updated_at`, false] }, 1, 0] },
        [`${f}_partial`]: {
          $cond: [
            { $and: [{ $ifNull: [`$_meta.${f}`, false] }, { $not: [`$_meta.${f}.updated_at`] }] },
            1,
            0
          ]
        }
      }),
      { repos: { $cond: [{ $ifNull: ['$_meta.updated_at', false] }, 1, 0] } }
    );

    const pipe2 = resources.reduce(
      (acc, f) => ({ ...acc, [f]: { $sum: `$${f}` }, [`${f}_partial`]: { $sum: `$${f}_partial` } }),
      { repos: { $sum: '$repos' } }
    );

    return connection.repositories
      .aggregate([
        { $addFields: fields },
        { $group: { _id: null, total: { $sum: 1 }, ...pipe2 } },
        { $project: { _id: 0 } }
      ])
      .toArray();
  })
  .then(([result]) =>
    resources
      .reduce((acc, resource) => {
        const updatedRatio = result[resource] / result.total;
        const inProgressRatio = result[`${resource}_partial`] / result.total;
        const pendingRatio = 1 - updatedRatio - inProgressRatio;
        return acc.concat([
          [
            startCase(resource),
            result[resource],
            numeral(updatedRatio).format('0.[00]%'),
            result[`${resource}_partial`],
            numeral(inProgressRatio).format('0.[00]%'),
            result.total - result[resource] - result[`${resource}_partial`],
            numeral(pendingRatio).format('0.[00]%')
          ]
        ]);
      }, [])
      .sort((a, b) => a[0].localeCompare(b[0]))
  )
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
  .finally(() => connection.disconnect());
