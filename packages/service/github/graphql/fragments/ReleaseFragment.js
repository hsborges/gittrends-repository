const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;

module.exports = class ReleasesFragment extends Fragment {
  static get code() {
    return 'release';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
    fragment ${this.code} on Release {
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
