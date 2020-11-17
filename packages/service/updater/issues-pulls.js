/*
 *  Author: Hudson S. Borges
 */
const { knex, Issue, PullRequest, Metadata } = require('@gittrends/database-config');

const insertUsers = require('./_insertActors');
const getIssuesOrPulls = require('../github/graphql/repositories/issues-or-pulls.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function _get(repositoryId, resource) {
  if (!resource || (resource !== 'issues' && resource !== 'pulls'))
    throw new TypeError('Resource must be "issues" or "pulls"!');

  const metaPath = { id: repositoryId, resource };
  const metadata = await Metadata.query()
    .where({ ...metaPath, key: 'lastCursor' })
    .first();

  const Model = resource === 'issues' ? Issue : PullRequest;
  let lastCursor = metadata && metadata.value;

  return knex.transaction(async (trx) => {
    for (let hasMore = true; hasMore; ) {
      hasMore = await getIssuesOrPulls(repositoryId, resource, {
        lastCursor,
        max: BATCH_SIZE
      }).then(async ({ users, [resource]: records, endCursor, hasNextPage }) => {
        lastCursor = endCursor || lastCursor;

        if (users && users.length) await insertUsers(users, trx);

        if (records && records.length) {
          await Promise.map(records, async (record) => {
            await Metadata.query(trx)
              .delete()
              .where({ id: record.id, resource: resource.slice(0, -1), key: 'updatedAt' })
              .then(() => Model.query(trx).delete().where({ id: record.id }))
              .then(() => Model.query(trx).insert({ repository: repositoryId, ...record }));
          });
        }

        await Metadata.query(trx)
          .insert({ ...metaPath, key: 'lastCursor', value: lastCursor })
          .toKnexQuery()
          .onConflict(['id', 'resource', 'key'])
          .merge();

        return hasNextPage;
      });
    }

    const [{ pending }] = await Model.query(trx)
      .leftJoin(
        Metadata.query(trx)
          .where({ ...metaPath, key: 'updatedAt' })
          .as('metadata'),
        `issues.id`,
        'metadata.id'
      )
      .whereNull('metadata.id')
      .andWhere('type', resource === 'issues' ? 'ISSUE' : 'PULL_REQUEST')
      .count('*', { as: 'pending' });

    return Metadata.query(trx)
      .insert([
        { ...metaPath, key: 'updatedAt', value: new Date().toISOString() },
        { ...metaPath, key: 'pending', value: pending }
      ])
      .toKnexQuery()
      .onConflict(['id', 'resource', 'key'])
      .merge();
  });
};
