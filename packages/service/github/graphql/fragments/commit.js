/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment commit on Commit {
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
