/*
 *  Author: Hudson S. Borges
 */
const connection = require('../modules/connection.js');

module.exports.up = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.issues.dropIndexes();
  await connection.pulls.dropIndexes();
  await connection.issues.createIndexes([{ key: { repository: 1, '_meta.updated_at': 1 } }]);
  await connection.pulls.createIndexes([{ key: { repository: 1, '_meta.updated_at': 1 } }]);
  return connection.disconnect();
};

module.exports.down = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.issues.dropIndexes();
  await connection.pulls.dropIndexes();
  await connection.issues.createIndexes([{ key: { repository: 1 } }]);
  await connection.pulls.createIndexes([{ key: { repository: 1 } }]);
  return connection.disconnect();
};
