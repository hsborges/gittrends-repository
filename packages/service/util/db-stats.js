/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const numeral = require('numeral');
const chalk = require('chalk');

const { table } = require('table');
const { sortBy } = require('lodash');

const connection = require('../modules/connection.js');

Promise.resolve()
  .then(() => connection.connect())
  .then(() =>
    connection.db
      .listCollections()
      .toArray()
      .map((c) => c.name)
  )
  .then((names) =>
    Promise.mapSeries(names, async (name) => {
      const stats = await connection.db.collection(name).stats();
      return [
        name,
        numeral(stats.count).format('0.[00]a'),
        numeral(stats.storageSize).format('0.0b'),
        numeral(stats.nindexes).format('0,0'),
        numeral(stats.totalIndexSize).format('0.0b')
      ];
    })
  )
  .then((data) =>
    [
      ['Collection', 'Documents', 'Storage Size', 'Num. Indexes', 'Indexes Size'].map((c) =>
        chalk.bold(c)
      )
    ].concat(data.sort())
  )
  .then((data) =>
    table(data, { columnDefault: { alignment: 'right' }, columns: { 0: { alignment: 'left' } } })
  )
  .then((data) => console.log(data))
  .finally(() => connection.disconnect());
