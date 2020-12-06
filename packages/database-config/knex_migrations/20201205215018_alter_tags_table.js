/*
 *  Author: Hudson S. Borges
 */
exports.up = (knex) =>
  knex.schema.alterTable('tags', (table) => {
    table.string('target').alter();
  });

exports.down = (knex) =>
  knex.schema.alterTable('tags', (table) => {
    table.string('target').notNullable().alter();
  });
