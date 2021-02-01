/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reactions', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('issue').notNullable();
    table.text('event');
    table.text('content').notNullable();
    table.timestamp('created_at').notNullable();
    table.text('user').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('reactions');
}
