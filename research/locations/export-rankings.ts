/*
 *  Author: Hudson S. Borges
 */
import fs from 'fs';
import path from 'path';
import consola from 'consola';
import * as csv from 'fast-csv';
import { uniq, compact, omit } from 'lodash';
import { Argument, Option, program } from 'commander';
import mongoClient, {
  Stargazer,
  Watcher,
  Issue,
  PullRequest,
  Repository
} from '@gittrends/database-config';

import { version } from './package.json';

async function computeStargazersOrWatchersRanking(
  repositoryId: string,
  model: typeof Stargazer | typeof Watcher
) {
  return model.collection
    .aggregate([
      { $match: { '_id.repository': repositoryId } },
      { $lookup: { from: 'actors', localField: '_id.user', foreignField: '_id', as: '_id.user' } },
      { $unwind: { path: '$_id.user' } },
      { $project: { _id: { $toLower: '$_id.user.location' } } },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
      { $unwind: { path: '$location' } },
      { $group: { _id: '$location.countryCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { [model === Stargazer ? 'stargazers' : 'watchers']: '$count' } }
    ])
    .toArray();
}

async function computeIssuesOrPullsRanking(
  repositoryId: string,
  model: typeof Issue | typeof PullRequest
) {
  return model.collection
    .aggregate([
      { $match: { repository: repositoryId, type: model === Issue ? 'Issue' : 'PullRequest' } },
      { $lookup: { from: 'actors', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author' } },
      { $project: { _id: { $toLower: '$author.location' } } },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: '_id'
        }
      },
      { $unwind: { path: '$_id' } },
      { $replaceRoot: { newRoot: '$_id' } },
      { $group: { _id: '$countryCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { [model === Issue ? 'issues' : 'pull_requests']: '$count' } }
    ])
    .toArray();
}

async function computeStargazersRanking(repositoryId: string) {
  return computeStargazersOrWatchersRanking(repositoryId, Stargazer);
}

async function computeWatchersRanking(repositoryId: string) {
  return computeStargazersOrWatchersRanking(repositoryId, Watcher);
}

async function computeIssuesRanking(repositoryId: string) {
  return computeIssuesOrPullsRanking(repositoryId, Issue);
}

async function computePullRequestsRanking(repositoryId: string) {
  return computeIssuesOrPullsRanking(repositoryId, PullRequest);
}

program
  .version(version)
  .addOption(
    new Option('-f, --format [string]', 'Format to print the result')
      .default('csv')
      .choices(['csv', 'json'])
  )
  .addOption(new Option('-o, --output [file-name]', 'Output result to a file'))
  .addOption(new Option('--verbose', 'Display logging information').default(false))
  .addArgument(
    new Argument('<repository>', 'Repository name, or id, to generate the rankings').argRequired()
  )
  .action(async (repository, options) => {
    if (!options.output) consola.pauseLogs();
    if (options.verbose) consola.resumeLogs();

    consola.info('Connecting to database ...');
    await mongoClient.connect();

    consola.info('Recovering repository information ...');
    const repo = await Repository.collection.findOne({
      $or: [{ _id: repository }, { name_with_owner: repository }]
    });

    if (!repo) throw new Error('Repository not found!');

    consola.info('Running scripts to compute the rankings ...');
    const results = await Promise.all(
      [
        computeStargazersRanking,
        computeWatchersRanking,
        computeIssuesRanking,
        computePullRequestsRanking
      ].map((func) => func(repo._id))
    );

    consola.info('Processing results ...');
    const fields = ['location', 'stargazers', 'watchers', 'issues', 'pull_requests'];

    const records = uniq(
      results.reduce((memo, result) => memo.concat(result.map((r) => r._id)), [])
    )
      .map((country) =>
        compact(results.map((result) => result.find((r) => r._id === country))).reduce(
          (memo, data) => Object.assign(memo, data),
          {}
        )
      )
      .sort((a, b) => a._id - b._id)
      .map((data) =>
        omit(
          {
            location: data._id || 'UNKNOWN',
            ...data,
            ...fields
              .slice(1)
              .reduce((memo, header) => Object.assign(memo, { [header]: data[header] || 0 }), {})
          },
          '_id'
        )
      );

    consola.info('Closing connection ...');
    await mongoClient.close();

    consola.info('Writing results in the output');
    const result =
      options.format === 'csv'
        ? await csv.writeToString(records, { headers: fields })
        : JSON.stringify(records);

    if (options.output) fs.writeFileSync(path.resolve('./', options.output), result);
    else process.stdout.write(result);

    consola.success('Done!');
  })
  .parse(process.argv);
