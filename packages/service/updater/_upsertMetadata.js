/*
 *  Author: Hudson S. Borges
 */
const { Metadata } = require('@gittrends/database-config');

module.exports = function (metadata, transaction) {
  return Metadata.query(transaction)
    .insert(metadata)
    .toKnexQuery()
    .onConflict(['id', 'resource', 'key'])
    .merge();
};
