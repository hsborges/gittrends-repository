const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');
const CommitFragment = require('./CommitFragment');

module.exports = class TagFragment extends Fragment {
  static get code() {
    return 'tag';
  }

  get dependencies() {
    return [new ActorFragment(false), new CommitFragment()];
  }

  toString() {
    return `
    fragment ${TagFragment.code} on Tag {
      id
      message
      name
      oid
      tagger { date email name user { ...actor } }
      target { ...commit }
    }
    `;
  }
};
