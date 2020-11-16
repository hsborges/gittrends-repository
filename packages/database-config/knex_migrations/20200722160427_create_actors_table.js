/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('actors', (table) => {
    table.string('id').primary();
    table.string('type').notNullable();
    table.string('login').notNullable();
    table.string('avatar_url');

    // Users
    table.text('bio');
    table.string('company');
    table.integer('followers_count').unsigned();
    table.integer('following_count').unsigned();
    table.integer('gists_count').unsigned();
    table.boolean('is_bounty_hunter');
    table.boolean('is_campus_expert');
    table.boolean('is_developer_program_member');
    table.boolean('is_employee');
    table.boolean('is_hireable');
    table.boolean('is_site_admin');
    table.integer('projects_count');
    table.string('projects_url');
    table.integer('repositories_contributed_to_count').unsigned();
    table.integer('starred_repositories_count').unsigned();
    table.json('status');
    table.integer('watching_count').unsigned();

    // Organization
    table.text('description');
    table.boolean('is_verified');
    table.integer('members_with_role_count');
    table.integer('teams_count');

    // EnterpriseUserAccount
    table.string('enterprise');
    table.string('user');

    // Common
    table.timestamp('created_at', { useTz: true });
    table.integer('database_id');
    table.string('email');
    table.string('location');
    table.string('name');
    table.integer('repositories_count').unsigned();
    table.string('twitter_username');
    table.timestamp('updated_at', { useTz: true });
    table.string('website_url');
  });

exports.down = (knex) => knex.schema.dropTable('actors');
