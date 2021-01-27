/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  Promise.all([
    knex.schema.createTable('metadata', (table) => {
      table.text('id');
      table.text('resource').notNullable();
      table.text('key').notNullable();
      table.text('value');

      table.primary(['id', 'resource', 'key']);
    })
  ]);

exports.down = (knex) => knex.schema.dropTable('metadata');
