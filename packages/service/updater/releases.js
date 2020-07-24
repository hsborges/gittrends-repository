/*
 *  Author: Hudson S. Borges
 */
const { omit, get, isEqual } = require('lodash');
const { mongo } = require('@monorepo/database-config');

const save = require('./_save.js');
const getReleases = require('../github/graphql/repositories/releases.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const path = '_meta.releases';

  const repo = await mongo.repositories.findOne(
    { _id: repositoryId },
    { projection: { updated_at: 1, [path]: 1 } }
  );

  const metadata = get(repo, path, {});

  if (isEqual(repo.updated_at, metadata.repo_updated_at)) {
    // repository not modified
    await mongo.repositories.updateOne(
      { _id: repo._id },
      { $set: { [path]: { ...metadata, updated_at: new Date() } } }
    );
  } else {
    // modified or not updated
    for (let hasMore = true; hasMore; ) {
      hasMore = await getReleases(repo._id, {
        lastCursor: metadata.last_cursor,
        max: BATCH_SIZE
      }).then(async ({ releases, users, endCursor, hasNextPage }) => {
        if (releases && releases.length) {
          const operations = releases.map((release) => ({
            replaceOne: {
              filter: { _id: release.id },
              replacement: { repository: repo._id, ...omit(release, 'id') },
              upsert: true
            }
          }));

          await Promise.join(
            mongo.releases.bulkWrite(operations, { ordered: false }),
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
