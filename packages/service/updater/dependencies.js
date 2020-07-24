/*
 *  Author: Hudson S. Borges
 */
const { get, isEqual } = require('lodash');
const { mongo } = require('@monorepo/database-config');

const getDependencies = require('../github/graphql/repositories/dependencies.js');

/* exports */
module.exports = async (repositoryId) => {
  const path = '_meta.dependencies';

  const repo = await mongo.repositories.findOne(
    { _id: repositoryId },
    { projection: { pushed_at: 1, [path]: 1 } }
  );

  // modified or not updated
  if (!isEqual(repo.pushed_at, get(repo, [path, 'repo_pushed_at']))) {
    await getDependencies(repo._id).then(async ({ dependencies }) => {
      await mongo.dependencies.deleteMany({ repository: repo._id });

      if (dependencies && dependencies.length) {
        await mongo.dependencies.bulkWrite(
          dependencies.map((dep) => ({
            insertOne: { document: { repository: repo._id, ...dep } }
          })),
          { ordered: false }
        );
      }
    });
  }

  return mongo.repositories.updateOne(
    { _id: repo._id },
    { $set: { [path]: { updated_at: new Date(), repo_pushed_at: repo.pushed_at } } }
  );
};
