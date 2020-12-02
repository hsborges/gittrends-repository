/*
 *  Author: Hudson S. Borges
 */
const updater = require(`./updater/index`);

module.exports = async ({ id, resource, data: { ids } = {} }) => {
  switch (resource) {
    case 'users':
      return updater.user(ids || id);
    case 'repos':
      return updater.repository(id);
    case 'issues':
    case 'pulls':
      return updater.issues_pulls(id, resource);
    case 'issue':
    case 'pull':
      return updater.issue_pull(id, resource);
    default:
      return updater[resource](id);
  }
};
