/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('milestones', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('creator');
    table.text('description');
    table.timestamp('dueOn');
    table.integer('number');
    table.string('state');
    table.text('title');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('milestones');
