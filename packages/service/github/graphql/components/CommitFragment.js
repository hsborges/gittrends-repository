const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment');

module.exports = class CommitFragment extends Fragment {
  static get code() {
    return 'commit';
  }

  get dependencies() {
    return [new ActorFragment(false)];
  }

  toString() {
    return `
    fragment ${CommitFragment.code} on Commit {
      type:__typename
      additions
      author { date email name user { ...actor } }
      authoredByCommitter
      authoredDate
      changedFiles
      comments { totalCount }
      committedDate
      committedViaWeb
      committer { date email name user { ...actor } }
      deletions
      id
      message
      messageBody
      oid
      pushedDate
      repository { id }
      signature {
        email isValid signer { ...actor } state wasSignedByGitHub
      }
      status { contexts { context description createdAt } id state }
    }
    `;
  }
};
