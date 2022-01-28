/*
 *  Author: Hudson S. Borges
 */
import { program, Option, Argument } from 'commander';

import { connect, Actor, MongoRepository, Repository } from '@gittrends/database';

import httpClient from '../helpers/proxy-http-client';
import { config } from '../package.json';
import { ActorsUpdater } from '../updater/ActorUpdater';
import { RepositoryUpdater } from '../updater/RepositoryUpdater';

async function updateRepositoryResource(resourceId: string, resources: string[]): Promise<void> {
  await MongoRepository.get(Repository)
    .collection.findOne({
      $or: [{ _id: resourceId }, { name_with_owner: new RegExp(resourceId, 'i') }]
    })
    .then((repo) => {
      if (!repo) throw new Error('Repository not found!');
      return new RepositoryUpdater(repo._id.toString(), resources as any[], httpClient).update();
    });
}

async function updateActor(resourceId: string): Promise<void> {
  await MongoRepository.get(Actor)
    .collection.findOne({ _id: resourceId })
    .then((user) => {
      if (!user) throw new Error('Actor not found!');
      return new ActorsUpdater(user._id.toString(), httpClient).update();
    });
}

/* execute */
program
  .description('Update an specific resource')
  .addOption(
    new Option('-r, --resource [string]')
      .choices(config.resources)
      .default(config.resources[0])
      .argParser((value, memo: string[]) => {
        if (value.toLowerCase() === 'all') return config.resources.filter((r) => r !== 'users');
        if (config.resources.indexOf(value.toLowerCase()) < 0) throw new Error('Invalid resource');
        return Array.isArray(memo) ? memo.concat(value.toLowerCase()) : [value.toLowerCase()];
      })
  )
  .addArgument(new Argument('<repository_or_actor>').argRequired())
  .action(async (resourceId: string): Promise<void> => {
    const opts: { resource: string[] } = program.opts();

    await connect().then((connection) =>
      Promise.resolve(() => {
        if (opts.resource.length === 1 && opts.resource[0] === 'users')
          return updateActor(resourceId);
        return updateRepositoryResource(resourceId, opts.resource);
      }).finally(() => connection.close())
    );
  })
  .parse(process.argv);
