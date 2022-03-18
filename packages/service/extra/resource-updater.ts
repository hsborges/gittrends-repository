/*
 *  Author: Hudson S. Borges
 */
import { bold, dim } from 'chalk';
import { program, Option, Argument } from 'commander';
import consola from 'consola';

import { Actor, MongoRepository, Repository } from '@gittrends/database';

import httpClient from '../helpers/proxy-http-client';
import { config } from '../package.json';
import { ActorsUpdater } from '../updater/ActorUpdater';
import { RepositoryUpdater } from '../updater/RepositoryUpdater';
import Updater from '../updater/Updater';

async function getRepositoryUpdater(resourceId: string, resources: string[]): Promise<Updater> {
  return MongoRepository.get(Repository)
    .collection.findOne({
      $or: [{ _id: resourceId }, { name_with_owner: new RegExp(resourceId, 'i') }]
    })
    .then((repo) => {
      if (!repo) throw new Error('Repository not found!');
      return new RepositoryUpdater(repo._id.toString(), resources as any[], httpClient, {
        writeBatchSize: parseInt(process.env.GT_WRITE_BATCH_SIZE || '500')
      });
    });
}

async function getActorUpdater(resourceId: string): Promise<Updater> {
  return MongoRepository.get(Actor)
    .collection.findOne({ _id: resourceId })
    .then((user) => {
      if (!user) throw new Error('Actor not found!');
      return new ActorsUpdater(user._id.toString(), httpClient);
    });
}

/* execute */
program
  .description('Update an specific resource')
  .hook('preAction', () => MongoRepository.connect().then())
  .hook('postAction', () => MongoRepository.close())
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

    const updater =
      opts.resource.length === 1 && opts.resource[0] === 'users'
        ? await getActorUpdater(resourceId)
        : await getRepositoryUpdater(resourceId, opts.resource);

    updater.on('progress', (progress) =>
      consola.log(
        Object.keys(progress)
          .map((status) => `${bold(status)}: ${dim(progress[status].join(' '))}`)
          .join(' - ')
      )
    );
    updater.on('error', consola.error);

    await updater.update();
  })
  .parseAsync(process.argv);
