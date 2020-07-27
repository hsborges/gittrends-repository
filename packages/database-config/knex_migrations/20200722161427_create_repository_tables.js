/*
 *  Author: Hudson S. Borges
 */
exports.up = async (knex) => {
  await knex.schema.createTable('repositories', (table) => {
    table.string('id').primary();
    table.string('code_of_conduct');
    table.string('default_branch');
    table.text('description');
    table.string('homepage_url');
    table.string('license_info');
    table.string('name');
    table.string('name_with_owner');
    table.string('open_graph_image_url');
    table.string('owner');
    table.string('primary_language');
    table.integer('disk_usage').unsigned();
    table.integer('forks_count').unsigned();
    table.integer('issues_count').unsigned();
    table.integer('pull_requests_count').unsigned();
    table.integer('releases_count').unsigned();
    table.integer('stargazers_count').unsigned();
    table.integer('vulnerability_alerts_count').unsigned();
    table.integer('watchers_count').unsigned();
    table.timestamp('created_at', { useTz: true });
    table.timestamp('updated_at', { useTz: true });
    table.timestamp('pushed_at', { useTz: true });

    table.foreign('owner').references('id').inTable('users');
  });

  await knex.schema.createTable('repository_languages', (table) => {
    table.string('repository');
    table.string('language');
    table.integer('size').unsigned();

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.primary(['repository', 'language']);
  });

  await knex.schema.createTable('repository_topics', (table) => {
    table.string('repository');
    table.string('topic');

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.primary(['repository', 'topic']);
  });

  await knex.schema.createTable('repository_metadata', (table) => {
    table.string('repository');
    table.string('resource');
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
    table.primary(['repository', 'resource']);
  });
};

exports.down = (knex) =>
  Promise.all([
    knex.schema.dropTable('repository_metadata'),
    knex.schema.dropTable('repository_topics'),
    knex.schema.dropTable('repository_languages'),
    knex.schema.dropTable('repositories')
  ]);
