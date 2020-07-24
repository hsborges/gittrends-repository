/*
 *  Author: Hudson S. Borges
 */
const { get, omit } = require('lodash');

const client = require('../graphql-client.js');
const details = require('./dependencies-details.js');
const { TimedoutError, LoadingError } = require('../../../helpers/errors.js');

module.exports = async function (repositoryId) {
  const query = `
  query($id:ID!, $after:String, $total:Int = 100) {
    repository:node(id: $id) {
      ... on Repository {
        manifest:dependencyGraphManifests(first: $total, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            blobPath
            dependenciesCount
            exceedsMaxSize
            filename
            id
            parseable
          }
        }
      }
    }
  }
  `;

  const dependencies = [];
  const variables = { id: repositoryId, after: null, total: 100, hasNextPage: true };

  for (; variables.hasNextPage; ) {
    await client
      .post({ query, variables: omit(variables, 'hasNextPage') })
      .catch(async (err) => {
        if ((err instanceof TimedoutError || err instanceof LoadingError) && variables.total > 1)
          return (variables.total = Math.ceil(variables.total / 2));
        throw err;
      })
      .then(async ({ data }) => {
        const manifest = get(data, 'data.repository.manifest', {});

        await Promise.mapSeries(get(manifest, 'nodes', []), async (node) =>
          details(node.id).then((res) =>
            res.dependencies.forEach((_dep) =>
              dependencies.push({
                manifest: node.id,
                filename: node.filename,
                blob_path: node.blob_path,
                ..._dep
              })
            )
          )
        );

        variables.total = 100;
        variables.after = get(manifest, 'page_info.end_cursor', null);
        variables.hasNextPage = get(manifest, 'page_info.has_next_page', false);
      });
  }

  return { dependencies, endCursor: variables.after, hasNextPage: variables.hasNextPage };
};
