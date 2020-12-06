/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('watchers', (table) => {
    table.string('repository').notNullable();
    table.string('user').notNullable();

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    // table.foreign('user').references('id').inTable('actors');

    table.primary(['repository', 'user']);
    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('watchers');
