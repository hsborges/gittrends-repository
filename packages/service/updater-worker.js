/*
 *  Author: Hudson S. Borges
 */
module.exports = async function ({ id, resource, data: { ids } = {} }) {
  switch (resource) {
    case 'users':
      return require('./updater/user')(ids || id);
    case 'repos':
      return require('./updater/repository')(id);
    case 'issues':
    case 'pulls':
      return require('./updater/issues-pulls')(id, resource);
    case 'issue':
    case 'pull':
      return require('./updater/issue-pull')(id, resource);
    default:
      return require(`./updater/${resource}`)(id);
  }
};
