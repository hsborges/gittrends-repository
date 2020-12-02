/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const consola = require('consola');
const program = require('commander');
const BeeQueue = require('bee-queue');
const Bottleneck = require('bottleneck');

const { Issue, PullRequest, Metadata } = require('@gittrends/database-config');
const worker = require('./updater-worker.js');

const { version } = require('./package.json');

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .option(
    '--redis-db [number]',
    'Override the configured redis db',
    Number,
    parseInt(process.env.GITTRENDS_REDIS_DB || 0)
  )
  .action(async () => {
    consola.info(`Updating resources using ${program.workers} workers`);

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

    const queue = new BeeQueue('updates', {
      redis: {
        host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
        port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
        db: program.redisDb
      },
      stallInterval: 10000,
      isWorker: true,
      getEvents: false,
      sendEvents: false,
      storeJobs: false,
      removeOnSuccess: true,
      removeOnFailure: true
    });

    queue.checkStalledJobs(10 * 1000);

    queue.process(program.workers, (job) => {
      const [resource, id] = job.id.split('@');
      const jobId = `${resource}@${job.data.name}`;

      const subProcesses = [];

      return limiter
        .schedule(() =>
          worker({ id, resource, data: job.data })
            .catch((err) => {
              consola.error(`Error thrown by ${jobId}.`);
              consola.error(err);
              throw err;
            })
            .finally(async () => {
              if (['issues', 'pulls'].indexOf(resource) >= 0) {
                const Model = resource === 'issues' ? Issue : PullRequest;

                await Model.query()
                  .leftJoin(
                    Metadata.query()
                      .where({ id, resource: resource.slice(0, -1), key: 'updatedAt' })
                      .as('metadata'),
                    'metadata.id',
                    `issues.id`
                  )
                  .where({ repository: id })
                  .select(['issues.id', 'issues.type'])
                  .toKnexQuery()
                  .stream((stream) => {
                    stream.on('data', (record) => {
                      subProcesses.push(
                        limiter
                          .schedule({ priority: 0 }, () =>
                            worker({ id: record.id, resource: resource.slice(0, -1) })
                          )
                          // TODO
                          .catch((err) => consola.error(err))
                      );
                    });
                  });
              }
            })
        )
        .then(() => {
          if (subProcesses.length) return Promise.all(subProcesses);
          consola.success(`[${jobId}] finished!`);
        });
    });

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
