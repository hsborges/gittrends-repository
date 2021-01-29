/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('stargazers', (table) => {
    table.text('repository').notNullable();
    table.text('user').notNullable();
    table.timestamp('starred_at').notNullable();

    table.primary(['repository', 'user', 'starred_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('stargazers');
}
