/*
 *  Author: Hudson S. Borges
 */
import { program } from 'commander';
import consola from 'consola';

import { MongoRepository, Entity } from '@gittrends/database';
import * as Entities from '@gittrends/database/dist/entities';

import { version } from './package.json';
import { createChannel } from './rabbitmq';

program
  .version(version)
  .description('Update repositories metadata')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .hook('preAction', () => MongoRepository.connect().then())
  .hook('postAction', () => MongoRepository.close())
  .action(async () => {
    const options = program.opts();
    consola.info('Starting consumers for each queue ...');

    const channel = await createChannel();
    await channel.prefetch(parseInt(process.env.GT_RABBITMQ_PREFETCH ?? '1', 10));

    for (let i = 0; i < options.workers; i += 1) {
      await Promise.all(
        Object.values(Entities)
          .filter((E) => E !== Entity)
          .map(async (EntityRef) => {
            return channel.consume(
              EntityRef.name,
              async (message) => {
                if (!message) return;

                const instances = JSON.parse(message?.content.toString() || '{}').map(
                  (d: any) => new (EntityRef as new (...args: any[]) => Entity)(d)
                );

                await ([
                  Entities.Issue,
                  Entities.Milestone,
                  Entities.PullRequest,
                  Entities.Repository
                ]
                  .map((e) => e.name)
                  .indexOf(EntityRef.name) >= 0
                  ? MongoRepository.get(EntityRef as any).upsert(instances)
                  : MongoRepository.get(EntityRef as any).insert(instances)
                )
                  .then(() => channel.ack(message))
                  .catch(() => channel.nack(message));
              },
              { noAck: false }
            );
          })
      );
    }

    consola.info('Message queues and consumers ready (press ctrl+c to stop)');

    await new Promise((resolve) => process.on('SIGINT', resolve)).finally(() => channel.close());
  })
  .parseAsync(process.argv);
