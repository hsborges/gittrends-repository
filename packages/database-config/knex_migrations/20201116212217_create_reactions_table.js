/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('reactions', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('issue').notNullable();
    table.string('event');
    table.string('content').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.string('user').notNullable();

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.foreign('issue').references('id').inTable('issues').onDelete('CASCADE');
    table.foreign('event').references('id').inTable('timeline').onDelete('CASCADE');
    table.foreign('user').references('id').inTable('actors');
  });

exports.down = (knex) => knex.schema.dropTable('reactions');
