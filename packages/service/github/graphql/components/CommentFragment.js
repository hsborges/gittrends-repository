const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');

module.exports = class CommentFragment extends Fragment {
  static get code() {
    return 'comment';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on Comment {
        author { ...${ActorFragment.code} }
        authorAssociation
        body
        createdAt
        createdViaEmail
        editor { ...${ActorFragment.code} }
        id
        includesCreatedEdit
        lastEditedAt
        publishedAt
        updatedAt
      }
    `;
  }
};
