/*
 *  Author: Hudson S. Borges
 */
const { get, omit, isEqual } = require('lodash');
const { mongo } = require('@gittrends/database-config');

const save = require('./_save.js');
const getIssuesOrPulls = require('../github/graphql/repositories/issues-or-pulls.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function _get(repositoryId, resource) {
  if (!resource || (resource !== 'issues' && resource !== 'pulls'))
    throw new TypeError('Resource must be "issues" or "pulls"!');

  const path = `_meta.${resource}`;

  const repo = await mongo.repositories.findOne(
    { _id: repositoryId },
    { projection: { updated_at: 1, [path]: 1 } }
  );

  const metadata = get(repo, path, {});

  // modified or not updated
  if (!isEqual(repo.updated_at, metadata.repo_updated_at)) {
    for (let hasMore = true; hasMore; ) {
      hasMore = await getIssuesOrPulls(repo._id, resource, {
        lastCursor: metadata.last_cursor,
        max: BATCH_SIZE
      })
        .then(async ({ issues, pulls, ...other }) => {
          const [_issues, _pulls] = await Promise.all([
            Promise.map(issues || [], async (issue) =>
              mongo.issues
                .findOne({ _id: issue.id }, { projection: { _meta: 1 } })
                .then((d) => (d ? { ...issue, _meta: omit(d._meta, 'updated_at') } : issue))
            ),
            Promise.map(pulls || [], async (pull) =>
              mongo.pulls
                .findOne({ _id: pull.id }, { projection: { _meta: 1 } })
                .then((d) => (d ? { ...pull, _meta: omit(d._meta, 'updated_at') } : pull))
            )
          ]);

          return { issues: _issues, pulls: _pulls, ...other };
        })
        .then(async ({ users, issues, pulls, endCursor, hasNextPage }) => {
          metadata.last_cursor = endCursor || metadata.last_cursor;

          if (issues && issues.length) {
            const operations = issues.map((issue) => {
              const filter = { _id: issue.id };
              const replacement = { repository: repo._id, ...omit(issue, 'id') };
              return { replaceOne: { filter, replacement, upsert: true } };
            });
            await mongo.issues.bulkWrite(operations, { ordered: false });
          }

          if (pulls && pulls.length) {
            const operations = pulls.map((pull) => {
              const filter = { _id: pull.id };
              const replacement = { repository: repo._id, ...omit(pull, 'id') };
              return { replaceOne: { filter, replacement, upsert: true } };
            });
            await mongo.pulls.bulkWrite(operations, { ordered: false });
          }

          if (users && users.length) await save.users(users);

          await mongo.repositories.updateOne({ _id: repo._id }, { $set: { [path]: metadata } });

          return hasNextPage;
        });
    }
  }

  return mongo.repositories.updateOne(
    { _id: repo._id },
    {
      $set: {
        [`${path}.updated_at`]: new Date(),
        [`${path}.repo_updated_at`]: repo.updated_at,
        [`${path}.pending`]: await mongo[resource].estimatedDocumentCount({ repository: repo._id })
      }
    }
  );
};
