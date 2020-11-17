/*
 *  Author: Hudson S. Borges
 */
exports.up = async (knex) => {
  await knex.schema.raw("CREATE TYPE \"issue_type\" AS ENUM ('ISSUE', 'PULL_REQUEST')");

  return knex.schema.createTable('issues', (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table
      .enu('type', ['ISSUE', 'PULL_REQUEST'], {
        useNative: true,
        existingType: true,
        enumName: 'issue_type'
      })
      .notNullable();
    table.string('active_lock_reason');
    table.string('author');
    table.string('author_association');
    table.text('body');
    table.boolean('closed');
    table.timestamp('closed_at', { useTz: true });
    table.timestamp('created_at', { useTz: true });
    table.boolean('created_via_email');
    table.integer('database_id');
    table.string('editor');
    table.boolean('includes_created_edit');
    table.timestamp('last_edited_at', { useTz: true });
    table.boolean('locked');
    table.json('milestone');
    table.integer('number');
    table.timestamp('published_at', { useTz: true });
    table.string('state');
    table.text('title');
    table.timestamp('updated_at', { useTz: true });
    // connections
    table.json('assignees');
    table.json('labels');
    table.json('participants');
    table.json('reaction_groups');
    // pulls
    table.json('suggested_reviewers');
    table.integer('additions');
    table.json('base_ref');
    table.string('base_ref_name');
    table.string('base_ref_oid');
    table.json('base_repository');
    table.boolean('can_be_rebased');
    table.integer('changed_files');
    table.integer('deletions');
    table.json('head_ref');
    table.string('head_ref_name');
    table.string('head_ref_oid');
    table.json('head_repository');
    table.string('head_repository_owner');
    table.boolean('is_cross_repository');
    table.boolean('is_draft');
    table.boolean('maintainer_can_modify');
    table.string('merge_commit');
    table.string('merge_state_status');
    table.boolean('mergeable');
    table.boolean('merged');
    table.timestamp('merged_at', { useTz: true });
    table.string('merged_by');
    table.string('permalink');
    table.string('potential_merge_commit');

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.foreign('head_repository_owner').references('id').inTable('actors');
    table.foreign('merged_by').references('id').inTable('actors');
    table.foreign('merge_commit').references('id').inTable('commits');
    table.foreign('potential_merge_commit').references('id').inTable('commits');

    table.index(['repository', 'type']);
  });
};

exports.down = (knex) =>
  knex.schema.dropTable('issues').then(() => knex.schema.raw('DROP TYPE "issue_type"'));
