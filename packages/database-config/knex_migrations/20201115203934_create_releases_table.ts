/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('releases', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('author');
    table.timestamp('created_at');
    table.text('description');
    table.boolean('is_draft');
    table.boolean('is_prerelease');
    table.text('name');
    table.timestamp('published_at');
    table.integer('release_assets_count');
    table.text('tag');
    table.text('tag_name');
    table.timestamp('updated_at');

    table.index('repository');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('releases');
}
