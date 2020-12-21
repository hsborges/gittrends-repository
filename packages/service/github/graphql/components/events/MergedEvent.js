const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');
const CommitFragment = require('../CommitFragment');

module.exports = class MergedEvent extends Fragment {
  static get code() {
    return 'mergedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on MergedEvent {
        actor { ...${ActorFragment.code} }
        commit { ...${CommitFragment.code} }
        createdAt
        mergeRef { name target { id } }
        mergeRefName
        url
      }
    `;
  }
};
