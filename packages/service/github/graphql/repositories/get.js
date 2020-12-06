/*
 *  Author: Hudson S. Borges
 */
const { get, cloneDeep, chain } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');
const compact = require('../../../helpers/compact.js');

module.exports = async function (repositoryIdOrName, name) {
  if (!repositoryIdOrName) throw new TypeError('Repository ID or full name are required!');

  const selector = name
    ? `repository(owner: "${repositoryIdOrName}", name: "${name}")`
    : `node(id: "${repositoryIdOrName}")`;

  const query = `
  query($total:Int = 100, $al:String, $at:String, $skip:Boolean = false) {
    repository:${selector} {
      ... on Repository {
        assignableUsers @skip(if: $skip) { totalCount }
        codeOfConduct @skip(if: $skip) { name }
        createdAt @skip(if: $skip)
        databaseId @skip(if: $skip)
        defaultBranch:defaultBranchRef @skip(if: $skip) { name }
        deleteBranchOnMerge  @skip(if: $skip)
        description @skip(if: $skip)
        diskUsage @skip(if: $skip)
        forksCount:forkCount @skip(if: $skip)
        fundingLinks @skip(if: $skip) { platform url }
        hasIssuesEnabled @skip(if: $skip)
        hasProjectsEnabled @skip(if: $skip)
        hasWikiEnabled @skip(if: $skip)
        homepageUrl @skip(if: $skip)
        id
        isArchived @skip(if: $skip)
        isBlankIssuesEnabled @skip(if: $skip)
        isDisabled @skip(if: $skip)
        isEmpty @skip(if: $skip)
        isFork @skip(if: $skip)
        isInOrganization @skip(if: $skip)
        isLocked @skip(if: $skip)
        isMirror @skip(if: $skip)
        isPrivate @skip(if: $skip)
        isSecurityPolicyEnabled @skip(if: $skip)
        isTemplate @skip(if: $skip)
        isUserConfigurationRepository @skip(if: $skip)
        issues @skip(if: $skip) { totalCount }
        labels @skip(if: $skip) { totalCount }
        languages(first: $total, after: $al) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
        licenseInfo @skip(if: $skip) { name }
        lockReason @skip(if: $skip)
        mentionableUsers @skip(if: $skip) { totalCount }
        mergeCommitAllowed @skip(if: $skip)
        milestones @skip(if: $skip) { totalCount }
        mirrorUrl @skip(if: $skip)
        name @skip(if: $skip)
        nameWithOwner @skip(if: $skip)
        openGraphImageUrl @skip(if: $skip)
        owner @skip(if: $skip) { ...actor }
        parent @skip(if: $skip) { id }
        primaryLanguage @skip(if: $skip) { name }
        pushedAt @skip(if: $skip)
        pullRequests @skip(if: $skip) { totalCount }
        rebaseMergeAllowed @skip(if: $skip)
        releases @skip(if: $skip) { totalCount }
        repositoryTopics(first: $total, after: $at) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
        squashMergeAllowed @skip(if: $skip)
        stargazersCount:stargazerCount @skip(if: $skip)
        templateRepository @skip(if: $skip) { id }
        updatedAt @skip(if: $skip)
        url @skip(if: $skip)
        usesCustomOpenGraphImage @skip(if: $skip)
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
