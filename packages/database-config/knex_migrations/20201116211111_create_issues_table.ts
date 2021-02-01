/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('issues', (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.enu('type', ['Issue', 'PullRequest']).notNullable();
    table.text('active_lock_reason');
    table.text('author');
    table.text('author_association');
    table.text('body');
    table.boolean('closed');
    table.timestamp('closed_at');
    table.timestamp('created_at');
    table.boolean('created_via_email');
    table.integer('database_id');
    table.text('editor');
    table.boolean('includes_created_edit');
    table.timestamp('last_edited_at');
    table.boolean('locked');
    table.text('milestone');
    table.integer('number');
    table.timestamp('published_at');
    table.text('state');
    table.text('title');
    table.timestamp('updated_at');
    // connections
    table.json('assignees');
    table.json('labels');
    table.json('participants');
    table.json('reaction_groups');
    // pulls
    table.json('suggested_reviewers');
    table.integer('additions');
    table.json('base_ref');
    table.text('base_ref_name');
    table.text('base_ref_oid');
    table.text('base_repository');
    table.boolean('can_be_rebased');
    table.integer('changed_files');
    table.integer('deletions');
    table.json('head_ref');
    table.text('head_ref_name');
    table.text('head_ref_oid');
    table.text('head_repository');
    table.text('head_repository_owner');
    table.boolean('is_cross_repository');
    table.boolean('is_draft');
    table.boolean('maintainer_can_modify');
    table.text('merge_commit');
    table.text('merge_state_status');
    table.text('mergeable');
    table.boolean('merged');
    table.timestamp('merged_at');
    table.text('merged_by');
    table.text('permalink');
    table.text('potential_merge_commit');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('issues');
}
