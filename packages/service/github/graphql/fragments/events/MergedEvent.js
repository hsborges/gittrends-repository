/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;
const CommitFragment = require('../CommitFragment');

module.exports = class MergedEvent extends Fragment {
  static get code() {
    return 'mergedEvent';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on MergedEvent {
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
