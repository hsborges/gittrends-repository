/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('timeline', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('issue').notNullable();
    table.string('type').notNullable();
    table.json('payload').notNullable();

    table.index(['repository', 'issue']);
  });

exports.down = (knex) => knex.schema.dropTable('timeline');
