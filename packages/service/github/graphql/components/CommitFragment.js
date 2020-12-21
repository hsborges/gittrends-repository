const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;

module.exports = class CommitFragment extends Fragment {
  static get code() {
    return 'commit';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
    fragment ${this.code} on Commit {
      type:__typename
      additions
      author { date email name user { ...${ActorFragment.code} } }
      authoredByCommitter
      authoredDate
      changedFiles
      comments { totalCount }
      committedDate
      committedViaWeb
      committer { date email name user { ...${ActorFragment.code} } }
      deletions
      id
      message
      messageBody
      oid
      pushedDate
      repository { id }
      signature {
        email isValid signer { ...${ActorFragment.code} } state wasSignedByGitHub
      }
      status { contexts { context description createdAt } id state }
    }
    `;
  }
};
