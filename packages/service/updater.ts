/*
 *  Author: Hudson S. Borges
 */
import { bold, dim, cyan } from 'chalk';
import { program } from 'commander';
import consola from 'consola';
import { get, has, isPlainObject, size, times } from 'lodash';
import log from 'log-update';

import { MongoRepository, Entity } from '@gittrends/database';
import * as Entities from '@gittrends/database/dist/entities';

import { createChannel } from './helpers/rabbitmq';
import { version } from './package.json';

program
  .version(version)
  .description('Push data from message broker to database')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .hook('preAction', () => MongoRepository.connect().then())
  .hook('postAction', () => MongoRepository.close())
  .action(async () => {
    const options = program.opts();
    consola.info('Starting consumers for each queue ...');

    let inserts = 0;

    const channel = await createChannel();
    await channel.prefetch(parseInt(process.env.GT_RABBITMQ_PREFETCH ?? '1', 10), false);

    Object.values(Entities)
      .filter((E) => E !== Entity)
      .reduce((memo: Array<any>, E) => memo.concat(times(options.workers, () => E)), [])
      .map(async (EntityRef: new (...args: any[]) => Entity) =>
        channel.consume(
          EntityRef.name,
          async (message) => {
            if (!message) return;

            const instances: Array<Entity> = JSON.parse(
              message?.content.toString() || '[]',
              (_, value) =>
                isPlainObject(value) && size(value) === 1 && has(value, '$date')
                  ? new Date(get(value, '$date'))
                  : value
            ).map((d: any) => new EntityRef(d));

            inserts += instances.length;

            await ([Entities.Issue, Entities.Milestone, Entities.PullRequest, Entities.Repository]
              .map((e) => e.name)
              .indexOf(EntityRef.name) >= 0
              ? MongoRepository.get(EntityRef).upsert(instances)
              : MongoRepository.get(EntityRef).insert(instances)
            )
              .then(() => channel.ack(message))
              .catch(() => channel.nack(message));
          },
          { noAck: false }
        )
      );

    consola.info('Message queues and consumers running (press ctrl+c to stop)');

    setInterval(
      () => log(`${bold(cyan('✎'))} ${bold('Inserts per second')}: ${dim(inserts)}`),
      250
    );
    setInterval(() => (inserts = 0), 1000);

    await new Promise((resolve, reject) => {
      process.on('SIGINT', resolve);
      process.on('SIGTERM', resolve);
      channel.on('close', () => reject(new Error('Channel closed!')));
    }).catch((err) => {
      consola.error(err);
      throw err;
    });
  })
  .parseAsync(process.argv)
  .catch(() => process.exit(1))
  .finally(() => process.exit(0));
