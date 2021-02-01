/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('milestones', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('creator');
    table.text('description');
    table.timestamp('dueOn');
    table.integer('number');
    table.text('state');
    table.text('title');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('milestones');
}
