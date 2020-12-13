/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');
const { knex } = require('@gittrends/database-config');
const { ForbiddenError, NotFoundError } = require('../helpers/errors.js');

const dao = require('./helper/dao');
const getIssueOrPull = require('../github/graphql/repositories/issue-or-pull.js');
const getReactions = require('../github/graphql/repositories/reactions.js');

async function saveReactions(reactions, users, { repository, issue, event, trx }) {
  const rows = reactions.map((r) => ({ ...r, repository, issue, event }));
  return Promise.all([dao.actors.insert(users, trx), dao.reactions.insert(rows, trx)]);
}

/* exports */
module.exports = async function _get(id, resource) {
  if (!resource || (resource !== 'issue' && resource !== 'pull'))
    throw new TypeError('Resource must be "issue" or "pull"!');

  const [record, metadata] = await Promise.all([
    dao[`${resource}s`].find({ id }).select('repository').first(),
    dao.metadata.find({ id, resource, key: 'lastCursor' }).first()
  ]);

  const lastCursor = (metadata && metadata.value) || null;

  await knex.transaction((trx) =>
    getIssueOrPull(id, resource, { lastCursor })
      .then(async ({ [resource]: data, timeline = [], commits = [], users = [], endCursor }) => {
        const reactables = timeline
          .filter((e) => e.reaction_groups)
          .map((e) => ({ id: e.id, event: true }))
          .concat(data.reaction_groups ? [{ id }] : []);

        const commitRows = commits.map((c) => ({ ...c, repository: record.repository }));
        const timelineRows = timeline.map((e) => ({
          id: e.id,
          repository: record.repository,
          issue: id,
          type: e.type,
          payload: omit(e, ['id', 'type'])
        }));

        await Promise.all([
          dao.actors.insert(users, trx),
          dao[`${resource}s`].update({ repository: record.repository, ...data }),
          dao.commits.insert(commitRows, trx),
          dao.timeline.insert(timelineRows, trx)
        ]);

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

        await dao.metadata.upsert([
          { id, resource, key: 'lastCursor', value: endCursor || lastCursor },
          { id, resource, key: 'updatedAt', value: new Date().toISOString() }
        ]);
      })
      .catch(async (err) => {
        /*
         *  TODO - remove this code and update database when github fix this issue
         *  https://github.community/t/cannot-get-public-information-from-addedtoprojectevent-events/124989/7
         */
        if (!(err instanceof ForbiddenError)) throw err;

        await dao.metadata.upsert([
          { id, resource, key: 'updatedAt', value: new Date().toISOString() },
          { id, resource, key: 'forbidden', value: 'true' }
        ]);
      })
      .then(() =>
        trx.raw(
          'UPDATE metadata SET value = value::integer - 1 WHERE id = ? AND resource = ? AND key = ?',
          [record.repository, `${resource}s`, 'pending']
        )
      )
      .catch(async (err) => {
        if (err instanceof NotFoundError) await dao[`${resource}s`].delete({ id }, trx);
        throw err;
      })
  );
};
