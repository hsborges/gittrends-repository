/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('commits', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.integer('additions');
    table.json('author');
    table.boolean('authored_by_committer');
    table.timestamp('authored_date');
    table.integer('changed_files');
    table.integer('comments_count');
    table.timestamp('committed_date');
    table.boolean('committed_via_web');
    table.json('committer');
    table.integer('deletions');
    table.text('message');
    table.text('oid').notNullable();
    table.timestamp('pushed_date');
    table.json('signature');
    table.json('status');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('commits');
