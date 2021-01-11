/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('reactions', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('issue').notNullable();
    table.string('event');
    table.string('content').notNullable();
    table.timestamp('created_at').notNullable();
    table.string('user').notNullable();

    table.index(['repository', 'issue']);
  });

exports.down = (knex) => knex.schema.dropTable('reactions');
