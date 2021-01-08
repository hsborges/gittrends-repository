/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('milestones', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('creator');
    table.string('description');
    table.timestamp('dueOn', { useTz: true });
    table.integer('number');
    table.string('state');
    table.string('title');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('milestones');
