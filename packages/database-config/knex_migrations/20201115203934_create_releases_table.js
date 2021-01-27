/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('releases', (table) => {
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

exports.down = (knex) => knex.schema.dropTable('releases');
