/*
 *  Author: Hudson S. Borges
 */
const { get, omit, isEqual } = require('lodash');
const { mongo } = require('@gittrends/database-config');
const Bottleneck = require('bottleneck');

const save = require('./_save.js');
const remove = require('./_remove.js');
const compact = require('../helpers/compact.js');
const { NotFoundError, RequestError } = require('../helpers/errors.js');
const getIssueOrPull = require('../github/graphql/repositories/issue-or-pull.js');
const getIssuesOrPulls = require('../github/graphql/repositories/issues-or-pulls.js');
const getReactions = require('../github/graphql/repositories/reactions.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

const saveReactions = async (reactions, users, { repository, issue, pull, event }) => {
  if (reactions && reactions.length) {
    await mongo.reactions.bulkWrite(
      reactions.map((r) => ({
        replaceOne: {
          filter: { _id: r.id },
          replacement: {
            ...compact({ repository, issue, pull, event }),
            ...omit(r, 'id')
          },
          upsert: true
        }
      })),
      { ordered: true }
    );
  }
  return save.users(users);
};

const updateDetails = async function (repo, type = 'issue') {
  const errors = [];
  const collection = mongo[`${type}s`];

  const limiter = new Bottleneck({
    minTime: 0,
    maxConcurrent: parseInt(process.env.GITTRENDS_UPDATER_CONCURRENCY || 1, 10)
  });

  const promises = (
    await collection
      .aggregate(
        [
          { $match: { repository: repo._id, '_meta.updated_at': { $exists: false } } },
          { $project: { _id: 1, _meta: 1 } }
        ],
        { batchSize: 10, allowDiskUse: true }
      )
      .toArray()
  ).map((i) =>
    limiter.schedule(() =>
      getIssueOrPull(i._id, type, { lastCursor: get(i, '_meta.last_cursor') })
        .then(async ({ [type]: data, timeline = [], commits = [], users = [], endCursor }) => {
          const reactables = timeline
            .filter((e) => e.reaction_groups)
            .map((e) => ({ id: e.id, event: true }))
            .concat(data.reaction_groups ? [{ id: i._id }] : []);

          const reactionsPromise = getReactions(reactables).then((responses) =>
            Promise.map(responses, (response, index) =>
              saveReactions(response.reactions, response.users, {
                repository: repo._id,
                [type]: i._id,
                ...(reactables[index].event ? { event: reactables[index].id } : {})
              })
            )
          );

          const timelinePromise =
            timeline && timeline.length
              ? mongo.timeline.bulkWrite(
                  timeline.map((event) => ({
                    replaceOne: {
                      filter: { _id: event.id },
                      replacement: {
                        repository: repo._id,
                        [type]: i._id,
                        ...omit(event, ['id', 'reaction_groups'])
                      },
                      upsert: true
                    }
                  })),
                  { ordered: false }
                )
              : null;

          const commitsPromise =
            commits && commits.length
              ? mongo.commits.bulkWrite(
                  commits.map((commit) => {
                    const filter = { _id: commit.id };
                    const replacement = { repository: repo._id, ...omit(commit, 'id') };
                    return { replaceOne: { filter, replacement, upsert: true } };
                  }),
                  { ordered: false }
                )
              : null;

          const usersPromise = users && users.length ? save.users(users) : null;

          await Promise.all([reactionsPromise, timelinePromise, commitsPromise, usersPromise]).then(
            () =>
              collection.replaceOne(
                { _id: i._id },
                {
                  ...omit(data, ['id', 'reaction_groups']),
                  _meta: {
                    updated_at: new Date(),
                    last_cursor: endCursor || get(i, '_meta.last_cursor')
                  }
                }
              )
          );
        })
        .catch(async (err) => {
          if (err instanceof NotFoundError) await remove[type]({ id: i._id });
          else errors.push(err);
        })
    )
  );

  await Promise.all(promises);

  const graphqlErrors = errors
    .filter((e) => e instanceof RequestError)
    .filter((e) => /something.went.wrong/i.test(JSON.stringify(e.response)));

  if (errors.length !== graphqlErrors.length) throw errors;
};

/* exports */
module.exports = async function _get(repositoryId, resource = 'issues') {
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

    await updateDetails(repo, resource.slice(0, -1));
  }

  return mongo.repositories.updateOne(
    { _id: repo._id },
    { $set: { [`${path}.updated_at`]: new Date(), [`${path}.repo_updated_at`]: repo.updated_at } }
  );
};
