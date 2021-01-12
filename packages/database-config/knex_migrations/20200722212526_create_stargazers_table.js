/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('stargazers', (table) => {
    table.string('repository').notNullable();
    table.string('user').notNullable();
    table.timestamp('starred_at').notNullable();

    table.primary(['repository', 'user', 'starred_at']);
  });

exports.down = (knex) => knex.schema.dropTable('stargazers');
