/*
 *  Author: Hudson S. Borges
 */
const scheduler = require('./scheduler.js');

/* eslint-disable global-require, import/no-dynamic-require */
/* execute */
module.exports = async ({ id, resource, data: { ids } }) => {
  return Promise.resolve().then(() => {
    const base = './updater';
    switch (resource) {
      case 'users':
        return require(`${base}/user`)(ids || id);
      case 'repos':
        return require(`${base}/repository`)(id);
      case 'issues':
      case 'pulls':
        if (/^d-(.*)/g.test(id))
          return require(`${base}/issue-pull`)(id.slice(2), resource.slice(0, -1));

        return require(`${base}/issues-pulls`)(id, resource).then(() => {
          if (['issues', 'pulls'].indexOf(resource) < 0) return null;
          return scheduler[resource](id);
        });
      default:
        return require(`${base}/${resource}`)(id);
    }
  });
};
