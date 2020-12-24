/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('tags', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('name').notNullable();
    table.string('target');
    table.string('oid');
    table.text('message');
    table.json('tagger');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('tags');
