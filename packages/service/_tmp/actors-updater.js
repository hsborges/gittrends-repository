global.Promise = require('bluebird');

const ActorsUpdater = require('../new-updater/ActorsUpdater');

new ActorsUpdater([
  'MDQ6VXNlcjQ4OTQyMjQ5',
  'MDEyOk9yZ2FuaXphdGlvbjMwNDc4NzA3',
  'MDEyOk9yZ2FuaXphdGlvbjE0MTAxNzc2',
  'MDEyOk9yZ2FuaXphdGlvbjE0MTEwMTQy'
])
  .update()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(1));
