/*
 *  Author: Hudson S. Borges
 */
const { get, isEqual } = require('lodash');

const db = require('../connection.js');
const getDependencies = require('../github/graphql/repositories/dependencies.js');

/* exports */
module.exports = async (repositoryId) => {
  const path = '_meta.dependencies';

  const repo = await db.repositories.findOne(
    { _id: repositoryId },
    { projection: { pushed_at: 1, [path]: 1 } }
  );

  // modified or not updated
  if (!isEqual(repo.pushed_at, get(repo, [path, 'repo_pushed_at']))) {
    await getDependencies(repo._id).then(async ({ dependencies }) => {
      await db.dependencies.deleteMany({ repository: repo._id });

      if (dependencies && dependencies.length) {
        await db.dependencies.bulkWrite(
          dependencies.map((dep) => ({
            insertOne: { document: { repository: repo._id, ...dep } }
          })),
          { ordered: false }
        );
      }
    });
  }

  return db.repositories.updateOne(
    { _id: repo._id },
    { $set: { [path]: { updated_at: new Date(), repo_pushed_at: repo.pushed_at } } }
  );
};
