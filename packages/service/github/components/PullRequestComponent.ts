/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import IssueFragment from '../fragments/IssueFragment';
import PullRequestCommitCommentThreadFragment from '../fragments/PullRequestCommitCommentThreadFragment';
import PullRequestCommit from '../fragments/PullRequestCommitFragment';
import PullRequestFragment from '../fragments/PullRequestFragment';
import PullRequestReviewFragment from '../fragments/PullRequestReviewFragment';
import PullRequestReviewThreadFragment from '../fragments/PullRequestReviewThreadFragment';
import PullRequestRevisionMarkerFragment from '../fragments/PullRequestRevisionMarkerFragment';
import AutoMergeDisabledEvent from '../fragments/events/AutoMergeDisabledEvent';
import AutoMergeEnabledEvent from '../fragments/events/AutoMergeEnabledEvent';
import AutoRebaseEnabledEvent from '../fragments/events/AutoRebaseEnabledEvent';
import AutoSquashEnabledEvent from '../fragments/events/AutoSquashEnabledEvent';
import AutomaticBaseChangeFailedEvent from '../fragments/events/AutomaticBaseChangeFailedEvent';
import AutomaticBaseChangeSucceededEvent from '../fragments/events/AutomaticBaseChangeSucceededEvent';
import BaseRefChangedEvent from '../fragments/events/BaseRefChangedEvent';
import BaseRefDeletedEvent from '../fragments/events/BaseRefDeletedEvent';
import BaseRefForcePushedEvent from '../fragments/events/BaseRefForcePushedEvent';
import ConvertToDraftEvent from '../fragments/events/ConvertToDraftEvent';
import DeployedEvent from '../fragments/events/DeployedEvent';
import DeploymentEnvironmentChangedEvent from '../fragments/events/DeploymentEnvironmentChangedEvent';
import HeadRefDeletedEvent from '../fragments/events/HeadRefDeletedEvent';
import HeadRefForcePushedEvent from '../fragments/events/HeadRefForcePushedEvent';
import HeadRefRestoredEvent from '../fragments/events/HeadRefRestoredEvent';
import MergedEvent from '../fragments/events/MergedEvent';
import ReadyForReviewEvent from '../fragments/events/ReadyForReviewEvent';
import ReviewDismissedEvent from '../fragments/events/ReviewDismissedEvent';
import ReviewRequestRemovedEvent from '../fragments/events/ReviewRequestRemovedEvent';
import ReviewRequestedEvent from '../fragments/events/ReviewRequestedEvent';
import IssueComponent from './IssueComponent';

export default class PullRequestComponent extends IssueComponent {
  constructor(id: string, alias = 'pull') {
    super(id, alias);
    this.componentName = 'PullRequest';
    this.extraTimelineEvents = `
      ... on AutomaticBaseChangeFailedEvent { ...${AutomaticBaseChangeFailedEvent.code} }
      ... on AutomaticBaseChangeSucceededEvent { ...${AutomaticBaseChangeSucceededEvent.code} }
      ... on AutoMergeDisabledEvent { ...${AutoMergeDisabledEvent.code} }
      ... on AutoMergeEnabledEvent { ...${AutoMergeEnabledEvent.code} }
      ... on AutoRebaseEnabledEvent { ...${AutoRebaseEnabledEvent.code} }
      ... on AutoSquashEnabledEvent { ...${AutoSquashEnabledEvent.code} }
      ... on BaseRefChangedEvent { ...${BaseRefChangedEvent.code} }
      ... on BaseRefDeletedEvent { ...${BaseRefDeletedEvent.code} }
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
      ... on PullRequestReviewThread { ...${PullRequestReviewThreadFragment.code} }
      ... on PullRequestRevisionMarker { ...${PullRequestRevisionMarkerFragment.code} }
      ... on ReadyForReviewEvent { ...${ReadyForReviewEvent.code} }
      ... on ReviewDismissedEvent { ...${ReviewDismissedEvent.code} }
      ... on ReviewRequestRemovedEvent { ...${ReviewRequestRemovedEvent.code} }
      ... on ReviewRequestedEvent { ...${ReviewRequestedEvent.code} }
    `;
  }

  get fragments(): Fragment[] {
    const fragments = super.fragments;

    if (this.includes.details.include)
      fragments.splice(fragments.indexOf(IssueFragment), 1, PullRequestFragment);

    if (this.includes.timeline.include) {
      fragments.push(
        AutomaticBaseChangeFailedEvent,
        AutomaticBaseChangeSucceededEvent,
        AutoMergeDisabledEvent,
        AutoMergeEnabledEvent,
        AutoRebaseEnabledEvent,
        AutoSquashEnabledEvent,
        BaseRefChangedEvent,
        BaseRefDeletedEvent,
        BaseRefForcePushedEvent,
        ConvertToDraftEvent,
        DeployedEvent,
        DeploymentEnvironmentChangedEvent,
        HeadRefDeletedEvent,
        HeadRefForcePushedEvent,
        HeadRefRestoredEvent,
        MergedEvent,
        PullRequestCommit,
        PullRequestReviewFragment,
        PullRequestReviewThreadFragment,
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

  includeDetails(include: boolean): this {
    this.includes.details.include = include;
    this.includes.details.textFragment = include ? `...${PullRequestFragment.code}` : '';
    return this;
  }
}
