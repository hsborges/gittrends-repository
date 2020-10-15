/*
 *  Author: Hudson S. Borges
 */
const { omit, chunk } = require('lodash');
const consola = require('consola');

module.exports = async ({ repository, knex, mongo, BATCH_SIZE = 50 }) => {
  consola.debug(`[id=${repository}] getting watchers ...`);
  const watchers = await mongo.watchers.find({ repository }).toArray();

  consola.debug(`[id=${repository}] inserting ${watchers.length} watchers ...`);
  await Promise.all(
    chunk(watchers, BATCH_SIZE).map((batch) =>
      knex.batchInsert(
        'watchers',
        batch.map((watcher) => omit({ id: watcher._id, ...watcher }, '_id'))
      )
    )
  );
};
