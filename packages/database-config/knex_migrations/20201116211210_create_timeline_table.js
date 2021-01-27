/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('timeline', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('issue').notNullable();
    table.text('type').notNullable();
    table.jsonb('payload').notNullable();

    table.index(['repository', 'issue']);
  });

exports.down = (knex) => knex.schema.dropTable('timeline');
