const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;
const CommitFragment = require('../CommitFragment');

module.exports = class HeadRefForcePushedEvent extends Fragment {
  static get code() {
    return 'headRefForcePushedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on HeadRefForcePushedEvent {
        actor { ...${ActorFragment.code} }
        afterCommit { ...${CommitFragment.code} }
        beforeCommit { ...${CommitFragment.code} }
        createdAt
        ref { name target { id } }
      }
    `;
  }
};
