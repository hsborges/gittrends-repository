/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('milestones', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('creator');
    table.text('description');
    table.timestamp('dueOn');
    table.integer('number');
    table.text('state');
    table.text('title');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('milestones');
