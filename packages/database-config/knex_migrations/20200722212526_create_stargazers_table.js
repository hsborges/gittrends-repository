/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('stargazers', (table) => {
    table.string('repository');
    table.string('user');
    table.timestamp('starred_at', { useTz: true });

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.foreign('user').references('id').inTable('actors');

    table.primary(['repository', 'user', 'starred_at']);
  });

exports.down = (knex) => knex.schema.dropTable('stargazers');
