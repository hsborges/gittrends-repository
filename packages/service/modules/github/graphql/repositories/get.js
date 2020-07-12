/*
 *  Author: Hudson S. Borges
 */
const { get, cloneDeep, chain } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');
const compact = require('../../../compact.js');

module.exports = async function (repositoryIdOrName, name) {
  if (!repositoryIdOrName) throw new TypeError('Repository ID or full name are required!');

  const selector = name
    ? `repository(owner: "${repositoryIdOrName}", name: "${name}")`
    : `node(id: "${repositoryIdOrName}")`;

  const query = `
  query($total:Int = 100, $al:String, $at:String, $skip:Boolean = false) {
    repository:${selector} {
      ... on Repository {
        #### FIELDS ###
        codeOfConduct @skip(if: $skip) { name }
        createdAt @skip(if: $skip)
        databaseId @skip(if: $skip)
        defaultBranch:defaultBranchRef @skip(if: $skip) { name }
        deleteBranchOnMerge  @skip(if: $skip)
        description @skip(if: $skip)
        diskUsage @skip(if: $skip)
        # forkCount @skip(if: $skip)
        # fundingLinks
        hasIssuesEnabled @skip(if: $skip)
        hasProjectsEnabled @skip(if: $skip)
        hasWikiEnabled @skip(if: $skip)
        homepageUrl @skip(if: $skip)
        id
        isArchived @skip(if: $skip)
        isDisabled @skip(if: $skip)
        isFork @skip(if: $skip)
        isLocked @skip(if: $skip)
        isMirror @skip(if: $skip)
        isPrivate @skip(if: $skip)
        isTemplate @skip(if: $skip)
        licenseInfo @skip(if: $skip) { name }
        lockReason @skip(if: $skip)
        mergeCommitAllowed @skip(if: $skip)
        mirrorUrl @skip(if: $skip)
        name @skip(if: $skip)
        nameWithOwner @skip(if: $skip)
        openGraphImageUrl @skip(if: $skip)
        owner @skip(if: $skip) { ...actor }
        parent @skip(if: $skip) { id databaseId nameWithOwner }
        primaryLanguage @skip(if: $skip) { name }
        pushedAt @skip(if: $skip)
        rebaseMergeAllowed @skip(if: $skip)
        # resourcePath @skip(if: $skip)
        shortDescriptionHTML @skip(if: $skip)
        squashMergeAllowed @skip(if: $skip)
        # sshUrl @skip(if: $skip)
        templateRepository @skip(if: $skip) { id databaseId nameWithOwner }
        updatedAt @skip(if: $skip)
        # url @skip(if: $skip)
        usesCustomOpenGraphImage @skip(if: $skip)

        ### CONNECTIONS ###
        # assignableUsers @skip(if: $skip) { totalCount }
        # branchProtectionRules @skip(if: $skip) { totalCount }
        # collaborators @skip(if: $skip) { totalCount }
        # commitComments @skip(if: $skip) { totalCount }
        # deployKeys @skip(if: $skip) { totalCount }
        # deployments @skip(if: $skip) { totalCount }
        forks @skip(if: $skip) { totalCount }
        issues @skip(if: $skip) { totalCount }
        # labels @skip(if: $skip) { totalCount }
        languages(first: $total, after: $al) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
        # mentionableUsers @skip(if: $skip) { totalCount }
        # milestones @skip(if: $skip) { totalCount }
        # packages @skip(if: $skip) { totalCount }
        # pinnedIssues @skip(if: $skip) { totalCount }
        # projects @skip(if: $skip) { totalCount }
        pullRequests @skip(if: $skip) { totalCount }
        # refs @skip(if: $skip) { totalCount }
        # registryPackages @skip(if: $skip) { totalCount }
        # registryPackagesForQuery @skip(if: $skip) { totalCount }
        releases @skip(if: $skip) { totalCount }
        repositoryTopics(first: $total, after: $at) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
        stargazers @skip(if: $skip) { totalCount }
        vulnerabilityAlerts @skip(if: $skip) { totalCount }
        watchers @skip(if: $skip) { totalCount }
      }
    }
  }
  ${actorFragment}
  `;

  let repository = null;
  let hasNextPage = true;

  const users = [];
  const languages = [];
  const topics = [];
  const variables = {};

  while (hasNextPage) {
    hasNextPage = await client
      .post({ query, variables: { ...variables, skip: repository !== null } })
      .then(({ data }) => {
        const result = parser(get(data, 'data.repository', {}));

        if (repository === null) repository = cloneDeep(result.data);

        users.push(...(result.users || []));
        languages.push(...get(result, 'data.languages.edges', []));
        topics.push(...get(result, 'data.repository_topics.nodes', []).map((t) => t.topic));

        const hasLang = get(result, 'data.languages.page_info.has_next_page');
        const hasTopics = get(result, 'data.repository_topics.page_info.has_next_page');
        if (hasLang) variables.al = get(result, 'data.languages.page_info.end_cursor');
        if (hasTopics) variables.at = get(result, 'data.repository_topics.page_info.end_cursor');

        return hasLang || hasTopics;
      });
  }

  return {
    repository: compact({
      ...repository,
      languages,
      repository_topics: topics
    }),
    users: chain(users).compact().uniqBy('id').value()
  };
};
