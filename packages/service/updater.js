/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const Bull = require('bull');
const async = require('async');
const consola = require('consola');
const program = require('commander');
const retry = require('retry');

const worker = require('./updater-worker.js');

const { Issue, PullRequest, Metadata } = require('@gittrends/database-config');
const { version } = require('./package.json');

async function retriableWorker(...args) {
  const options = { retries: 5, minTimeout: 1000, maxTimeout: 30000, randomize: true };
  const operation = retry.operation(options);

  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      worker(...args)
        .then(resolve)
        .catch((err) => {
          if (err.message && /recovery.mode/gi.test(err.message) && operation.retry(err))
            return null;
          else reject(operation.mainError() || err);
        });
    });
  });
}

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async () => {
    consola.info(`Updating resources using ${program.workers} workers`);

    const queue = new Bull('updates', {
      redis: {
        host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
        port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
        db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
      },
      defaultOptions: {
        removeOnComplete: true,
        removeOnFail: true
      }
    });

    const workersQueue = async.priorityQueue(async (job) => {
      const [resource, id] = job.id.split('@');
      const jobId = `${resource}@${(job.data && job.data.name) || id}`;

      await retriableWorker({ id, resource, data: job.data }, 1)
        .catch((err) => {
          consola.error(`Error thrown by ${jobId}.`);
          consola.error(err);
          throw err;
        })
        .finally(async () => {
          if (['issues', 'pulls'].indexOf(resource) >= 0) {
            const Model = resource === 'issues' ? Issue : PullRequest;

            await Model.query()
              .where({ repository: id })
              .leftJoin(
                Metadata.query()
                  .where({ id, resource: resource.slice(0, -1), key: 'updatedAt' })
                  .as('metadata'),
                'metadata.id',
                `issues.id`
              )
              .select('issues.id')
              .stream((stream) => {
                let pending = 0;

                stream.on('data', (record) => {
                  pending += 1;
                  workersQueue.push(
                    { id: `${resource.slice(0, -1)}@${record.id}` },
                    job.opts.priority - 0.1,
                    (err) => {
                      pending -= 1;
                      if (err) consola.error(err);
                      if (!pending) consola.success(`[${jobId}] finished!`);
                    }
                  );
                });

                stream.on('end', () => {
                  if (!pending) consola.success(`[${jobId}] finished!`);
                });
              });
          } else {
            consola.success(`[${jobId}] finished!`);
          }
        });

      if (global.gc) global.gc();
    }, program.workers);

    queue.process('*', program.workers, (job, done) =>
      workersQueue.push(job, job.opts.priority, done)
    );

    let timeout = null;
    process.on('SIGTERM', async () => {
      consola.warn('Signal received: closing queues');
      if (!timeout) {
        await queue.close().then(() => process.exit(0));
        timeout = setTimeout(() => process.exit(1), 30 * 1000);
      }
    });
  })
  .parse(process.argv);
