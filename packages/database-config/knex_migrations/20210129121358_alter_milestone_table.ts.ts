/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('milestones', (table) => {
    table.float('progress_percentage');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('milestones', (table) => {
    table.dropColumn('progress_percentage');
  });
}
