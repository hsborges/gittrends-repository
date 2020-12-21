const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');
const CommitFragment = require('../CommitFragment');

module.exports = class BaseRefForcePushedEvent extends Fragment {
  static get code() {
    return 'baseRefForcePushedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on BaseRefForcePushedEvent {
        actor { ...${ActorFragment.code} }
        afterCommit { ...${CommitFragment.code} }
        beforeCommit { ...${CommitFragment.code} }
        createdAt
        ref { name target { id } }
      }
    `;
  }
};
