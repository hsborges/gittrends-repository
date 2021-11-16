/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';
import AddedToProjectEvent from '../fragments/events/AddedToProjectEvent';
import AssignedEvent from '../fragments/events/AssignedEvent';
import ClosedEvent from '../fragments/events/ClosedEvent';
import CommentDeletedEvent from '../fragments/events/CommentDeletedEvent';
import ConnectedEvent from '../fragments/events/ConnectedEvent';
import ConvertedNoteToIssueEvent from '../fragments/events/ConvertedNoteToIssueEvent';
import CrossReferencedEvent from '../fragments/events/CrossReferencedEvent';
import DemilestonedEvent from '../fragments/events/DemilestonedEvent';
import DisconnectedEvent from '../fragments/events/DisconnectedEvent';
import LabeledEvent from '../fragments/events/LabeledEvent';
import LockedEvent from '../fragments/events/LockedEvent';
import MarkedAsDuplicateEvent from '../fragments/events/MarkedAsDuplicateEvent';
import MentionedEvent from '../fragments/events/MentionedEvent';
import MilestonedEvent from '../fragments/events/MilestonedEvent';
import MovedColumnsInProjectEvent from '../fragments/events/MovedColumnsInProjectEvent';
import PinnedEvent from '../fragments/events/PinnedEvent';
import ReferencedEvent from '../fragments/events/ReferencedEvent';
import RemovedFromProjectEvent from '../fragments/events/RemovedFromProjectEvent';
import RenamedTitleEvent from '../fragments/events/RenamedTitleEvent';
import ReopenedEvent from '../fragments/events/ReopenedEvent';
import SubscribedEvent from '../fragments/events/SubscribedEvent';
import TransferredEvent from '../fragments/events/TransferredEvent';
import UnassignedEvent from '../fragments/events/UnassignedEvent';
import UnlabeledEvent from '../fragments/events/UnlabeledEvent';
import UnlockedEvent from '../fragments/events/UnlockedEvent';
import UnmarkedAsDuplicateEvent from '../fragments/events/UnmarkedAsDuplicateEvent';
import UnpinnedEvent from '../fragments/events/UnpinnedEvent';
import UnsubscribedEvent from '../fragments/events/UnsubscribedEvent';
import UserBlockedEvent from '../fragments/events/UserBlockedEvent';
import IssueCommentFragment from '../fragments/IssueCommentFragment';
import IssueFragment from '../fragments/IssueFragment';

type TOptions = { first: number; after?: string; alias?: string };

export default class IssueComponent extends Component {
  protected componentName: string;
  protected extraTimelineEvents: string;

  constructor(id: string, alias = 'issue') {
    super(id, alias);
    this.componentName = 'Issue';
    this.extraTimelineEvents = '';
  }

  get fragments(): Fragment[] {
    const fragments = new Set<Fragment>();

    if (this.includes.details) fragments.add(IssueFragment);
    if (this.includes.assignees) fragments.add(SimplifiedActorFragment);
    if (this.includes.participants) fragments.add(SimplifiedActorFragment);

    if (this.includes.timeline) {
      fragments
        .add(AddedToProjectEvent)
        .add(AssignedEvent)
        .add(ClosedEvent)
        .add(CommentDeletedEvent)
        .add(ConnectedEvent)
        .add(ConvertedNoteToIssueEvent)
        .add(CrossReferencedEvent)
        .add(DemilestonedEvent)
        .add(DisconnectedEvent)
        .add(LabeledEvent)
        .add(LockedEvent)
        .add(MarkedAsDuplicateEvent)
        .add(MentionedEvent)
        .add(MilestonedEvent)
        .add(MovedColumnsInProjectEvent)
        .add(PinnedEvent)
        .add(ReferencedEvent)
        .add(RemovedFromProjectEvent)
        .add(RenamedTitleEvent)
        .add(ReopenedEvent)
        .add(SubscribedEvent)
        .add(TransferredEvent)
        .add(UnassignedEvent)
        .add(UnlabeledEvent)
        .add(UnlockedEvent)
        .add(UnmarkedAsDuplicateEvent)
        .add(UnpinnedEvent)
        .add(UnsubscribedEvent)
        .add(UserBlockedEvent)
        .add(IssueCommentFragment);
    }

    return [...fragments];
  }

