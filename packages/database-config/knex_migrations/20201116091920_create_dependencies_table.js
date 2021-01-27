/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('dependencies', (table) => {
    table.text('repository').notNullable();
    table.text('manifest').notNullable();
    table.text('filename');
    table.boolean('has_dependencies');
    table.text('package_manager');
    table.text('package_name').notNullable();
    table.json('target_repository');
    table.text('requirements');

    table.primary(['repository', 'manifest', 'package_name']);
  });

exports.down = (knex) => knex.schema.dropTable('dependencies');
