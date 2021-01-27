/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('watchers', (table) => {
    table.text('repository').notNullable();
    table.text('user').notNullable();

    table.primary(['repository', 'user']);
  });

exports.down = (knex) => knex.schema.dropTable('watchers');
