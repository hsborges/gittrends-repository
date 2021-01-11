/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('github_tokens', (table) => {
    table.string('token').primary();
    table.string('type');
    table.string('scope');
    table.string('login');
    table.string('email');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('github_tokens');
