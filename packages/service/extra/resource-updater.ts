/*
 *  Author: Hudson S. Borges
 */
import { program, Option, Argument } from 'commander';

import mongoClient, { MongoRepository, Repository } from '@gittrends/database';

import { useHttpClient } from '../helpers/proxy-http-client';
import { config } from '../package.json';
import { RepositoryUpdater } from '../updater/RepositoryUpdater';

/* execute */
program
  .description('Update an specific resource')
  .addOption(
    new Option('-r, --resource [string]').choices(config.resources).default(config.resources[0])
  )
  .addArgument(
    new Argument('<repository>').argParser((value) => value.trim().toLowerCase()).argRequired()
  )
  .action(async (repositoryId: string): Promise<void> => {
    const opts = program.opts();

    if (config.resources.map((r) => r.toLowerCase()).indexOf(opts.resource) < 0)
      throw new Error('Invalid resource');

    await mongoClient
      .connect()
      .then(() =>
        MongoRepository.get(Repository).collection.findOne({
          $or: [{ _id: repositoryId }, { name_with_owner: new RegExp(repositoryId, 'i') }]
        })
      )
      .then((repo) => {
        if (!repo) throw new Error('Repository not found!');

        return new RepositoryUpdater(
          repo._id.toString(),
          [opts.resource],
          useHttpClient()
        ).update();
      })
      .finally(() => mongoClient.close());
  })
  .parse(process.argv);
