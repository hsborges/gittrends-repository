/*
 *  Author: Hudson S. Borges
 */
const { omit, chunk } = require('lodash');
const consola = require('consola');

const exporter = require('./index');

module.exports = async ({ repository, knex, mongo, BATCH_SIZE = 1000 }) => {
  consola.debug(`[id=${repository}] getting stargazers ...`);
  const stargazers = await mongo.stargazers.find({ repository }).toArray();

  consola.debug(`[id=${repository}] inserting ${stargazers.length} stars ...`);
  await Promise.mapSeries(chunk(stargazers, BATCH_SIZE), (batch) =>
    exporter.user({ id: batch.map((stargazer) => stargazer.user), knex, mongo }).then(() =>
      knex.batchInsert(
        'stargazers',
        batch.map((stargazer) => omit({ id: stargazer._id, ...stargazer }, '_id'))
      )
    )
  );
};
