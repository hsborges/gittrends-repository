/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('timeline', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('issue').notNullable();
    table.text('type').notNullable();
    table.jsonb('payload').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('timeline');
}
