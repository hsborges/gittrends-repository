/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const moment = require('moment');

/* eslint-disable global-require, import/no-dynamic-require */
/* execute */
module.exports = async ({ id, name, data: { ids } }) => {
  const [, resource] = /(.+)@.*/i.exec(name) || [];

  return Promise.resolve()
    .then(() => {
      const base = './updater';
      switch (resource) {
        case 'users':
          return require(`${base}/user`)(id);
        case 'users-bucket':
          return require(`${base}/user`)(ids);
        case 'repos':
          return require(`${base}/repository`)(id);
        case 'issues':
        case 'pulls':
          return require(`${base}/issues-pulls`)(id, resource);
        default:
          return require(`${base}/${resource}`)(id);
      }
    })
    .then(() => console.log(`${moment().format('LTS')} | Job ${name} finished!`))
    .catch(async (err) => {
      console.error(`Error thrown by ${resource} of ${name}.`);
      console.error(err);
      if (err && err.meta) console.error(JSON.stringify(err.meta));
      throw err;
    });
};
