/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.createTable('dependencies', (table) => {
    table.string('repository').notNullable();
    table.string('manifest').notNullable();
    table.string('filename');
    table.string('blob_path');
    table.boolean('has_dependencies');
    table.string('package_manager');
    table.string('package_name').notNullable();
    table.json('target_repository');
    table.string('requirements');

    table.primary(['repository', 'manifest', 'package_name']);
    table.foreign('repository').references('id').inTable('repositories').onDelete('CASCADE');
  });

exports.down = (knex) => knex.schema.dropTable('dependencies');
