/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const CommitFragment = require('../CommitFragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class ClosedEvent extends Fragment {
  static get code() {
    return 'closedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ClosedEvent {
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