  includeDetails(include = true): this {
    this.includes.details = include && { textFragment: `...${IssueFragment.code}` };
    return this;
  }

  includeAssignees(include = true, { first = 100, after, alias = 'assignees' }: TOptions): this {
    this.includes.assignees = include && {
      textFragment: `
        ${alias}:assignees(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${SimplifiedActorFragment.code} }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeLabels(include = true, { first = 100, after, alias = 'labels' }: TOptions): this {
    this.includes.labels = include && {
      textFragment: `
        ${alias}:labels(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { name }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeParticipants(
    include = true,
    { first = 100, after, alias = 'participants' }: TOptions
  ): this {
    this.includes.participants = include && {
      textFragment: `
        ${alias}:participants(${super.argsToString({ first, after })}) {
          nodes { ...${SimplifiedActorFragment.code} }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeTimeline(include = true, { first = 100, after, alias = 'timeline' }: TOptions): this {
    this.includes.timeline = include && {
      textFragment: `
        ${alias}:timelineItems(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            type:__typename
            ... on Node { id }
            ... on AddedToProjectEvent { ...${AddedToProjectEvent.code} }
            ... on AssignedEvent { ...${AssignedEvent.code} }
            ... on ClosedEvent { ...${ClosedEvent.code} }
            ... on CommentDeletedEvent { ...${CommentDeletedEvent.code} }
            ... on ConnectedEvent { ...${ConnectedEvent.code} }
            ... on ConvertedNoteToIssueEvent { ...${ConvertedNoteToIssueEvent.code} }
            ... on CrossReferencedEvent { ...${CrossReferencedEvent.code} }
            ... on DemilestonedEvent { ...${DemilestonedEvent.code} }
            ... on DisconnectedEvent { ...${DisconnectedEvent.code} }
            ... on IssueComment { ...${IssueCommentFragment.code} }
            ... on LabeledEvent { ...${LabeledEvent.code} }
            ... on LockedEvent { ...${LockedEvent.code} }
            ... on MarkedAsDuplicateEvent { ...${MarkedAsDuplicateEvent.code} }
            ... on MentionedEvent { ...${MentionedEvent.code} }
            ... on MilestonedEvent { ...${MilestonedEvent.code} }
            ... on MovedColumnsInProjectEvent { ...${MovedColumnsInProjectEvent.code} }
            ... on PinnedEvent { ...${PinnedEvent.code} }
            ... on ReferencedEvent { ...${ReferencedEvent.code} }
            ... on RemovedFromProjectEvent { ...${RemovedFromProjectEvent.code} }
            ... on RenamedTitleEvent { ...${RenamedTitleEvent.code} }
            ... on ReopenedEvent { ...${ReopenedEvent.code} }
            ... on SubscribedEvent { ...${SubscribedEvent.code} }
            ... on TransferredEvent { ...${TransferredEvent.code} }
            ... on UnassignedEvent { ...${UnassignedEvent.code} }
            ... on UnlabeledEvent { ...${UnlabeledEvent.code} }
            ... on UnlockedEvent { ...${UnlockedEvent.code} }
            ... on UnmarkedAsDuplicateEvent { ...${UnmarkedAsDuplicateEvent.code} }
            ... on UnpinnedEvent { ...${UnpinnedEvent.code} }
            ... on UnsubscribedEvent { ...${UnsubscribedEvent.code} }
            ... on UserBlockedEvent { ...${UserBlockedEvent.code} }
            ${this.extraTimelineEvents}
          }
        }
      `,
      first,
      after
    };
    return this;
  }

  toString(): string {
    const includeText = Object.values(this.includes)
      .filter((i) => i)
      .map((i) => i && i.textFragment)
      .join('\n');

    return `
      ${this.alias}:node(id: "${this.id}") {
        ... on ${this.componentName} {
          ${includeText}
        }
      }
    `;
  }
}
