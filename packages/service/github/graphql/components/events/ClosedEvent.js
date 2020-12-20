const Fragment = require('../../Fragment');
const CommitFragment = require('../CommitFragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class ClosedEvent extends Fragment {
  static get code() {
    return 'closedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on ClosedEvent {
        actor { ...${ActorFragment.code} }
        closer {
          type:__typename
          ... on Node { id }
          ... on Commit { ...${CommitFragment.code} }
        }
        createdAt
      }
    `;
  }
};
