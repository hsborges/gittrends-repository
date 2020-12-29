/*
 *  Author: Hudson S. Borges
 */
const AbstractDAO = require('./AbstractDAO');
const db = require('@gittrends/database-config');

// Disable cache by default
const defaultOptions = {
  cacheSize: 0,
  chunkSize: parseInt(process.env.GITTRENDS_DAO_CHUNK_SIZE || 1000, 10)
};

const cacheEnabled = {
  ...defaultOptions,
  cacheSize: parseInt(process.env.GITTRENDS_DAO_CACHE_SIZE || 50000, 10)
};

// exports
module.exports.actors = new AbstractDAO(db.Actor, cacheEnabled);
module.exports.commits = new AbstractDAO(db.Commit, cacheEnabled);
module.exports.dependencies = new AbstractDAO(db.Dependency, defaultOptions);
module.exports.issues = new AbstractDAO(db.Issue, defaultOptions);
module.exports.metadata = new AbstractDAO(db.Metadata, defaultOptions);
module.exports.pulls = new AbstractDAO(db.PullRequest, defaultOptions);
module.exports.reactions = new AbstractDAO(db.Reaction, defaultOptions);
module.exports.releases = new AbstractDAO(db.Release, defaultOptions);
module.exports.repositories = new AbstractDAO(db.Repository, defaultOptions);
module.exports.stargazers = new AbstractDAO(db.Stargazer, defaultOptions);
module.exports.tags = new AbstractDAO(db.Tag, defaultOptions);
module.exports.timeline = new AbstractDAO(db.TimelineEvent, defaultOptions);
module.exports.watchers = new AbstractDAO(db.Watcher, defaultOptions);
// aliases
module.exports.pull_requests = module.exports.pulls;
