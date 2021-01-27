/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('reactions', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('issue').notNullable();
    table.text('event');
    table.text('content').notNullable();
    table.timestamp('created_at').notNullable();
    table.text('user').notNullable();

    table.index(['repository', 'issue']);
  });

exports.down = (knex) => knex.schema.dropTable('reactions');
