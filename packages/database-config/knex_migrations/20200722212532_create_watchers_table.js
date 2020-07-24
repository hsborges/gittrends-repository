/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('watchers', (table) => {
    table.string('id').primary();
    table.string('repository');
    table.string('user');

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.foreign('user').references('id').inTable('users');
  });

exports.down = (knex) => knex.schema.dropTable('watchers');
