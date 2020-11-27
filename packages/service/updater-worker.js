/*
 *  Author: Hudson S. Borges
 */
/* eslint-disable global-require, import/no-dynamic-require */
/* execute */
module.exports = async ({ id, resource, data: { ids } = {} }) => {
  return Promise.resolve().then(() => {
    const base = './updater';
    switch (resource) {
      case 'users':
        return require(`${base}/user`)(ids || id);
      case 'repos':
        return require(`${base}/repository`)(id);
      case 'issues':
      case 'pulls':
        return require(`${base}/issues-pulls`)(id, resource);
      case 'issue':
      case 'pull':
        return require(`${base}/issue-pull`)(id, resource);
      default:
        return require(`${base}/${resource}`)(id);
    }
  });
};
