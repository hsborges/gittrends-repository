/*
 *  Author: Hudson S. Borges
 */
const { get, cloneDeep, chain } = require('lodash');

const client = require('../graphql-client.js');
const parser = require('../parser.js');
const compact = require('../../../helpers/compact.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

module.exports = async function (repositoryId) {
  if (!repositoryId) throw new TypeError('Repository ID is required!');

  const component = RepositoryComponent.withID(repositoryId).includeLanguages().includeTopics();
  const query = Query.withArgs({ total: 100 }).compose(component);

  let repository = null;

  const users = [];
  const languages = [];
  const topics = [];

  for (let hasNextPage = true; hasNextPage; ) {
    component.includeDetails(repository === null);

    hasNextPage = await client.post({ query: query.toString() }).then(({ data }) => {
      const result = parser(get(data, 'data.repository', {}));

      if (repository === null) repository = cloneDeep(result.data);

      users.push(...(result.users || []));
      languages.push(...get(result, 'data.languages.edges', []));
      topics.push(...get(result, 'data.repository_topics.nodes', []).map((t) => t.topic));

      const hasLang = get(result, 'data.languages.page_info.has_next_page');
      const hasTopics = get(result, 'data.repository_topics.page_info.has_next_page');

      component
        .includeLanguages(hasLang, get(result, 'data.languages.page_info.end_cursor'))
        .includeTopics(hasTopics, get(result, 'data.repository_topics.page_info.end_cursor'));

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
