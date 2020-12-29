/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;
const CommitFragment = require('./CommitFragment');

module.exports = class TagFragment extends Fragment {
  static get code() {
    return 'tag';
  }

  static get dependencies() {
    return [ActorFragment, CommitFragment];
  }

  static toString() {
    return `
    fragment ${this.code} on Tag {
      id
      message
      name
      oid
      tagger { date email name user { ...${ActorFragment.code} } }
      target { ...${CommitFragment.code} }
    }
    `;
  }
};
