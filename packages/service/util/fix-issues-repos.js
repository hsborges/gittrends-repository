/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

const { get } = require('lodash');
const { mongo } = require('@gittrends/database-config');

const consola = require('consola');
const program = require('commander');
const Bottleneck = require('bottleneck');

const client = require('../github/graphql/graphql-client.js');
const remove = require('../updater/_remove.js');
const { version } = require('../package.json');
const { NotFoundError } = require('../helpers/errors.js');

const query = `
query($id:ID!) {
  node(id: $id) {
    ... on Issue {
      repository { id }
    }
    ... on PullRequest {
      repository { id }
    }
  }
}
`;

/* execute */
program
  .version(version)
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .option('--batch-size [number]', 'Number of records on each batch', Number, 100000)
  .action(async () => {
    await mongo.connect();

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });
    let hasMore = true;

    do {
      await Promise.mapSeries(['issues', 'pulls'], async (resource) => {
        const cursor = await mongo[resource].aggregate(
          [
            { $match: { repository: { $exists: false } } },
            { $limit: program.batchSize },
            { $project: { _id: 1 } }
          ],
          { allowDiskUse: true }
        );

        const promises = [];

        return new Promise((resolve, reject) =>
          cursor.forEach(
            (data) =>
              promises.push(
                limiter.schedule(async () => {
                  const response = await client
                    .post({ query, variables: { id: data._id } })
                    .catch(async (err) => {
                      if (err instanceof NotFoundError) return null;
                      throw err;
                    });

                  if (response) {
                    const repository = get(response, 'data.data.node.repository.id');
                    await mongo[resource].updateOne({ _id: data._id }, { $set: { repository } });
                    consola.success(`[${resource}=${data._id}] -> ${repository}`);
                  } else {
                    await remove[resource.slice(0, -1)]({ id: data._id });
                    consola.warn(`[${resource}=${data._id}] deleted!`);
                  }
                })
              ),
            (err) => (err ? reject(err) : resolve())
          )
        )
          .then(async () => {
            await Promise.all(promises);
            hasMore = promises.length === program.batchSize;
          })
          .catch((err) => {
            consola.error(err);
            hasMore = false;
          });
      });
    } while (hasMore);

    await mongo.disconnect();
  })
  .parse(process.argv);
