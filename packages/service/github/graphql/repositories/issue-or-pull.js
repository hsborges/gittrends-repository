/*
 *  Author: Hudson S. Borges
 */
const { chain, get, set, omit, isString, merge } = require('lodash');

const parser = require('../parser.js');
const client = require('../graphql-client.js');
const compact = require('../../../helpers/compact.js');
const { BadGatewayError, ServiceUnavailableError } = require('../../../helpers/errors.js');

/* eslint-disable no-param-reassign, global-require */
module.exports = async function (id, type, { lastCursor } = {}) {
  if (!type || (type !== 'issue' && type !== 'pull'))
    throw new TypeError('Type must be "issue" or "pull"!');

  // const parameter = type === 'issue' ? '' : ', $ac:String';
  const parameter = type === 'issue' ? '' : '';
  const objectName = type === 'issue' ? 'Issue' : 'PullRequest';

  const query = `
  query($id:ID!, $total:Int = 100, $at:String, $aa:String, $al:String${parameter}, $full:Boolean=true) {
    ${type}:node(id: $id) {
      ... on ${objectName} {
        ${
          type === 'issue'
            ? ''
            : `
          ### CONNECTIONS ###
          # commits(first: $total, after: $ac) {
          #  pageInfo { hasNextPage endCursor }
          #  nodes { commit { ...commit } }
          # }
          suggestedReviewers @include(if: $full) {
            isAuthor
            isCommenter
            reviewer { ...actor }
          }

          ### FIELDS ###
          additions
          baseRef @include(if: $full) { name target { ...commit } }
          baseRefName @include(if: $full)
          baseRefOid @include(if: $full)
          # baseRepository { ...repo }
          canBeRebased @include(if: $full)
          changedFiles @include(if: $full)
          deletions @include(if: $full)
          headRef @include(if: $full) { name target { ...commit } }
          headRefName @include(if: $full)
          headRefOid @include(if: $full)
          headRepository @include(if: $full) { ...repo }
          headRepositoryOwner @include(if: $full) { id login }
          isCrossRepository @include(if: $full)
          isDraft @include(if: $full)
          maintainerCanModify @include(if: $full)
          mergeCommit @include(if: $full) { ...commit }
          mergeStateStatus @include(if: $full)
          mergeable @include(if: $full)
          merged @include(if: $full)
          mergedAt @include(if: $full)
          mergedBy @include(if: $full) { ...actor }
          permalink @include(if: $full)
          potentialMergeCommit @include(if: $full) { ...commit }
        `
        }

        ### FIELDS ####
        activeLockReason @include(if: $full)
        author @include(if: $full) { ...actor }
        authorAssociation @include(if: $full)
        body @include(if: $full)
        # bodyHTML @include(if: $full)
        # bodyText @include(if: $full)
        closed @include(if: $full)
        closedAt @include(if: $full)
        createdAt @include(if: $full)
        createdViaEmail @include(if: $full)
        databaseId @include(if: $full)
        editor @include(if: $full) { ...actor }
        # hovercard @include(if: $full)
        id @include(if: $full)
        includesCreatedEdit @include(if: $full)
        lastEditedAt @include(if: $full)
        locked  @include(if: $full)
        milestone @include(if: $full) { ...milestone }
        number @include(if: $full)
        publishedAt @include(if: $full)
        ...reaction @include(if: $full)
        state @include(if: $full)
        title @include(if: $full)
        updatedAt @include(if: $full)
        # url @include(if: $full)


        ### CONNECTIONS ###
        assignees(first: $total, after: $aa) {
          pageInfo { hasNextPage endCursor }
          nodes { ...actor }
        }
        labels(first: $total, after: $al) {
          pageInfo { hasNextPage endCursor }
          nodes { name }
        }
        timeline:timelineItems(first: $total, after: $at) {
          pageInfo { hasNextPage endCursor }
          edges {
            cursor
            node {
              type:__typename
              ... on Node { id }
              ... on AddedToProjectEvent { ...addedToProjectEvent }
              ... on AssignedEvent { ...assignedEvent }
              ... on ClosedEvent { ...closedEvent }
              ... on CommentDeletedEvent { ...commentDeletedEvent }
              ... on ConnectedEvent { ...connectedEvent }
              ... on ConvertedNoteToIssueEvent { ...convertedNoteToIssueEvent }
              ... on CrossReferencedEvent { ...crossReferencedEvent }
              ... on DemilestonedEvent { ...demilestonedEvent }
              ... on DisconnectedEvent { ...disconnectedEvent }
              ... on IssueComment { ...issueComment }
              ... on LabeledEvent { ...labeledEvent }
              ... on LockedEvent { ...lockedEvent }
              ... on MarkedAsDuplicateEvent { ...markedAsDuplicateEvent }
              ... on MentionedEvent { ...mentionedEvent }
              ... on MilestonedEvent { ...milestonedEvent }
              ... on MovedColumnsInProjectEvent { ...movedColumnsInProjectEvent }
              ... on PinnedEvent { ...pinnedEvent }
              ... on ReferencedEvent { ...referencedEvent }
              ... on RemovedFromProjectEvent { ...removedFromProjectEvent }
              ... on RenamedTitleEvent { ...renamedTitleEvent }
              ... on ReopenedEvent { ...reopenedEvent }
              ... on SubscribedEvent { ...subscribedEvent }
              ... on TransferredEvent { ...transferredEvent }
              ... on UnassignedEvent { ...unassignedEvent }
              ... on UnlabeledEvent { ...unlabeledEvent }
              ... on UnlockedEvent { ...unlockedEvent }
              ... on UnmarkedAsDuplicateEvent { ...unmarkedAsDuplicateEvent }
              ... on UnpinnedEvent { ...unpinnedEvent }
              ... on UnsubscribedEvent { ...unsubscribedEvent }
              ... on UserBlockedEvent { ...userBlockedEvent }
              ${
                type === 'issue'
                  ? ''
                  : `
                ... on AutomaticBaseChangeFailedEvent { ...automaticBaseChangeFailedEvent }
                ... on AutomaticBaseChangeSucceededEvent { ...automaticBaseChangeSucceededEvent }
                ... on BaseRefChangedEvent { ...baseRefChangedEvent }
                ... on BaseRefForcePushedEvent { ...baseRefForcePushedEvent }
                ... on ConvertToDraftEvent { ...convertToDraftEvent }
                ... on DeployedEvent { ...deployedEvent }
                ... on DeploymentEnvironmentChangedEvent { ...deploymentEnvChangedEvent }
                ... on HeadRefDeletedEvent { ...headRefDeletedEvent }
                ... on HeadRefForcePushedEvent { ...headRefForcePushedEvent }
                ... on HeadRefRestoredEvent { ...headRefRestoredEvent }
                ... on MergedEvent { ...mergedEvent }
                ... on PullRequestCommit { ...pullRequestCommit }
                ... on PullRequestCommitCommentThread { ...pullRequestCommitCommentThread }
                ... on PullRequestReview { ...pullRequestReview }
                ... on PullRequestReviewThread { ...pullRequestReviewThread }
                ... on PullRequestRevisionMarker { ...pullRequestRevisionMarker }
                ... on ReadyForReviewEvent { ...readyForReviewEvent }
                ... on ReviewDismissedEvent { ...reviewDismissedEvent }
                ... on ReviewRequestRemovedEvent { ...reviewRequestRemovedEvent }
                ... on ReviewRequestedEvent { ...reviewRequestedEvent }
              `
              }
            }
          }
        }
      }
    }
  }

  fragment repo on Repository { id }

  # OTHERS
  ${require('../fragments/events/added-to-project')}
  ${require('../fragments/events/assigned')}
  ${require('../fragments/events/closed')}
  ${require('../fragments/events/comment-deleted')}
  ${require('../fragments/events/connected')}
  ${require('../fragments/events/convertedNoteToIssue')}
  ${require('../fragments/events/cross-referenced')}
  ${require('../fragments/events/demilestoned')}
  ${require('../fragments/events/disconnected')}
  ${require('../fragments/events/labeled')}
  ${require('../fragments/events/locked')}
  ${require('../fragments/events/markedAsDuplicate')}
  ${require('../fragments/events/mentioned')}
  ${require('../fragments/events/milestoned')}
  ${require('../fragments/events/moved-columns-in-project')}
  ${require('../fragments/events/pinned')}
  ${require('../fragments/events/referenced')}
  ${require('../fragments/events/removed-from-project')}
  ${require('../fragments/events/renamed-title')}
  ${require('../fragments/events/reopened')}
  ${require('../fragments/events/subscribed')}
  ${require('../fragments/events/transferred')}
  ${require('../fragments/events/unassigned')}
  ${require('../fragments/events/unlabeled')}
  ${require('../fragments/events/unlocked')}
  ${require('../fragments/events/unmarkedAsDuplicate')}
  ${require('../fragments/events/unpinned')}
  ${require('../fragments/events/unsubscribed')}
  ${require('../fragments/events/user-blocked')}
  ${require('../fragments/reactable')}
  ${require('../fragments/actor')}
  ${require('../fragments/comment')}
  ${require('../fragments/commit')}
  ${require('../fragments/milestone')}
  ${require('../fragments/issue-comment')}
  ${
    type === 'issue'
      ? ''
      : `
        ${require('../fragments/events/automatic-base-change-failed')}
        ${require('../fragments/events/automatic-base-change-succeeded')}
        ${require('../fragments/events/base-ref-changed')}
        ${require('../fragments/events/base-ref-force-pushed')}
        ${require('../fragments/events/convertToDraft')}
        ${require('../fragments/events/deployed')}
        ${require('../fragments/events/deployment-environment-changed')}
        ${require('../fragments/events/head-ref-deleted')}
        ${require('../fragments/events/head-ref-force-pushed')}
        ${require('../fragments/events/head-ref-restored')}
        ${require('../fragments/events/merged')}
        ${require('../fragments/events/ready-for-review')}
        ${require('../fragments/events/review-dismissed')}
        ${require('../fragments/events/review-request-removed')}
        ${require('../fragments/events/review-requested')}

        ${require('../fragments/commit-comment')}
        ${require('../fragments/deployment')}
        ${require('../fragments/deployment-status')}
        ${require('../fragments/pull-request-review-comment')}

        fragment pullRequestCommit on PullRequestCommit {
          commit { ...commit }
        }

        fragment pullRequestCommitCommentThread on PullRequestCommitCommentThread {
          comments(first: 100) { nodes { ...commitComment } }
          commit { ...commit }
          path
          position
        }

        fragment pullRequestReview on PullRequestReview {
          type:__typename
          author { ...actor }
          authorAssociation
          body
          comments(first: 100) { nodes { ...pullRequestReviewComment } }
          commit { ...commit }
          createdAt
          createdViaEmail
          databaseId
          editor { ...actor }
          lastEditedAt
          publishedAt
          ...reaction
          state
          submittedAt
          updatedAt
          url
        }

        fragment pullRequestReviewThread on PullRequestReviewThread {
          isResolved
          resolvedBy { ...actor }
          comments(first: 100) { nodes { ...pullRequestReviewComment } }
        }

        fragment pullRequestRevisionMarker on PullRequestRevisionMarker {
          createdAt
          lastSeenCommit { ...commit }
        }
        `
  }
  `;

  let ghObject = null;
  const timeline = [];
  const assignees = [];
  const labels = [];
  const users = [];
  const commits = [];

  const variables = { id, at: lastCursor, aa: null, al: null, total: 100 };

  for (let hasMore = true; hasMore; ) {
    variables.full = ghObject === null;

    hasMore = await client
      .post({ query, variables })
      .catch(async (err) => {
        if (err instanceof ServiceUnavailableError) {
          if (err.response.errors.reduce((is, e) => is && e.type === 'SERVICE_UNAVAILABLE', true)) {
            await Promise.each(err.response.errors, async (data) => {
              const cursor = get(
                err.response,
                `data.${type}.timeline.edges[${data.path[3] - 1}].cursor`,
                lastCursor
              );

              return client
                .post({
                  query: query
                    .split('\n')
                    .map((str) =>
                      str
                        .replace(/^\s*additions\s*$/i, '')
                        .replace(/^\s*deletions\s*$/i, '')
                        .replace(/^\s*changedFiles\s*$/i, '')
                    )
                    .join('\n'),
                  variables: { ...variables, at: cursor, total: 1 }
                })
                .then((result) =>
                  set(
                    err.response,
                    `data.${type}.timeline.edges[${data.path[3]}]`,
                    result.data.data[type].timeline.edges[0]
                  )
                );
            });

            return Promise.resolve({ data: omit(err.response, 'errors') });
          }
        }
        throw err;
      })
      .then(({ data }) => {
        const _data = parser(get(data, ['data', type], {}));

        if (!ghObject)
          ghObject = chain(_data.data).omit(['timeline', 'assignees', 'labels']).value();

        users.push(...get(_data, 'users', []));
        commits.push(...get(_data, 'commits', []));
        labels.push(...get(_data, 'data.labels.nodes', []).map((l) => l.name));
        assignees.push(...get(_data, 'data.assignees.nodes', []));

        timeline.push(
          ...get(_data, 'data.timeline.edges', []).map((edge) =>
            isString(edge.node)
              ? { ...commits.find((c) => c.id === edge.node), type: 'Commit' }
              : edge.node
          ),
          ...get(_data, 'comments', [])
        );

        variables.aa = get(_data, 'data.assignees.page_info.end_cursor') || variables.aa;
        variables.al = get(_data, 'data.labels.page_info.end_cursor') || variables.al;
        variables.at = get(_data, 'data.timeline.page_info.end_cursor') || variables.at;
        variables.total = 100;

        const _hma = get(_data, 'data.assignees.page_info.has_next_page');
        const _hml = get(_data, 'data.labels.page_info.has_next_page');
        const _hmtl = get(_data, 'data.timeline.page_info.has_next_page');

        return _hma || _hmtl || _hml;
      })
      .catch(async (err) => {
        if (err instanceof BadGatewayError && variables.total > 1) {
          variables.total = Math.ceil(variables.total / 2);
          return true;
        }

        throw err;
      });
  }

  return compact({
    [type]: merge(ghObject, { assignees, labels }),
    timeline: chain(timeline).compact().uniqBy('id').value(),
    users: chain(users).compact().uniqBy('id').value(),
    commits: chain(commits).compact().uniqBy('id').value(),
    endCursor: variables.at
  });
};
