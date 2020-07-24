/*
 *  Author: Hudson S. Borges
 */
const { get, omit } = require('lodash');

const client = require('../graphql-client.js');

module.exports = async function (manifestId, { lastCursor } = {}) {
  const query = `
  query($id:ID!, $after:String) {
    manifest:node(id: $id) {
      __typename
      ... on DependencyGraphManifest {
        dependencies (first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            hasDependencies
            packageManager
            packageName
            targetRepository:repository { id databaseId nameWithOwner }
            requirements
          }
        }
      }
    }
  }
  `;

  const dependencies = [];
  const variables = { id: manifestId, after: lastCursor, hasNextPage: true };

  for (; variables.hasNextPage; ) {
    const { data } = await client.post({ query, variables: omit(variables, 'hasNextPage') });

    dependencies.push(...get(data, 'data.manifest.dependencies.nodes', []));

    variables.after = get(data, 'data.manifest.dependencies.page_info.end_cursor', null);
    variables.hasNextPage = get(data, 'data.manifest.dependencies.page_info.has_next_page', false);
  }

  return { dependencies, endCursor: variables.after, hasNextPage: variables.hasNextPage };
};
