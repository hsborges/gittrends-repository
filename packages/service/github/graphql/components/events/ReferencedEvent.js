const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;
const CommitFragment = require('../CommitFragment');

module.exports = class ReferencedEvent extends Fragment {
  static get code() {
    return 'referencedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ReferencedEvent {
        actor { ...${ActorFragment.code} }
        commit { ...${CommitFragment.code} }
        commitRepository { id }
        createdAt
        isCrossRepository
        isDirectReference
      }
    `;
  }
};
