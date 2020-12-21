const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;
const CommitFragment = require('../CommitFragment');

module.exports = class BaseRefForcePushedEvent extends Fragment {
  static get code() {
    return 'baseRefForcePushedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on BaseRefForcePushedEvent {
        actor { ...${ActorFragment.code} }
        afterCommit { ...${CommitFragment.code} }
        beforeCommit { ...${CommitFragment.code} }
        createdAt
        ref { name target { id } }
      }
    `;
  }
};
