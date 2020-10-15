/*
 *  Author: Hudson S. Borges
 */
const { omit, chunk } = require('lodash');
const consola = require('consola');

module.exports = async ({ repository, knex, mongo, BATCH_SIZE = 50 }) => {
  consola.debug(`[id=${repository}] getting stargazers ...`);
  const stargazers = await mongo.stargazers.find({ repository }).toArray();

  consola.debug(`[id=${repository}] inserting ${stargazers.length} stars ...`);
  await Promise.all(
    chunk(stargazers, BATCH_SIZE).map((batch) =>
      knex.batchInsert(
        'stargazers',
        batch.map((stargazer) => omit({ id: stargazer._id, ...stargazer }, '_id'))
      )
    )
  );
};
