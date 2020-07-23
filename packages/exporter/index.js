/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const { program } = require('commander');
const Bottleneck = require('bottleneck');

const knex = require('./knex');
const mongo = require('./mongo');
const { version } = require('./package.json');

const exporter = require('./exporters/index');

program.option('-w, --workers [number]', 'Number of workers to use', 1).version(version);
program.parse(process.argv);

(async () => {
  consola.info('Connecting to mongodb ...');
  await mongo.connect();

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    consola.info('Preparing sqlite3 database ...');
    await knex.raw('PRAGMA foreign_keys = ON');
  }

  consola.info('Creating a bottleneck ....');
  const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

  consola.info('Getting repositories on database ...');
  const repos = await mongo.repositories
    .find({}, { projection: { _id: 1, name_with_owner: 1 } })
    .toArray();

  await Promise.all(
    repos.map((repo) =>
      limiter
        .schedule(async () => {
          consola.info(`[${repo.name_with_owner}] exporting ...`);
          return knex.transaction(async (trx) =>
            exporter.repository({ id: repo._id, knex: trx, mongo })
          );
        })
        .then(() => consola.success(`[${repo.name_with_owner}] exported!`))
        .catch(consola.error)
    )
  );

  await Promise.all([mongo.disconnect(), knex.destroy()]);
})();
