/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const db = require('@gittrends/database-config');

const dao = require('./helper/dao');
const { NotFoundError } = require('../helpers/errors.js');
const getIssueOrPull = require('../github/graphql/repositories/issue-or-pull.js');
const getReactions = require('../github/graphql/repositories/reactions.js');

async function saveReactions(reactions, users, { repository, issue, event, trx }) {
  return dao.actors.insert(users, trx).then(() => {
    const rows = reactions.map((r) => ({ ...r, repository, issue, event }));
    return dao.reactions.insert(rows, trx);
  });
}

/* exports */
module.exports = async function _get(id, resource) {
  if (!resource || (resource !== 'issue' && resource !== 'pull'))
    throw new TypeError('Resource must be "issue" or "pull"!');

  const Model = resource === 'issue' ? db.Issue : db.PullRequest;
  const record = await Model.query().findById(id).select('repository').first();
  const metadata = await dao.metadata.find({ id, resource, key: 'lastCursor' }).first();

  const lastCursor = metadata && metadata.value;

  return db.knex.transaction((trx) =>
    getIssueOrPull(id, resource, { lastCursor })
      .then(async ({ [resource]: data, timeline = [], commits = [], users = [], endCursor }) => {
        const reactables = timeline
          .filter((e) => e.reaction_groups)
          .map((e) => ({ id: e.id, event: true }))
          .concat(data.reaction_groups ? [{ id }] : []);

        await dao.actors
          .insert(users, trx)
          .then(async () => {
            const rows = commits.map((c) => ({ ...c, repository: record.repository }));
            await dao.commits.insert(rows, trx);

            await dao.timeline.insert(
              timeline.map((e) => ({
                id: e.id,
                repository: record.repository,
                issue: id,
                type: e.type,
                payload: omit(e, ['id', 'type'])
              })),
              trx
            );

            await getReactions(reactables).then((responses) =>
              Promise.map(responses, (response, index) =>
                saveReactions(response.reactions, response.users, {
                  repository: record.repository,
                  issue: id,
                  ...(reactables[index].event ? { event: reactables[index].id } : {}),
                  trx
                })
              )
            );
          })
          .then(() =>
            dao.metadata.upsert([
              { id, resource, key: 'lastCursor', value: endCursor || lastCursor },
              { id, resource, key: 'updatedAt', value: new Date().toISOString() }
            ])
          );
      })
      .then(() =>
        trx.raw(
          'UPDATE metadata SET value = value::integer - 1 WHERE id = ? AND resource = ? AND key = ?',
          [record.repository, `${resource}s`, 'pending']
        )
      )
      .catch(async (err) => {
        if (err instanceof NotFoundError) await Model.query(trx).deleteById(id);
        throw err;
      })
  );
};
