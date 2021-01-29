/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('dependencies', (table) => {
    table.text('repository').notNullable();
    table.text('manifest').notNullable();
    table.text('filename');
    table.boolean('has_dependencies');
    table.text('package_manager');
    table.text('package_name').notNullable();
    table.json('target_repository');
    table.text('requirements');

    table.primary(['repository', 'manifest', 'package_name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('dependencies');
}
