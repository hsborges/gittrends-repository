/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const Bull = require('bull');
const async = require('async');
const consola = require('consola');
const program = require('commander');
const retry = require('retry');

const { version } = require('./package.json');

const ActorsUpdater = require('./updater/ActorsUpdater');
const RepositoryUpdater = require('./updater/RepositoryUpdater');

function getUpdater(job, type) {
  switch (type) {
    case 'repositories': {
      const handlers = job.data.resources.map((resource) => {
        switch (resource) {
          case 'repository':
            return require('./updater/repository/DetailsHandler');
          case 'tags':
            return require('./updater/repository/TagsHandler');
          case 'releases':
            return require('./updater/repository/ReleasesHandler');
          case 'watchers':
            return require('./updater/repository/WatchersHandler');
          case 'stargazers':
            return require('./updater/repository/StargazersHandler');
          case 'issues':
            return require('./updater/repository/IssuesHandler');
          case 'pull_requests':
            return require('./updater/repository/PullRequestsHandler');
          case 'dependencies':
            return require('./updater/repository/DependenciesHandler');
          default:
            throw new Error(`Invalid resource (${resource})`);
        }
      });

      return new RepositoryUpdater(job.data.id, handlers, job);
    }
    case 'users':
      return new ActorsUpdater(job.data.id || job.data.ids);
    default:
      break;
  }
}

async function retriableWorker(job, type) {
  const options = { retries: 5, minTimeout: 1000, maxTimeout: 5000, randomize: true };
  const operation = retry.operation(options);

  return new Promise((resolve, reject) => {
    operation.attempt(() =>
      getUpdater(job, type)
        .update()
        .then(() => resolve())
        .catch((err) => {
          if (err.message && /recovery.mode|rollback/gi.test(err.message) && operation.retry(err))
            return null;
          else reject(operation.mainError() || err);
        })
    );
  })
    .then(() => consola.success(`[${job.id}] finished!`))
    .catch((err) => {
      consola.error(err);
      throw err;
    });
}

/* execute */
program
  .version(version)
  .description('Update repositories metadata')
  .option('-t, --type [type]', 'Update "repositories" or "users"', 'repositories')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async () => {
    consola.info(`Updating ${program.type} using ${program.workers} workers`);

    const queue = new Bull(program.type, {
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
      await retriableWorker(job, program.type).catch((err) => {
        consola.error(`Error thrown by ${job.id}.`);
        consola.error(err);
        throw err;
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
