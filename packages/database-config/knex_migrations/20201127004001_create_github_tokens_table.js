/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('github_tokens', (table) => {
    table.text('token').primary();
    table.text('type');
    table.text('scope');
    table.text('login');
    table.text('email');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('github_tokens');
