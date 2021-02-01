/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tags', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('name').notNullable();
    table.text('target');
    table.text('oid');
    table.text('message');
    table.json('tagger');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tags');
}
