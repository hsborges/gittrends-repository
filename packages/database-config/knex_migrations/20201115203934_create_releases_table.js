/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('releases', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('author');
    table.timestamp('created_at');
    table.text('description');
    table.boolean('is_draft');
    table.boolean('is_prerelease');
    table.string('name');
    table.timestamp('published_at');
    table.integer('release_assets_count');
    table.string('tag');
    table.string('tag_name');
    table.timestamp('updated_at');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('releases');
