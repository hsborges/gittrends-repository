/*
 *  Author: Hudson S. Borges
 */
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import * as csv from 'fast-csv';
import fs from 'fs';
import { mapKeys, omitBy, snakeCase } from 'lodash';
import path from 'path';
import { Transform } from 'stream';

import mongoClient, { Location, LocationRepository } from '@gittrends/database-config';

import { version } from './package.json';

function loadFromCSV(src: string): Transform {
  return fs
    .createReadStream(src)
    .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
    .pipe(
      new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk: Record<string, unknown>, encoding, callback) {
          this.push(
            new Location(
              mapKeys(
                omitBy(chunk, (value) => value === ''),
                (_, key) => snakeCase(key)
              )
            )
          );
          callback();
        }
      })
    );
}

function loadFromJSON(src: string): Transform {
  throw new Error('Method not implemented.');
}

program
  .version(version)
  .addOption(
    new Option('-f, --format <string>', 'Source file format')
      .default('auto')
      .choices(['auto', 'csv', 'json'])
  )
  .addArgument(
    new Argument('<source>', 'Imports the locations from the resulting source file').argRequired()
  )
  .action(async (src, options) => {
    consola.info('Resolving source file ...');
    const srcFile = path.resolve('./', src);
    const extension = path.extname(srcFile);

    consola.info('Connecting to database ...');
    await mongoClient.connect();

    consola.info(`Reading, parsing and writing records on database ...`);
    // await each(locations, (location) => LocationRepository.upsert(location));
    const stream =
      options.format === 'csv' || (options.format === 'auto' && extension === '.csv')
        ? loadFromCSV(srcFile)
        : loadFromJSON(srcFile);

    const promises = [];
    for await (const location of stream) promises.push(LocationRepository.upsert(location));
    await Promise.all(promises);

    consola.info('Closing connection ...');
    await mongoClient.close();

    consola.success('Done!');
  })
  .parse(process.argv);
