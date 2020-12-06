/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getIssuesOrPulls = require('../github/graphql/repositories/issues-or-pulls.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function _get(repositoryId, resource) {
  if (!resource || (resource !== 'issues' && resource !== 'pulls'))
    throw new TypeError('Resource must be "issues" or "pulls"!');

  const metaPath = { id: repositoryId, resource };
  const metadata = await dao.metadata.find({ ...metaPath, key: 'lastCursor' }).first();

  let lastCursor = (metadata && metadata.value) || null;

  for (let hasMore = true; hasMore; ) {
    hasMore = await getIssuesOrPulls(repositoryId, resource, {
      lastCursor,
      max: BATCH_SIZE
    }).then(async ({ users, [resource]: records, endCursor, hasNextPage }) => {
      lastCursor = endCursor || lastCursor;

      const ids = records.map((r) => r.id);
      const data = records.map((record) => ({
        repository: repositoryId,
        ...record,
        type: dao[resource].model.issueType
      }));

      await knex.transaction(async (trx) =>
        Promise.all([
          dao.metadata
            .delete({ resource: resource.slice(0, -1), key: 'updatedAt' }, trx)
            .whereIn('id', ids),
          dao.actors.insert(users, trx),
          dao[resource].upsert(data, trx),
          dao.metadata.upsert({ ...metaPath, key: 'lastCursor', value: lastCursor }, trx)
        ])
      );

      return hasNextPage;
    });
  }

  const [{ pending }] = await dao[resource]
    .find({})
    .leftJoin(
      dao.metadata.find({ ...metaPath, key: 'updatedAt' }).as('metadata'),
      `issues.id`,
      'metadata.id'
    )
    .whereNull('metadata.id')
    .andWhere('repository', repositoryId)
    .count('*', { as: 'pending' });

  await dao.metadata.upsert([
    { ...metaPath, key: 'updatedAt', value: new Date().toISOString() },
    { ...metaPath, key: 'pending', value: pending }
  ]);
};
