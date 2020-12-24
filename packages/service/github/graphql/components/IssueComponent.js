const Component = require('../Component');
const IssueFragment = require('../fragments/IssueFragment');
const ActorFragment = require('../fragments/ActorFragment').simplified;
const IssueCommentFragment = require('../fragments/IssueCommentFragment');

const AddedToProjectEvent = require('../fragments/events/AddedToProjectEvent');
const AssignedEvent = require('../fragments/events/AssignedEvent');
const ClosedEvent = require('../fragments/events/ClosedEvent');
const CommentDeletedEvent = require('../fragments/events/CommentDeletedEvent');
const ConnectedEvent = require('../fragments/events/ConnectedEvent');
const ConvertedNoteToIssueEvent = require('../fragments/events/ConvertedNoteToIssueEvent');
const CrossReferencedEvent = require('../fragments/events/CrossReferencedEvent');
const DemilestonedEvent = require('../fragments/events/DemilestonedEvent');
const DisconnectedEvent = require('../fragments/events/DisconnectedEvent');
const LabeledEvent = require('../fragments/events/LabeledEvent');
const LockedEvent = require('../fragments/events/LockedEvent');
const MarkedAsDuplicateEvent = require('../fragments/events/MarkedAsDuplicateEvent');
const MentionedEvent = require('../fragments/events/MentionedEvent');
const MilestonedEvent = require('../fragments/events/MilestonedEvent');
const MovedColumnsInProjectEvent = require('../fragments/events/MovedColumnsInProjectEvent');
const PinnedEvent = require('../fragments/events/PinnedEvent');
const ReferencedEvent = require('../fragments/events/ReferencedEvent');
const RemovedFromProjectEvent = require('../fragments/events/RemovedFromProjectEvent');
const RenamedTitleEvent = require('../fragments/events/RenamedTitleEvent');
const ReopenedEvent = require('../fragments/events/ReopenedEvent');
const SubscribedEvent = require('../fragments/events/SubscribedEvent');
const TransferredEvent = require('../fragments/events/TransferredEvent');
const UnassignedEvent = require('../fragments/events/UnassignedEvent');
const UnlabeledEvent = require('../fragments/events/UnlabeledEvent');
const UnlockedEvent = require('../fragments/events/UnlockedEvent');
const UnmarkedAsDuplicateEvent = require('../fragments/events/UnmarkedAsDuplicateEvent');
const UnpinnedEvent = require('../fragments/events/UnpinnedEvent');
const UnsubscribedEvent = require('../fragments/events/UnsubscribedEvent');
const UserBlockedEvent = require('../fragments/events/UserBlockedEvent');

module.exports = class IssueComponent extends Component {
  constructor(id, alias) {
    if (!id) throw new Error('ID is mandatory!');
    super();

    this.id = id;
    this.alias = alias || 'issue';
    this.componentName = 'Issue';

    this._includeDetails = '';
    this._includeAssignees = '';
    this._includeLabels = '';
    this._includeParticipants = '';
    this._includeTimeline = '';

    this._extraFields = '';
    this._extraTimelineEvents = '';
  }

  get fragments() {
    const fragments = [];

    if (this._includeDetails) fragments.push(IssueFragment);

    if (this._includeAssignees || this._includeParticipants) fragments.push(ActorFragment);

    if (this._includeTimeline)
      fragments.push(
        AddedToProjectEvent,
        AssignedEvent,
        ClosedEvent,
        CommentDeletedEvent,
        ConnectedEvent,
        ConvertedNoteToIssueEvent,
        CrossReferencedEvent,
        DemilestonedEvent,
        DisconnectedEvent,
        LabeledEvent,
        LockedEvent,
        MarkedAsDuplicateEvent,
        MentionedEvent,
        MilestonedEvent,
        MovedColumnsInProjectEvent,
        PinnedEvent,
        ReferencedEvent,
        RemovedFromProjectEvent,
        RenamedTitleEvent,
        ReopenedEvent,
        SubscribedEvent,
        TransferredEvent,
        UnassignedEvent,
        UnlabeledEvent,
        UnlockedEvent,
        UnmarkedAsDuplicateEvent,
        UnpinnedEvent,
        UnsubscribedEvent,
        UserBlockedEvent,
        IssueCommentFragment
      );

    return fragments;
  }

  static with({ id, name }) {
    return new IssueComponent(id, name);
  }

  includeDetails(include = true) {
    this._includeDetails = include ? `...${IssueFragment.code}` : '';
    return this;
  }

  includeAssignees(include = true, { first = 100, after } = {}) {
    this._includeAssignees = include
      ? `
          assignees(${super.$argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ActorFragment.code} }
          }
        `
      : '';
    return this;
  }

  includeLabels(include = true, { first = 100, after } = {}) {
    this._includeLabels = include
      ? `
          labels(${super.$argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { name }
          }
        `
      : '';
    return this;
  }

  includeParticipants(include = true, { first = 100, after } = {}) {
    this._includeParticipants = include
      ? `
          participants(${super.$argsToString({ first, after })}) {
            nodes { ...${ActorFragment.code} }
          }
        `
      : '';
    return this;
  }

  includeTimeline(include = true, { first = 100, after } = {}) {
    this._includeTimeline = include
      ? `
          timeline:timelineItems(${super.$argsToString({ first, after })}) {
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
              ${this._extraTimelineEvents}
            }
          }
        `
      : '';
    return this;
  }

  toString() {
    return `
      ${this.alias}:node(id: "${this.id}") {
        type:__typename
        ... on ${this.componentName} {
          ${this._includeDetails}
          ${this._includeAssignees}
          ${this._includeLabels}
          ${this._includeParticipants}
          ${this._includeTimeline}
          ${this._extraFields}
        }
      }
    `;
  }
};
