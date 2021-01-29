/*
 *  Author: Hudson S. Borges
 */
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('actors', (table) => {
    table.text('id').primary();
    table.text('type').notNullable();
    table.text('login').notNullable();
    table.text('avatar_url');

    // Users
    table.text('bio');
    table.text('company');
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
    table.text('projects_url');
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
    table.text('enterprise');
    table.text('user');

    // Common
    table.timestamp('created_at');
    table.integer('database_id');
    table.text('email');
    table.text('location');
    table.text('name');
    table.integer('repositories_count').unsigned();
    table.text('twitter_username');
    table.timestamp('updated_at');
    table.text('website_url');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('actors');
}
