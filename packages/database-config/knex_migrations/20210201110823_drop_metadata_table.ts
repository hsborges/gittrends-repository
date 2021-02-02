/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Knex from 'knex';
import { all, each } from 'bluebird';

type TObject = Record<string, unknown>;

export async function up(knex: Knex): Promise<void> {
  console.log('Adding column "_metadata" to repositories table ...');
  await knex.schema.createTable('metadata_new', (builder) => {
    builder.text('id').primary();
    builder.jsonb('data');
  });

  const repositories = await knex.table('repositories').select('id');

  console.log(`Iterating over ${repositories.length} repositories metadata ...`);
  await each(repositories, async (repo: any) => {
    const metadata = await knex.table('metadata').where({ id: repo.id });

    if (!metadata.length) return;

    const newMetadata = metadata.reduce((acc: any, record: any) => {
      if (acc[record.resource]) acc[record.resource][record.key] = record.value;
      else acc[record.resource] = { [record.key]: record.value };
      return acc;
    }, {});

    return knex.table('metadata_new').insert({ id: repo.id, data: newMetadata });
  });

  await each(['issues', 'actors'], async (table) => {
    console.log(`Iterating over ${table} metadata ...`);
    const records = await knex
      .table(table)
      .join('metadata', `${table}.id`, 'metadata.id')
      .select(knex.raw(`distinct(${table}.id)`));

    await each(records, async (record: any) => {
      const metadata = await knex.table('metadata').where({ id: record.id });

      const newMetadata = metadata.reduce(
        (acc: any, meta: any) => ({ ...acc, [meta.key]: meta.value }),
        {}
      );

      return knex.table('metadata_new').insert({ id: record.id, data: newMetadata });
    });
  });

  console.log('Dropping and renaming tables');
  await knex.schema.dropTable('metadata');
  await knex.schema.renameTable('metadata_new', 'metadata');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable('metadata_old', (table) => {
    table.text('id');
    table.text('resource');
    table.text('key');
    table.text('value');

    table.primary(['id', 'resource', 'key']);
  });

  const repositories = await knex
    .table('repositories')
    .select(['metadata.id'])
    .join('metadata', 'metadata.id', 'repositories.id');

  await each(repositories, async (repo: any) => {
    const metadata = await knex.table('metadata').where({ id: repo.id }).first();

    const records = Object.entries((metadata && metadata.data) || {}).reduce(
      (acc: TObject[], entry) =>
        acc.concat(
          Object.entries(entry[1] as TObject).map(([key, value]) => ({
            id: repo.id,
            resource: entry[0],
            key,
            value
          }))
        ),
      []
    );

    await knex.table('metadata_old').insert(records);
  });

  await all(
    ['issues', 'actors'].map(async (table) => {
      const repositories = await knex
        .table(table)
        .select('metadata.id')
        .join('metadata', 'metadata.id', `${table}.id`);

      await each(repositories, async (record: any) => {
        const metadata = await knex.table('metadata').where({ id: record.id }).first();

        const records = Object.entries((metadata && metadata.data) || {}).reduce(
          (acc: TObject[], entry) =>
            acc.concat({
              id: record.id,
              key: entry[0],
              value: entry[1]
            }),
          []
        );

        await knex.table('metadata_old').insert(records);
      });
    })
  );

  await knex.schema.dropTable('metadata');
  await knex.schema.renameTable('metadata_old', 'metadata');
}
