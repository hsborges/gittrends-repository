/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('tags', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('name').notNullable();
    table.string('target').notNullable();
    table.string('oid');
    table.text('message');
    table.json('tagger');

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.foreign('target').references('id').inTable('commits');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('tags');
