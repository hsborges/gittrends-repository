/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('metadata', (table) => {
    table.text('id');
    table.text('resource').notNullable();
    table.text('key').notNullable();
    table.text('value');

    table.primary(['id', 'resource', 'key']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('metadata');
}
