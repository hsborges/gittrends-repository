/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const consola = require('consola');
// const exporter = require('./index');

module.exports = async ({ repository, knex, mongo }) => {
  consola.debug(`[id=${repository}] getting watchers ...`);
  const watchers = await mongo.watchers.find({ repository }).toArray();

  // consola.debug(`[id=${repository}] inserting ${watchers.length} users ...`);
  // await exporter.user({ id: watchers.map((s) => s.user), knex, mongo });

  consola.debug(`[id=${repository}] inserting ${watchers.length} watchers ...`);
  await knex.batchInsert(
    'watchers',
    watchers.map((watcher) => omit({ id: watcher._id, ...watcher }, '_id'))
  );
};
