/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const redis = require('redis');
const consola = require('consola');
const program = require('commander');
const BeeQueue = require('bee-queue');
const Bottleneck = require('bottleneck');

const worker = require('./updater-worker.js');

const {
  config: { resources },
  version
} = require('./package.json');

const beeSettings = {
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
};

/* execute */
program
  .version(version)
  .arguments('<resource> [otherResourcers...]')
  .description(`Update repositories metadata (${resources.join(', ')})`)
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async (resource, otherResourcers) => {
    const selectedResources = [resource, ...otherResourcers];

    if (
      selectedResources.reduce((valid, r) => valid && resources.indexOf(r.toLowerCase()) < 0, true)
    )
      throw new Error("Invalid 'resource' argument values!");

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

    consola.info(
      `Processing ${selectedResources.join(', ')} job(s) using ${program.workers} workers`
    );

    const queues = selectedResources.map((r) => {
      const queue = new BeeQueue(`updates:${r}`, beeSettings);

      queue.checkStalledJobs(10 * 1000);

      queue.process(program.workers, (job) =>
        limiter.schedule(async () => {
          const jobId = `${resource}@${job.data.name}`;
          try {
            await worker({ ...job, resource: r });
            return consola.success(`[${jobId}] finished!`);
          } catch (err) {
            consola.error(`Error thrown by ${jobId}.`);
            consola.error(err);
            throw err;
          }
        })
      );

      return queue;
    });

    let timeout = null;
    process.on('SIGTERM', async () => {
      consola.warn('Signal received: closing queues');
      if (!timeout) {
        await Promise.all(queues.map((q) => q.close())).then(() => process.exit(0));
        timeout = setTimeout(() => process.exit(1), 30 * 1000);
      }
    });
  })
  .parse(process.argv);
