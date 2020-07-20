/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const numeral = require('numeral');
const chalk = require('chalk');
const { table } = require('table');

const connection = require('../modules/connection.js');

Promise.resolve()
  .then(() => connection.connect())
  .then(() =>
    connection.db
      .listCollections()
      .toArray()
      .map((c) => c.name)
  )
  .then((names) => {
    return Promise.mapSeries(names, async (name) => {
      const stats = await connection.db.collection(name).stats();
      return [name, stats.count, stats.storageSize, stats.nindexes, stats.totalIndexSize];
    }).then((data) =>
      [
        ...data.sort(),
        data.reduce((m, d) => [
          '',
          d[1] + (m[1] || 0),
          d[2] + (m[2] || 0),
          d[3] + (m[3] || 0),
          d[4] + (m[4] || 0)
        ])
      ].map((row) => [
        row[0],
        numeral(row[1]).format('0.[00]a'),
        numeral(row[2]).format('0.0b'),
        numeral(row[3]).format('0,0'),
        numeral(row[4]).format('0.0b')
      ])
    );
  })
  .then((data) => [
    ['Collection', 'Documents', 'Storage Size', 'Num. Indexes', 'Indexes Size'].map((c) =>
      chalk.bold(c)
    ),
    ...data
  ])
  .then((data) =>
    table(data, { columnDefault: { alignment: 'right' }, columns: { 0: { alignment: 'left' } } })
  )
  .then((data) => console.log(data))
  .finally(() => connection.disconnect());
