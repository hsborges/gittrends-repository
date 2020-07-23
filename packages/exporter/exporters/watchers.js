/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const exporter = require('./index');

module.exports = async ({ repository, knex, mongo }) => {
  const cursor = mongo.watchers.find({ repository });

  while (await cursor.hasNext()) {
    const watcher = await cursor.next();
    await exporter.user({ id: watcher.user, knex, mongo });
    await knex('watchers').insert(omit({ id: watcher._id, ...watcher }, '_id'));
  }
};
