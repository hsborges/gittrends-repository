const IssueComponent = require('./IssueComponent');

const AutomaticBaseChangeFailedEvent = require('./events/AutomaticBaseChangeFailedEvent');
const AutomaticBaseChangeSucceededEvent = require('./events/AutomaticBaseChangeSucceededEvent');
const BaseRefChangedEvent = require('./events/BaseRefChangedEvent');
const BaseRefForcePushedEvent = require('./events/BaseRefForcePushedEvent');
const ConvertToDraftEvent = require('./events/ConvertToDraftEvent');
const DeployedEvent = require('./events/DeployedEvent');
const DeploymentEnvironmentChangedEvent = require('./events/DeploymentEnvironmentChangedEvent');
const HeadRefDeletedEvent = require('./events/HeadRefDeletedEvent');
const HeadRefForcePushedEvent = require('./events/HeadRefForcePushedEvent');
const HeadRefRestoredEvent = require('./events/HeadRefRestoredEvent');
const MergedEvent = require('./events/MergedEvent');
const PullRequestCommit = require('./PullRequestCommit');
const PullRequestRevisionMarkerFragment = require('./PullRequestRevisionMarkerFragment');
const ReadyForReviewEvent = require('./events/ReadyForReviewEvent');
const ReviewDismissedEvent = require('./events/ReviewDismissedEvent');
const ReviewRequestRemovedEvent = require('./events/ReviewRequestRemovedEvent');
const ReviewRequestedEvent = require('./events/ReviewRequestedEvent');
const PullRequestReviewFragment = require('./PullRequestReviewFragment');
const PullRequestCommitCommentThreadFragment = require('./PullRequestCommitCommentThreadFragment');

module.exports = class PullRequestComponent extends IssueComponent {
  constructor(id, name) {
    if (!id) throw new Error('ID is mandatory!');
    super();

    this._id = id;
    this._name = name || 'pull';
    this.componentName = 'PullRequest';
  }

  get fragments() {
    if (super._includeTimeline) {
      super.fragments.push(
        AutomaticBaseChangeFailedEvent,
        AutomaticBaseChangeSucceededEvent,
        BaseRefChangedEvent,
        BaseRefForcePushedEvent,
        ConvertToDraftEvent,
        DeployedEvent,
        DeploymentEnvironmentChangedEvent,
        HeadRefDeletedEvent,
        HeadRefForcePushedEvent,
        HeadRefRestoredEvent,
        MergedEvent,
        PullRequestCommit,
        PullRequestRevisionMarkerFragment,
        ReadyForReviewEvent,
        ReviewDismissedEvent,
        ReviewRequestRemovedEvent,
        ReviewRequestedEvent,
        PullRequestCommitCommentThreadFragment
      );
    }
    return super.fragments;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get _extraTimelineEvents() {
    return `
      ... on AutomaticBaseChangeFailedEvent { ...${AutomaticBaseChangeFailedEvent.code} }
      ... on AutomaticBaseChangeSucceededEvent { ...${AutomaticBaseChangeSucceededEvent.code} }
      ... on BaseRefChangedEvent { ...${BaseRefChangedEvent.code} }
      ... on BaseRefForcePushedEvent { ...${BaseRefForcePushedEvent.code} }
      ... on ConvertToDraftEvent { ...${ConvertToDraftEvent.code} }
      ... on DeployedEvent { ...${DeployedEvent.code} }
      ... on DeploymentEnvironmentChangedEvent { ...${DeploymentEnvironmentChangedEvent.code} }
      ... on HeadRefDeletedEvent { ...${HeadRefDeletedEvent.code} }
      ... on HeadRefForcePushedEvent { ...${HeadRefForcePushedEvent.code} }
      ... on HeadRefRestoredEvent { ...${HeadRefRestoredEvent.code} }
      ... on MergedEvent { ...${MergedEvent.code} }
      ... on PullRequestCommit { ...${PullRequestCommit.code} }
      ... on PullRequestCommitCommentThread { ...${PullRequestCommitCommentThreadFragment.code} }
      ... on PullRequestReview { ...${PullRequestReviewFragment.code} }
      ... on PullRequestReviewThread { ...pullRequestReviewThread }
      ... on PullRequestRevisionMarker { ...${PullRequestRevisionMarkerFragment.code} }
      ... on ReadyForReviewEvent { ...${ReadyForReviewEvent.code} }
      ... on ReviewDismissedEvent { ...${ReviewDismissedEvent.code} }
      ... on ReviewRequestRemovedEvent { ...${ReviewRequestRemovedEvent.code} }
      ... on ReviewRequestedEvent { ...${ReviewRequestedEvent.code} }
    `;
  }

  static with({ id, name }) {
    return new PullRequestComponent(id, name);
  }

  toString() {
    return super.toString();
  }
};
