/*
 *  Author: Hudson S. Borges
 */
const get = require('lodash/get');

const { TimedoutError, LoadingError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');
const DependencyGraphManifestComponent = require('../components/DependencyGraphManifestComponent');

module.exports = async function (repositoryId) {
  if (!repositoryId) throw new TypeError('Repository ID is required!');

  let hasNextPage = true;
  let endCursor = null;
  let reducer = 0;

  const dependencies = [];

  for (; hasNextPage; ) {
    const total = 100 - reducer;
    await Query.create()
      .compose(
        RepositoryComponent.with({ id: repositoryId })
          .includeDetails(false)
          .includeDependencyGraphManifests(true, { after: endCursor, first: total })
      )
      .run()
      .then(async ({ data }) => {
        reducer = 0;
        const manifestPath = 'repository.dependency_graph_manifests';

        const pageInfoPath = `${manifestPath}.page_info`;
        hasNextPage = get(data, `${pageInfoPath}.has_next_page`);
        endCursor = get(data, `${pageInfoPath}.end_cursor`, endCursor);

        const manifests = get(data, `${manifestPath}.nodes`, []);

        await Promise.map(manifests, async (manifest) => {
          let _hasNextPage = true;
          let _endCursor = null;

          for (; _hasNextPage; ) {
            await Query.withArgs()
              .compose(
                DependencyGraphManifestComponent.with({ id: manifest.id, name: 'manifest' })
                  .includeDetails(false)
                  .includeDependencies(true, { after: _endCursor })
              )
              .run()
              .then(({ data }) => {
                const pageInfoPath = 'manifest.dependencies.page_info';
                _hasNextPage = get(data, `${pageInfoPath}.has_next_page`);
                _endCursor = get(data, `${pageInfoPath}.end_cursor`, _endCursor);

                get(data, 'manifest.dependencies.nodes', []).forEach((dependency) =>
                  dependencies.push({
                    manifest: manifest.id,
                    filename: manifest.filename,
                    ...dependency
                  })
                );
              });
          }
        });
      })
      .catch(async (err) => {
        if ((err instanceof TimedoutError || err instanceof LoadingError) && total > 1)
          return (reducer = total / 2);
        throw err;
      });
  }

  return { dependencies, endCursor, hasNextPage };
};
