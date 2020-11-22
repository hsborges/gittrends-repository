const { knex, ...models } = require('@gittrends/database-config');
const fastifyPlugin = require('fastify-plugin');

async function dbConnector(fastify) {
  fastify.decorate('knex', knex);
  Object.keys(models).forEach((name) => fastify.decorate(name, models[name]));
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(dbConnector);
