/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  Promise.all([
    knex.schema.createTable('metadata', (table) => {
      table.text('id');
      table.string('resource').notNullable();
      table.string('key').notNullable();
      table.text('value');

      table.primary(['id', 'resource', 'key']);
      table.index('id');
    })
  ]);

exports.down = (knex) => knex.schema.dropTable('metadata');
