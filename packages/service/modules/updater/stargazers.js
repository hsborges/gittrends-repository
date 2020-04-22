/*
 *  Author: Hudson S. Borges
 */
const _ = require('lodash');

const db = require('../connection.js');
const save = require('./_save.js');
const getStargazers = require('../github/graphql/repositories/stargazers');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const path = '_meta.stargazers';

  const repo = await db.repositories.findOne(
    { _id: repositoryId },
    { projection: { updated_at: 1, [path]: 1 } }
  );

  const metadata = _.get(repo, path, {});

  if (_.isEqual(repo.updated_at, metadata.repo_updated_at)) {
    // repository not modified
    await db.repositories.updateOne(
      { _id: repo._id },
      { $set: { [path]: { ...metadata, updated_at: new Date() } } }
    );
  } else {
    // repository modified
    for (let hasMore = true; hasMore; ) {
      hasMore = await getStargazers(repo._id, {
        lastCursor: metadata.last_cursor,
        max: BATCH_SIZE
      }).then(async ({ stargazers, users, endCursor, hasNextPage }) => {
        if (stargazers && stargazers.length) {
          await Promise.all([
            db.stargazers.bulkWrite(
              stargazers.map((s) => ({
                replaceOne: {
                  filter: { repository: repositoryId, user: s.user },
                  replacement: { repository: repositoryId, user: s.user, starred_at: s.starred_at },
                  upsert: true
                }
              })),
              { ordered: false }
            ),
            save.users(users)
          ]);
        }

        metadata.last_cursor = endCursor || metadata.last_cursor;
        if (!hasNextPage) {
          metadata.updated_at = new Date();
          metadata.repo_updated_at = repo.updated_at;
        }

        await db.repositories.updateOne({ _id: repositoryId }, { $set: { [path]: metadata } });
        return hasNextPage;
      });
    }
  }
};
