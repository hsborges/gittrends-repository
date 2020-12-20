/*
 *  Author: Hudson S. Borges
 */
const get = require('lodash/get');
const compact = require('../../../helpers/compact.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

module.exports = async function (repositoryId) {
  if (!repositoryId) throw new TypeError('Repository ID is required!');

  const component = RepositoryComponent.with({ id: repositoryId })
    .includeLanguages()
    .includeTopics();

  let repository = null;

  const users = [];
  const languages = [];
  const topics = [];

  for (let hasNextPage = true; hasNextPage; ) {
    hasNextPage = await Query.create()
      .compose(component.includeDetails(repository === null))
      .then(({ data, users: _users }) => {
        if (repository === null) repository = data.repository;

        users.push(...(_users || []));
        languages.push(...get(data, 'repository.languages.edges', []));
        topics.push(...get(data, 'repository.repository_topics.nodes', []).map((t) => t.topic));

        const hasLang = get(data, 'repository.languages.page_info.has_next_page');
        const hasTopics = get(data, 'repository.repository_topics.page_info.has_next_page');

        component
          .includeLanguages(hasLang, {
            after: get(data, 'repository.languages.page_info.end_cursor')
          })
          .includeTopics(hasTopics, {
            after: get(data, 'repository.repository_topics.page_info.end_cursor')
          });

        return hasLang || hasTopics;
      });
  }

  return {
    repository: compact({
      ...repository,
      languages,
      repository_topics: topics
    }),
    users
  };
};
