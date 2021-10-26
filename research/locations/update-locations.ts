/*
 *  Author: Hudson S. Borges
 */
import { each } from 'bluebird';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import * as csv from 'fast-csv';
import fs from 'fs';
import { mapKeys, omitBy, snakeCase } from 'lodash';
import path from 'path';

import mongoClient, { Location, LocationRepository } from '@gittrends/database-config';

import { version } from './package.json';

async function loadFromCSV(src: string): Promise<Location[]> {
  return new Promise((resolve, reject) => {
    const locations: Location[] = [];

    fs.createReadStream(src)
      .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
      .on('error', reject)
      .on('data', (row) => {
        locations.push(
          new Location(
            mapKeys(
              omitBy(row, (value) => value === ''),
              (_, key) => snakeCase(key)
            )
          )
        );
      })
      .on('end', () => resolve(locations));
  });
}

async function loadFromJSON(src: string): Promise<Location[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (error, data) => {
      if (error) return reject(error);
      resolve(JSON.parse(data.toString()));
    });
  });
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

    consola.info('Reading and parsing content ...');
    const locations = await (options.format === 'csv' ||
    (options.format === 'auto' && extension === '.csv')
      ? loadFromCSV(srcFile)
      : loadFromJSON(srcFile));

    consola.info('Connecting to database ...');
    await mongoClient.connect();

    consola.info(`Writing ${locations.length} records to database ...`);
    await each(locations, (location) => LocationRepository.upsert(location));

    consola.info('Closing connection ...');
    await mongoClient.close();

    consola.success('Done!');
  })
  .parse(process.argv);
