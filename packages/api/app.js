const path = require('path');
const cors = require('fastify-cors');
const helmet = require('fastify-helmet');
const AutoLoad = require('fastify-autoload');

const compact = require('./helpers/compact');

module.exports = async function (fastify, opts) {
  fastify.register(helmet);
  fastify.register(cors);

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts }
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts }
  });

  // compact responses
  fastify.addHook('onSend', (request, reply, payload, done) => {
    if (!payload) done(null, payload);
    else done(null, JSON.stringify(compact(JSON.parse(payload))));
  });
};
