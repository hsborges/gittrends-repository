const IssueComponent = require('./IssueComponent');

const IssueFragment = require('../fragments/IssueFragment');
const PullRequestFragment = require('../fragments/PullRequestFragment');

const AutomaticBaseChangeFailedEvent = require('../fragments/events/AutomaticBaseChangeFailedEvent');
const AutomaticBaseChangeSucceededEvent = require('../fragments/events/AutomaticBaseChangeSucceededEvent');
const BaseRefChangedEvent = require('../fragments/events/BaseRefChangedEvent');
const BaseRefForcePushedEvent = require('../fragments/events/BaseRefForcePushedEvent');
const ConvertToDraftEvent = require('../fragments/events/ConvertToDraftEvent');
const DeployedEvent = require('../fragments/events/DeployedEvent');
const DeploymentEnvironmentChangedEvent = require('../fragments/events/DeploymentEnvironmentChangedEvent');
const HeadRefDeletedEvent = require('../fragments/events/HeadRefDeletedEvent');
const HeadRefForcePushedEvent = require('../fragments/events/HeadRefForcePushedEvent');
const HeadRefRestoredEvent = require('../fragments/events/HeadRefRestoredEvent');
const MergedEvent = require('../fragments/events/MergedEvent');
const PullRequestCommit = require('../fragments/PullRequestCommit');
const PullRequestRevisionMarkerFragment = require('../fragments/PullRequestRevisionMarkerFragment');
const ReadyForReviewEvent = require('../fragments/events/ReadyForReviewEvent');
const ReviewDismissedEvent = require('../fragments/events/ReviewDismissedEvent');
const ReviewRequestRemovedEvent = require('../fragments/events/ReviewRequestRemovedEvent');
const ReviewRequestedEvent = require('../fragments/events/ReviewRequestedEvent');
const PullRequestReviewFragment = require('../fragments/PullRequestReviewFragment');
const PullRequestCommitCommentThreadFragment = require('../fragments/PullRequestCommitCommentThreadFragment');

module.exports = class PullRequestComponent extends IssueComponent {
  constructor(id, name) {
    if (!id) throw new Error('ID is mandatory!');
    super(id, name);

    this._id = id;
    this._name = name || 'pull';
    this.componentName = 'PullRequest';
  }

  get fragments() {
    const fragments = super.fragments;

    if (this._includeDetails)
      fragments.splice(fragments.indexOf(IssueFragment), 1, PullRequestFragment);

    if (super._includeTimeline) {
      super._extraTimelineEvents = `
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

      fragments.push(
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

    return fragments;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  static with({ id, name }) {
    return new PullRequestComponent(id, name);
  }

  includeDetails(include) {
    super.includeDetails(false);
    this._includeDetails = include ? `...${PullRequestFragment.code}` : '';
    return this;
  }

  toString() {
    return super.toString();
  }
};
