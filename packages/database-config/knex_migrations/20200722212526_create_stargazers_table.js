/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('stargazers', (table) => {
    table.text('repository').notNullable();
    table.text('user').notNullable();
    table.timestamp('starred_at').notNullable();

    table.primary(['repository', 'user', 'starred_at']);
  });

exports.down = (knex) => knex.schema.dropTable('stargazers');
