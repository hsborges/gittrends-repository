/*
 *  Author: Hudson S. Borges
 */
const { chain, get, omit, isString, merge } = require('lodash');

const compact = require('../../../helpers/compact.js');
const { BadGatewayError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const IssueComponent = require('../components/IssueComponent');
const PullRequestComponent = require('../components/PullRequestComponent');

/* eslint-disable no-param-reassign, global-require */
module.exports = async function (id, type, { lastCursor } = {}) {
  if (!type || (type !== 'issue' && type !== 'pull'))
    throw new TypeError('Type must be "issue" or "pull"!');

  const component = type === 'issue' ? IssueComponent : PullRequestComponent;

  let ghObject = null;

  const timeline = { items: [], hasNext: true, endCursor: lastCursor };
  const assignees = { items: [], hasNext: true, endCursor: null };
  const labels = { items: [], hasNext: true, endCursor: null };
  const participants = { items: [], hasNext: true, endCursor: null };
  const users = [];
  const commits = [];

  let reducer = 0;

  for (; assignees.hasNext || labels.hasNext || participants.hasNext || timeline.hasNext; ) {
    const first = 100 - reducer;

    component
      .includeDetails(ghObject === null)
      .includeAssignees(assignees.hasNext, { first, after: assignees.endCursor })
      .includeLabels(labels.hasNext, { first, after: labels.endCursor })
      .includeParticipants(participants.hasNext, { first, after: participants.endCursor })
      .includeTimeline(timeline.hasNext, { first, after: timeline.endCursor });

    await Query.create()
      .compose(component)
      .then((response) => {
        reducer = 0;
        const data = get(response, `data.${component.name}`);
        const [hnpp, ecp] = ['page_info.has_next_page', 'page_info.end_cursor'];

        if (!ghObject) ghObject = omit(data, ['timeline', 'assignees', 'labels', 'participants']);

        labels.push(...get(data, 'labels.nodes', []).map((l) => l.name));
        labels.hasNext = get(data, `labels.${hnpp}`, false);
        labels.endCursor = get(data, `labels.${ecp}`, labels.endCursor);

        assignees.push(...get(data, 'assignees.nodes', []));
        assignees.hasNext = get(data, `assignees.${hnpp}`, false);
        assignees.endCursor = get(data, `assignees.${ecp}`, assignees.endCursor);

        participants.push(...get(data, 'participants.nodes', []));
        participants.hasNext = get(data, `participants.${hnpp}`, false);
        participants.endCursor = get(data, `participants.${ecp}`, participants.endCursor);

        timeline.push(
          ...get(data, 'timeline.edges', []).map((edge) =>
            isString(edge.node)
              ? { ...commits.find((c) => c.id === edge.node), type: 'Commit' }
              : edge.node
          ),
          ...get(data, 'comments', [])
        );
        timeline.hasNext = get(data, `timeline.${hnpp}`, false);
        timeline.endCursor = get(data, `timeline.${ecp}`, timeline.endCursor);

        users.push(...(response.users || []));
        commits.push(...(response.commits || []));
      })
      // .catch(async (err) => {
      //   if (err instanceof ServiceUnavailableError) {
      //     if (err.response.errors.reduce((is, e) => is && e.type === 'SERVICE_UNAVAILABLE', true)) {
      //       await Promise.each(err.response.errors, async (data) => {
      //         const cursor = get(
      //           err.response,
      //           `data.${type}.timeline.edges[${data.path[3] - 1}].cursor`,
      //           lastCursor
      //         );

      //         return client
      //           .post({
      //             query: query
      //               .split('\n')
      //               .map((str) =>
      //                 str
      //                   .replace(/^\s*additions\s*$/i, '')
      //                   .replace(/^\s*deletions\s*$/i, '')
      //                   .replace(/^\s*changedFiles\s*$/i, '')
      //               )
      //               .join('\n'),
      //             variables: { ...variables, at: cursor, total: 1 }
      //           })
      //           .then((result) =>
      //             set(
      //               err.response,
      //               `data.${type}.timeline.edges[${data.path[3]}]`,
      //               result.data.data[type].timeline.edges[0]
      //             )
      //           );
      //       });

      //       return Promise.resolve({ data: omit(err.response, 'errors') });
      //     }
      //   }
      //   throw err;
      // })
      .catch(async (err) => {
        if (err instanceof BadGatewayError && first > 1) return (reducer += Math.ceil(first / 2));
        throw err;
      });
  }

  return {
    [type]: compact(merge(ghObject, { assignees, labels, participants })),
    timeline: chain(timeline).compact().uniqBy('id').value() || [],
    users: chain(users).compact().uniqBy('id').value() || [],
    commits: chain(commits).compact().uniqBy('id').value() || [],
    endCursor: timeline.endCursor
  };
};
