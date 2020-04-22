/*
 *  Author: Hudson S. Borges
 */
const { get, omit, isEqual } = require('lodash');

const db = require('../connection.js');
const save = require('./_save.js');
const getTags = require('../github/graphql/repositories/tags.js');

/* exports */
module.exports = async (repositoryId) => {
  const path = '_meta.tags';

  const repo = await db.repositories.findOne(
    { _id: repositoryId },
    { projection: { name_with_owner: 1, updated_at: 1, [path]: 1 } }
  );

  const metadata = get(repo, path, {});

  // modified or not updated
  if (!isEqual(repo.updated_at, get(repo, [path, 'repo_updated_at']))) {
    await getTags(repo._id, { lastCursor: metadata.last_cursor }).then(
      async ({ tags, commits, users, endCursor }) => {
        await Promise.all([
          tags.length
            ? db.tags.bulkWrite(
                tags.map((tag) => ({
                  replaceOne: {
                    filter: { _id: tag.id },
                    replacement: { repository: repo._id, ...omit(tag, 'id') },
                    upsert: true
                  }
                })),
                { ordered: false }
              )
            : Promise.resolve(),
          commits.length
            ? db.commits.bulkWrite(
                commits.map((commit) => ({
                  replaceOne: {
                    filter: { _id: commit.id },
                    replacement: { repository: repo._id, ...omit(commit, 'id') },
                    upsert: true
                  }
                })),
                { ordered: false }
              )
            : Promise.resolve(),
          save.users(users)
        ]);

        metadata.last_cursor = endCursor || metadata.last_cursor;
      }
    );
  }

  return db.repositories.updateOne(
    { _id: repo._id },
    { $set: { [path]: { ...metadata, updated_at: new Date() } } }
  );
};
