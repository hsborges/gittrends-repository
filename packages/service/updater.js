/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const redis = require('redis');
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
  .action(async () => {
    consola.info(`Updating resources using ${program.workers} workers`);

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

    const queue = new BeeQueue('updates', {
      redis: redis.createClient({
        host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
        port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
        db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
      }),
      stallInterval: 10000,
      isWorker: true,
      getEvents: false,
      sendEvents: false,
      storeJobs: false,
      removeOnSuccess: true,
      removeOnFailure: true
    });

    queue.checkStalledJobs(10 * 1000, () => (global.gc ? global.gc() : null));

    queue.process(program.workers, async (job) => {
      const [resource, id] = job.id.split('@');
      const jobId = `${resource}@${job.data.name}`;

      await limiter.schedule(async () => {
        try {
          await worker({ id, resource, data: job.data }).finally(async () => {
            if (['issues', 'pulls'].indexOf(resource) >= 0) {
              const promises = [];
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
                .stream((stream) =>
                  stream.on('data', (record) =>
                    promises.push(
                      limiter
                        .schedule({ priority: 0 }, () =>
                          worker({
                            id: record.id,
                            resource: resource.slice(0, -1)
                          })
                        )
                        // TODO
                        .catch((err) => consola.error(err))
                    )
                  )
                );

              await Promise.all(promises);
            }
          });

          return consola.success(`[${jobId}] finished!`);
        } catch (err) {
          consola.error(`Error thrown by ${jobId}.`);
          consola.error(err);
          throw err;
        }
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
