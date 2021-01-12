/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('watchers', (table) => {
    table.string('repository').notNullable();
    table.string('user').notNullable();

    table.primary(['repository', 'user']);
  });

exports.down = (knex) => knex.schema.dropTable('watchers');
