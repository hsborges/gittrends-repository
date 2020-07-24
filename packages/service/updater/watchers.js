/*
 *  Author: Hudson S. Borges
 */
const _ = require('lodash');
const { mongo } = require('@monorepo/database-config');

const save = require('./_save.js');
const getWatchers = require('../github/graphql/repositories/watchers.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async (repositoryId) => {
  const path = '_meta.watchers';

  const repo = await mongo.repositories.findOne(
    { _id: repositoryId },
    { projection: { updated_at: 1, [path]: 1 } }
  );

  const metadata = _.get(repo, path, {});

  if (_.isEqual(repo.updated_at, metadata.repo_updated_at)) {
    // repository not modified
    await mongo.repositories.updateOne(
      { _id: repo._id },
      { $set: { [path]: { ...metadata, updated_at: new Date() } } }
    );
  } else {
    // modified or not updated
    for (let hasMore = true; hasMore; ) {
      hasMore = await getWatchers(repo._id, {
        lastCursor: metadata.last_cursor,
        max: BATCH_SIZE
      }).then(async ({ watchers, users, endCursor, hasNextPage }) => {
        if (watchers && watchers.length) {
          await Promise.join(
            mongo.watchers
              .bulkWrite(
                watchers.map((watcher) => ({
                  insertOne: { document: { repository: repo._id, ...watcher } }
                })),
                { ordered: false }
              )
              .catch((err) => (err.code === 11000 ? null : Promise.reject(err))),
            save.users(users)
          );
        }

        metadata.last_cursor = endCursor || metadata.last_cursor;
        if (!hasNextPage) {
          metadata.updated_at = new Date();
          metadata.repo_updated_at = repo.updated_at;
        }

        await mongo.repositories.updateOne({ _id: repo._id }, { $set: { [path]: metadata } });
        return hasNextPage;
      });
    }
  }
};
