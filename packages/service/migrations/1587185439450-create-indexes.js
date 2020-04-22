/*
 *  Author: Hudson S. Borges
 */
const connection = require('../modules/connection.js');

module.exports.up = async function () {
  if (!connection.isConnected) await connection.connect();

  return Promise.all([
    connection.users.createIndexes([
      { key: { type: 1 } },
      { key: { '_meta.updated_at': 1 }, sparse: true }
    ]),
    connection.repositories.createIndexes([
      { key: { '_meta.updated_at': 1 }, sparse: true },
      { key: { '_meta.removed': 1 }, sparse: true }
    ]),
    connection.stargazers.createIndexes([
      { key: { repository: 1, user: 1, starred_at: 1 }, unique: true },
      { key: { removed_at: 1 }, sparse: true }
    ]),
    connection.watchers.createIndexes([{ key: { repository: 1, user: 1 }, unique: true }]),
    connection.tags.createIndexes([{ key: { repository: 1 } }]),
    connection.commits.createIndexes([{ key: { repository: 1 } }]),
    connection.releases.createIndexes([{ key: { repository: 1 } }]),
    connection.dependencies.createIndexes([{ key: { repository: 1 } }]),
    connection.issues.createIndexes([{ key: { repository: 1 } }]),
    connection.pulls.createIndexes([{ key: { repository: 1 } }]),
    connection.timeline.createIndexes([
      { key: { repository: 1, issue: 1 } },
      { key: { repository: 1, pull: 1 } }
    ]),
    connection.reactions.createIndexes([{ key: { repository: 1 } }])
  ]).then(() => connection.disconnect());
};

module.exports.down = async function () {
  if (!connection.isConnected) await connection.connect();

  return Promise.all([
    connection.users.dropIndexes(),
    connection.repositories.dropIndexes(),
    connection.stargazers.dropIndexes(),
    connection.watchers.dropIndexes(),
    connection.tags.dropIndexes(),
    connection.commits.dropIndexes(),
    connection.releases.dropIndexes(),
    connection.dependencies.dropIndexes(),
    connection.issues.dropIndexes(),
    connection.pulls.dropIndexes(),
    connection.timeline.dropIndexes(),
    connection.reactions.dropIndexes()
  ]).then(() => connection.disconnect());
};
