/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('login');
    table.string('type');
    table.string('name');
    table.string('location');
    table.string('avatar_url');
    table.string('website_url');
    table.integer('repositories_count').unsigned();
    table.integer('starred_repositories_count').unsigned();
    table.integer('gists_count').unsigned();
    table.integer('watching_count').unsigned();
    table.integer('followers_count').unsigned();
    table.integer('following_count').unsigned();
    table.timestamp('created_at', { useTz: true });
    table.timestamp('updated_at', { useTz: true });
  });

exports.down = (knex) => knex.schema.dropTable('users');
