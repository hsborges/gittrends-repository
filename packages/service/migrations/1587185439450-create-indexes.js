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
    connection.stargazers.createIndexes([{ key: { repository: 1, user: 1 }, unique: true }]),
    connection.watchers.createIndexes([{ key: { repository: 1, user: 1 }, unique: true }]),
    connection.tags.createIndexes([{ key: { repository: 1 } }]),
    connection.commits.createIndexes([{ key: { repository: 1 } }]),
    connection.releases.createIndexes([{ key: { repository: 1 } }]),
    connection.dependencies.createIndexes([{ key: { repository: 1 } }]),
    connection.issues.createIndexes([{ key: { repository: 1, '_meta.updated_at': 1 } }]),
    connection.pulls.createIndexes([{ key: { repository: 1, '_meta.updated_at': 1 } }]),
    connection.timeline.createIndexes([
      { key: { repository: 1 } },
      { key: { issue: 1 }, sparse: true },
      { key: { pull: 1 }, sparse: true }
    ]),
    connection.reactions.createIndexes([
      { key: { repository: 1 } },
      { key: { issue: 1 }, sparse: true },
      { key: { pull: 1 }, sparse: true }
    ])
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
