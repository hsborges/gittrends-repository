/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const exporter = require('./index');

module.exports = async ({ repository, knex, mongo }) => {
  const cursor = mongo.stargazers.find({ repository });

  while (await cursor.hasNext()) {
    const stargazer = await cursor.next();
    await exporter.user({ id: stargazer.user, knex, mongo });
    await knex('stargazers').insert(omit({ id: stargazer._id, ...stargazer }, '_id'));
  }
};
