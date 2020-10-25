/*
 *  Author: Hudson S. Borges
 */
const { omit, chunk } = require('lodash');
const consola = require('consola');

const exporter = require('./index');

module.exports = async ({ repository, knex, mongo, BATCH_SIZE = 1000 }) => {
  consola.debug(`[id=${repository}] getting watchers ...`);
  const watchers = await mongo.watchers.find({ repository }).toArray();

  consola.debug(`[id=${repository}] inserting ${watchers.length} watchers ...`);
  await Promise.mapSeries(chunk(watchers, BATCH_SIZE), (batch) =>
    exporter.user({ id: batch.map((stargazer) => stargazer.user), knex, mongo }).then(() =>
      knex.batchInsert(
        'watchers',
        batch.map((watcher) => omit({ id: watcher._id, ...watcher }, '_id'))
      )
    )
  );
};
