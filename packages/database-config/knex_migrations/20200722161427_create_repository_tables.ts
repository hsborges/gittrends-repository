/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('repositories', (table) => {
    table.text('id').primary();
    table.integer('assignable_users_count').unsigned();
    table.text('code_of_conduct');
    table.timestamp('created_at');
    table.integer('database_id').unsigned();
    table.text('default_branch');
    table.boolean('delete_branch_on_merge');
    table.text('description');
    table.integer('disk_usage').unsigned();
    table.integer('forks_count').unsigned();
    table.json('funding_links');
    table.boolean('has_issues_enabled');
    table.boolean('has_projects_enabled');
    table.boolean('has_wiki_enabled');
    table.text('homepage_url');
    table.boolean('is_archived');
    table.boolean('is_blank_issues_enabled');
    table.boolean('is_disabled');
    table.boolean('is_empty');
    table.boolean('is_fork');
    table.boolean('is_in_organization');
    table.boolean('is_locked');
    table.boolean('is_mirror');
    table.boolean('is_private');
    table.boolean('is_security_policy_enabled');
    table.boolean('is_template');
    table.boolean('is_user_configuration_repository');
    table.integer('issues_count').unsigned();
    table.integer('labels_count').unsigned();
    table.json('languages');
    table.text('license_info');
    table.text('lock_reason');
    table.integer('mentionable_users_count').unsigned();
    table.boolean('merge_commit_allowed');
    table.integer('milestones_count').unsigned();
    table.text('mirror_url');
    table.text('name').notNullable();
    table.text('name_with_owner').notNullable();
    table.text('open_graph_image_url');
    table.text('owner').notNullable();
    table.text('parent');
    table.text('primary_language');
    table.timestamp('pushed_at');
    table.integer('pull_requests_count').unsigned();
    table.boolean('rebase_merge_allowed');
    table.integer('releases_count').unsigned();
    table.json('repository_topics');
    table.boolean('squash_merge_allowed');
    table.integer('stargazers_count').unsigned();
    table.text('template_repository');
    table.timestamp('updated_at');
    table.text('url');
    table.boolean('uses_custom_open_graph_image');
    table.integer('vulnerability_alerts_count').unsigned();
    table.integer('watchers_count').unsigned();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('repositories');
}
