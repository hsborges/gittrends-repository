/*
 *  Author: Hudson S. Borges
 */
const connection = require('../modules/connection.js');

module.exports.up = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.stargazers.dropIndexes();
  await connection.stargazers.createIndexes([{ key: { repository: 1, user: 1 }, unique: true }]);
  return connection.disconnect();
};

module.exports.down = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.stargazers.dropIndexes();
  await connection.stargazers.createIndexes([
    { key: { repository: 1, user: 1, starred_at: 1 }, unique: true }
  ]);
  return connection.disconnect();
};
