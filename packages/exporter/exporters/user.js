/*
 *  Author: Hudson S. Borges
 */
const moment = require('moment');
const { omit } = require('lodash');

module.exports = async ({ id, knex, mongo }) => {
  const user = await mongo.users.findOne(
    { _id: id },
    {
      projection: {
        _id: 1,
        login: 1,
        type: 1,
        name: 1,
        location: 1,
        avatar_url: 1,
        website_url: 1,
        repositories_count: 1,
        starred_repositories_count: 1,
        gists_count: 1,
        watching_count: 1,
        followers_count: 1,
        following_count: 1,
        created_at: 1,
        updated_at: 1
      }
    }
  );

  if (user) {
    await knex('users')
      .where({ id: user._id })
      .first('updated_at')
      .then((u) => {
        if (!u) return knex('users').insert(omit({ id: user._id, ...user }, '_id'));
        if (moment(u.updated_at).isSame(user.updated_at))
          return knex('users').where({ id: user._id }).update(omit(user, '_id'));
        return null;
      });
  }
};
