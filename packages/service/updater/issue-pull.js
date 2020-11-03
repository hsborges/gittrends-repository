/*
 *  Author: Hudson S. Borges
 */
const { get, omit } = require('lodash');
const { mongo } = require('@gittrends/database-config');

const save = require('./_save.js');
const remove = require('./_remove.js');
const compact = require('../helpers/compact.js');
const { NotFoundError } = require('../helpers/errors.js');
const getIssueOrPull = require('../github/graphql/repositories/issue-or-pull.js');
const getReactions = require('../github/graphql/repositories/reactions.js');

async function saveReactions(reactions, users, { repository, issue, pull, event }) {
  return Promise.all([
    save.reactions(reactions.map((r) => compact({ ...r, repository, issue, pull, event }))),
    save.users(users)
  ]);
}

/* exports */
module.exports = async function _get(id, resource) {
  if (!resource || (resource !== 'issue' && resource !== 'pull'))
    throw new TypeError('Resource must be "issue" or "pull"!');

  const collection = mongo[`${resource}s`];

  return collection.findOne({ _id: id }).then((r) =>
    getIssueOrPull(id, resource, { lastCursor: get(r, '_meta.last_cursor') })
      .then(async ({ [resource]: data, timeline = [], commits = [], users = [], endCursor }) => {
        const reactables = timeline
          .filter((e) => e.reaction_groups)
          .map((e) => ({ id: e.id, event: true }))
          .concat(data.reaction_groups ? [{ id }] : []);

        await Promise.all([
          getReactions(reactables).then((responses) =>
            Promise.mapSeries(responses, (response, index) =>
              saveReactions(response.reactions, response.users, {
                repository: r.repository,
                [resource]: id,
                ...(reactables[index].event ? { event: reactables[index].id } : {})
              })
            )
          ),
          save.timeline(timeline.map((e) => ({ ...e, repository: r.repository, [resource]: id }))),
          save.commits(commits.map((c) => ({ ...c, repository: r.repository }))),
          save.users(users)
        ]).then(() =>
          collection.replaceOne(
            { _id: id },
            {
              ...omit(data, ['id', 'reaction_groups']),
              repository: r.repository,
              _meta: {
                updated_at: new Date(),
                last_cursor: endCursor || get(r, '_meta.last_cursor')
              }
            }
          )
        );
      })
      .then(() =>
        mongo.repositories.updateOne(
          { _id: r.repository },
          { $inc: { [`_meta.${resource}s.pending`]: -1 } }
        )
      )
      .catch(async (err) => {
        if (err instanceof NotFoundError) await remove[resource]({ id });
        throw err;
      })
  );
};
