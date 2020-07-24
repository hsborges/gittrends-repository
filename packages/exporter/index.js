/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const Bottleneck = require('bottleneck');
const { program } = require('commander');
const { knex, mongo } = require('@monorepo/database-config');

const { version } = require('./package.json');
const exporter = require('./exporters/index');

program.option('-w, --workers [number]', 'Number of workers to use', 1).version(version);
program.parse(process.argv);

(async () => {
  consola.info('Connecting to mongodb ...');
  await mongo.connect();

  consola.info('Creating a bottleneck ....');
  const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

  consola.info('Exporting users ....');
  await knex.transaction(async (trx) => exporter.users({ knex: trx, mongo }));
  // await exporter.users({ knex, mongo });

  consola.info('Getting repositories on database ...');
  const repos = await mongo.repositories
    .find({}, { projection: { _id: 1, name_with_owner: 1 } })
    .toArray();

  consola.info('Exporting repositories ...');
  await Promise.all(
    repos.map((repo) =>
      limiter
        .schedule(async () =>
          knex.transaction(async (trx) => exporter.repository({ id: repo._id, knex: trx, mongo }))
        )
        .then(() => consola.success(`[${repo.name_with_owner}] exported!`))
        .catch(consola.error)
    )
  );

  await Promise.all([mongo.disconnect(), knex.destroy()]);
})();
