const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');

module.exports = class ReleasesFragment extends Fragment {
  static get code() {
    return 'release';
  }

  get dependencies() {
    return [new ActorFragment(false)];
  }

  toString() {
    return `
    fragment ${ReleasesFragment.code} on Release {
      author { ...${ActorFragment.code} }
      createdAt
      description
      id
      isDraft
      isPrerelease
      name
      publishedAt
      releaseAssets { totalCount }
      tag { id }
      tagName
      updatedAt
    }
    `;
  }
};
