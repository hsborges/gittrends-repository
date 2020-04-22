/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment commit on Commit {
  ### CONNECTIONS ###
  # comments { totalCount }

  ### FIELDS ###
  type:__typename
  # abbreviatedOid
  additions
  author { date email name user { ...actor } }
  authoredByCommitter
  authoredDate
  # blame
  changedFiles
  # commitUrl
  committedDate
  committedViaWeb
  committer { date email name user { ...actor } }
  deletions
  id
  message
  messageBody
  # messageHeadline
  oid
  pushedDate
  signature { 
    email isValid signer { ...actor } state wasSignedByGitHub
    # payload signature  
  }
  status { contexts { context description createdAt } id state }
  # tree
  # treeUrl
  # url
  # zipballUrl
}
`;
