/*
 *  Author: Hudson S. Borges
 */
exports.up = async (knex) => {
  await knex.schema.createTable('repositories', (table) => {
    table.string('id').primary();
    table.integer('assignable_users_count').unsigned();
    table.string('code_of_conduct');
    table.timestamp('created_at', { useTz: true });
    table.integer('database_id').unsigned();
    table.string('default_branch');
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
    table.string('license_info');
    table.string('lock_reason');
    table.integer('mentionable_users_count').unsigned();
    table.boolean('merge_commit_allowed');
    table.integer('milestones_count').unsigned();
    table.text('mirror_url');
    table.string('name').notNullable();
    table.string('name_with_owner').notNullable();
    table.text('open_graph_image_url');
    table.string('owner').notNullable();
    table.string('parent');
    table.string('primary_language');
    table.timestamp('pushed_at', { useTz: true });
    table.integer('pull_requests_count').unsigned();
    table.boolean('rebase_merge_allowed');
    table.integer('releases_count').unsigned();
    table.json('repository_topics');
    table.boolean('squash_merge_allowed');
    table.integer('stargazers_count').unsigned();
    table.string('template_repository');
    table.timestamp('updated_at', { useTz: true });
    table.string('url');
    table.boolean('uses_custom_open_graph_image');
    table.integer('vulnerability_alerts_count').unsigned();
    table.integer('watchers_count').unsigned();
  });
};

exports.down = (knex) => knex.schema.dropTable('repositories');
