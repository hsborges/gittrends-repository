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
const { version } = require('../package.json');

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
  .action(async () => {
    await mongo.connect();

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

    return Promise.mapSeries(['issues', 'pulls'], async (resource) => {
      const cursor = await mongo[resource].aggregate(
        [{ $match: { repository: { $exists: false } } }, { $project: { _id: 1 } }],
        { allowDiskUse: true }
      );

      const promises = [];

      return new Promise((resolve, reject) =>
        cursor.forEach(
          (data) =>
            promises.push(
              limiter.schedule(async () => {
                const response = await client.post({ query, variables: { id: data._id } });
                const repository = get(response, 'data.data.node.repository.id');
                await mongo[resource].updateOne({ _id: data._id }, { $set: { repository } });
                consola.success(`[${resource}=${data._id}] -> ${repository}`);
              })
            ),
          (err) => (err ? reject(err) : resolve())
        )
      )
        .then(() => Promise.all(promises))
        .catch(consola.error);
    });
  })
  .parse(process.argv);
