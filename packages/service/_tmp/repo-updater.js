global.Promise = require('bluebird');

const DetailsHandler = require('../new-updater/repository/DetailsHandler');
const ReleasesHandler = require('../new-updater/repository/ReleasesHandler');
const TagsHandler = require('../new-updater/repository/TagsHandler');
const WatchersHandler = require('../new-updater/repository/WatchersHandler');
const StargazersHandler = require('../new-updater/repository/StargazersHandler');
const DependenciesHandler = require('../new-updater/repository/DependenciesHandler');

const RepositoryUpdater = require('../new-updater/RepositoryUpdater');

new RepositoryUpdater('MDEwOlJlcG9zaXRvcnk0MTY0NDgy', [
  DetailsHandler,
  ReleasesHandler,
  TagsHandler,
  WatchersHandler,
  StargazersHandler,
  DependenciesHandler
])
  .run()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(1));
