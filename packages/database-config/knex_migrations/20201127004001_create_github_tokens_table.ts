/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('github_tokens', (table) => {
    table.text('token').primary();
    table.text('type');
    table.text('scope');
    table.text('login');
    table.text('email');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('github_tokens');
}
