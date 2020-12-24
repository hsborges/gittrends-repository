/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('commits', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.integer('additions');
    table.json('author');
    table.boolean('authored_by_committer');
    table.timestamp('authored_date', { useTz: true });
    table.integer('changed_files');
    table.integer('comments_count');
    table.timestamp('committed_date', { useTz: true });
    table.boolean('committed_via_web');
    table.json('committer');
    table.integer('deletions');
    table.text('message');
    table.string('oid').notNullable();
    table.timestamp('pushed_date', { useTz: true });
    table.json('signature');
    table.json('status');

    table.index('repository');
  });

exports.down = (knex) => knex.schema.dropTable('commits');
