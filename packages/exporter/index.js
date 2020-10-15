/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const fs = require('fs');
const consola = require('consola');
const Bottleneck = require('bottleneck');
const { program } = require('commander');
const { knex, mongo } = require('@gittrends/database-config');

const { version } = require('./package.json');
const exporter = require('./exporters/index');

const { connection } = require('../database-config/knexfile');

program.option('-w, --workers [number]', 'Number of workers to use', 1).version(version);
program.parse(process.argv);

(async () => {
  consola.info('Creating backup from the latest database ...');
  if (fs.existsSync(connection.filename)) {
    fs.renameSync(
      connection.filename,
      connection.filename.replace(/(.+).sqlite3/gi, `$1.${Date.now()}.sqlite3`)
    );
  }

  consola.info('Preparing databases (mongo and sqlite3) ...');
  await Promise.all([knex.migrate.latest(), mongo.connect()]);

  consola.info('Creating a bottleneck ....');
  const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

  consola.info('Exporting users ....');
  await knex.transaction((trx) => exporter.users({ knex: trx, mongo }));

  consola.info('Getting repositories on database ...');
  const repos = await mongo.repositories
    .find({}, { projection: { _id: 1, name_with_owner: 1 } })
    .toArray();

  consola.info('Exporting repositories ...');
  await Promise.all(
    repos.map((repo) =>
      limiter
        .schedule(async () =>
          knex.transaction((trx) => exporter.repository({ id: repo._id, knex: trx, mongo }))
        )
        .then(() => consola.success(`[${repo.name_with_owner}] exported!`))
        .catch(consola.error)
    )
  );

  await Promise.all([mongo.disconnect(), knex.destroy()]);
})();
