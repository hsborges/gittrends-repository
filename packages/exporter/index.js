/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const Bottleneck = require('bottleneck');
const promiseRetry = require('promise-retry');
const { shuffle } = require('lodash');
const { program } = require('commander');
const { knex, mongo } = require('@gittrends/database-config');

const { version } = require('./package.json');
const exporter = require('./exporters/index');

program.option('-w, --workers [number]', 'Number of workers to use', 1).version(version);
program.parse(process.argv);

(async () => {
  consola.info('Preparing databases (mongo and sqlite3) ...');
  await Promise.all([knex.migrate.latest(), mongo.connect()]);

  consola.info('Creating a bottleneck ....');
  const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

  consola.info('Getting repositories on database ...');
  const repos = await mongo.repositories
    .find({}, { projection: { _id: 1, name_with_owner: 1 } })
    .toArray();

  consola.info('Exporting repositories ...');
  await Promise.all(
    shuffle(repos).map((repo) =>
      limiter
        .schedule(async () =>
          promiseRetry({ retries: 3 }, (retry, number) =>
            knex
              .transaction((trx) => exporter.repository({ id: repo._id, knex: trx, mongo }))
              .catch((err) => {
                consola.error(`Retry number: ${number}`, err);
                return retry(err);
              })
          )
        )
        .then(() => consola.success(`[${repo.name_with_owner}] exported!`))
        .catch(consola.error)
    )
  );

  await Promise.all([mongo.disconnect(), knex.destroy()]);
})();
