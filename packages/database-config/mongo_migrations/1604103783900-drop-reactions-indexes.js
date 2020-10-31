/*
 *  Author: Hudson S. Borges
 */
const connection = require('../mongo');

module.exports.up = async function () {
  if (!connection.isConnected) await connection.connect();

  await connection.reactions.dropIndexes();
  await connection.disconnect();
};

module.exports.down = async function () {
  if (!connection.isConnected) await connection.connect();

  await connection.reactions.createIndexes([
    { key: { repository: 1 } },
    { key: { issue: 1 }, sparse: true },
    { key: { pull: 1 }, sparse: true }
  ]);

  await connection.disconnect();
};
