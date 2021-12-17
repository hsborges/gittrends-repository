/*
 *  Author: Hudson S. Borges
 */
import { Option, program } from 'commander';
import consola from 'consola';
import * as csv from 'fast-csv';
import fs from 'fs';
import { Document } from 'mongodb';
import path from 'path';

import mongoClient, { ActorRepository } from '@gittrends/database';

import { version } from './package.json';

program
  .version(version)
  .addOption(
    new Option('-f, --format <string>', 'Source file format')
      .default('csv')
      .choices(['csv', 'json'])
  )
  .addOption(
    new Option('-o, --output <string>').argParser((value) => path.resolve(process.cwd(), value))
  )
  .addOption(new Option('--verbose').default(false))
  .action(async (options) => {
    if (!options.verbose) consola.pause();

    consola.info('Connecting to database ...');
    await mongoClient.connect();

    consola.info('Preparing output ...');
    const output = options.output ? fs.createWriteStream(options.output) : process.stdout;

    consola.info(`Getting locations from database ...`);
    await new Promise(async (resolve) => {
      const cursor = ActorRepository.collection.aggregate(
        [
          { $match: { location: { $exists: true } } },
          { $project: { location: { $toLower: { $trim: { input: '$location' } } } } },
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $project: { _id: false, location: '$_id', count: '$count' } },
          { $sort: { count: -1 } }
        ],
        { allowDiskUse: true }
      );

      switch (options.format) {
        case 'csv':
          const csvStream = csv.format({ headers: true, quote: true });
          csvStream.pipe(output);
          csvStream.on('end', () => resolve(null));

          let next: Document | null;
          while ((next = await cursor.next())) csvStream.write(next);

          csvStream.end();
          break;
        case 'json':
          (output as NodeJS.WriteStream).write(JSON.stringify(await cursor.toArray()), resolve);
          break;
        default:
          throw new Error('Invalid format type!');
      }
    });

    if (options.output) (output as fs.WriteStream).close();

    consola.info('Closing connection ...');
    await mongoClient.close();

    consola.success('Done!');
  })
  .parse(process.argv);
