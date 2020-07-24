/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const consola = require('consola');
// const exporter = require('./index');

module.exports = async ({ repository, knex, mongo }) => {
  consola.debug(`[id=${repository}] getting stargazers ...`);
  const stargazers = await mongo.stargazers.find({ repository }).toArray();

  // consola.debug(`[id=${repository}] inserting ${stargazers.length} users ...`);
  // await exporter.user({ id: stargazers.map((s) => s.user), knex, mongo });

  consola.debug(`[id=${repository}] inserting ${stargazers.length} stars ...`);
  await knex.batchInsert(
    'stargazers',
    stargazers.map((stargazer) => omit({ id: stargazer._id, ...stargazer }, '_id'))
  );
};
