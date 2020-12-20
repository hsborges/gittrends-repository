const Fragment = require('../Fragment');
const ReactableFragment = require('./ReactableFragment');
const CommentFragment = require('./CommentFragment');
const CommitFragment = require('./CommitFragment');

module.exports = class CommitCommentFragment extends Fragment {
  static get code() {
    return 'commitComment';
  }

  static get dependencies() {
    return [ReactableFragment, CommentFragment, CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on CommitComment {
        type:__typename
        id
        ... on Comment { ...${CommentFragment.code} }
        commit { ...${CommitFragment.code} }
        databaseId
        path
        position
        ...${ReactableFragment.code}
      }
    `;
  }
};
