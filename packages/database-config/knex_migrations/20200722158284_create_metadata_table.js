/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('metadata', (table) => {
    table.string('id');
    table.string('resource').notNullable();
    table.string('key').notNullable();
    table.string('value');

    table.primary(['id', 'resource', 'key']);
  });

exports.down = (knex) => knex.schema.dropTable('metadata');
