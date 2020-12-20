const Component = require('../Component');
const IssueFragment = require('./IssueFragment');
const ActorFragment = require('./SimplifiedActorFragment');

const AddedToProjectEvent = require('./events/AddedToProjectEvent');
const AssignedEvent = require('./events/AssignedEvent');
const ClosedEvent = require('./events/ClosedEvent');
const CommentDeletedEvent = require('./events/CommentDeletedEvent');
const ConnectedEvent = require('./events/ConnectedEvent');
const ConvertedNoteToIssueEvent = require('./events/ConvertedNoteToIssueEvent');
const CrossReferencedEvent = require('./events/CrossReferencedEvent');
const DemilestonedEvent = require('./events/DemilestonedEvent');
const DisconnectedEvent = require('./events/DisconnectedEvent');
const LabeledEvent = require('./events/LabeledEvent');
const LockedEvent = require('./events/LockedEvent');
const MarkedAsDuplicateEvent = require('./events/MarkedAsDuplicateEvent');
const MentionedEvent = require('./events/MentionedEvent');
const MilestonedEvent = require('./events/MilestonedEvent');
const MovedColumnsInProjectEvent = require('./events/MovedColumnsInProjectEvent');
const PinnedEvent = require('./events/PinnedEvent');
const ReferencedEvent = require('./events/ReferencedEvent');
const RemovedFromProjectEvent = require('./events/RemovedFromProjectEvent');
const RenamedTitleEvent = require('./events/RenamedTitleEvent');
const ReopenedEvent = require('./events/ReopenedEvent');
const SubscribedEvent = require('./events/SubscribedEvent');
const TransferredEvent = require('./events/TransferredEvent');
const UnassignedEvent = require('./events/UnassignedEvent');
const UnlabeledEvent = require('./events/UnlabeledEvent');
const UnlockedEvent = require('./events/UnlockedEvent');
const UnmarkedAsDuplicateEvent = require('./events/UnmarkedAsDuplicateEvent');
const UnpinnedEvent = require('./events/UnpinnedEvent');
const UnsubscribedEvent = require('./events/UnsubscribedEvent');
const UserBlockedEvent = require('./events/UserBlockedEvent');

module.exports = class IssueComponent extends Component {
  constructor(id, name) {
    if (!id) throw new Error('ID is mandatory!');
    super();

    this._id = id;
    this._name = name || 'issue';

    this._includeDetails = '';
    this._includeAssignees = '';
    this._includeLabels = '';
    this._includeParticipants = '';
  }

  get fragments() {
    const fragments = [];

    if (this._includeDetails) fragments.push(IssueFragment);
    if (this._includeAssignees || this._includeParticipants) fragments.push(ActorFragment);

    return fragments;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
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
            edges {
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
              ... on IssueComment { ...issueComment }
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
            }
          }
        `
      : '';
    return this;
  }

  toString() {
    return `
      ${this._name}:node(id: "${this._id}") {
        type:__typename
        ... on ${IssueFragment.code} {
          ${this._includeDetails}
          ${this._includeAssignees}
          ${this._includeLabels}
          ${this._includeParticipants}
        }
      }
    `;
  }
};
