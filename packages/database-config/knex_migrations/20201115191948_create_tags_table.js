/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('tags', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('name').notNullable();
    table.text('target');
    table.text('oid');
    table.text('message');
    table.json('tagger');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('tags');
