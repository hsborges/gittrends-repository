/*
 *  Author: Hudson S. Borges
 */
import IssueComponent from './IssueComponent';

import Fragment from '../Fragment';
import IssueFragment from '../fragments/IssueFragment';
import PullRequestFragment from '../fragments/PullRequestFragment';
import AutomaticBaseChangeFailedEvent from '../fragments/events/AutomaticBaseChangeFailedEvent';
import AutomaticBaseChangeSucceededEvent from '../fragments/events/AutomaticBaseChangeSucceededEvent';
import BaseRefChangedEvent from '../fragments/events/BaseRefChangedEvent';
import BaseRefForcePushedEvent from '../fragments/events/BaseRefForcePushedEvent';
import ConvertToDraftEvent from '../fragments/events/ConvertToDraftEvent';
import DeployedEvent from '../fragments/events/DeployedEvent';
import DeploymentEnvironmentChangedEvent from '../fragments/events/DeploymentEnvironmentChangedEvent';
import HeadRefDeletedEvent from '../fragments/events/HeadRefDeletedEvent';
import HeadRefForcePushedEvent from '../fragments/events/HeadRefForcePushedEvent';
import HeadRefRestoredEvent from '../fragments/events/HeadRefRestoredEvent';
import MergedEvent from '../fragments/events/MergedEvent';
import PullRequestCommit from '../fragments/PullRequestCommitFragment';
import PullRequestRevisionMarkerFragment from '../fragments/PullRequestRevisionMarkerFragment';
import ReadyForReviewEvent from '../fragments/events/ReadyForReviewEvent';
import ReviewDismissedEvent from '../fragments/events/ReviewDismissedEvent';
import ReviewRequestRemovedEvent from '../fragments/events/ReviewRequestRemovedEvent';
import ReviewRequestedEvent from '../fragments/events/ReviewRequestedEvent';
import PullRequestReviewFragment from '../fragments/PullRequestReviewFragment';
import PullRequestCommitCommentThreadFragment from '../fragments/PullRequestCommitCommentThreadFragment';
import PullRequestReviewThreadFragment from '../fragments/PullRequestReviewThreadFragment';

export default class PullRequestComponent extends IssueComponent {
  constructor(id: string, alias = 'pull') {
    super(id, alias);
    this.componentName = 'PullRequest';
    this.extraTimelineEvents = `
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