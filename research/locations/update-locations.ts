/*
 *  Author: Hudson S. Borges
 */
import fs from 'fs';
import path from 'path';
import consola from 'consola';
import * as csv from 'fast-csv';
import mongoClient from '@gittrends/database-config';
import { omitBy } from 'lodash';
import { Argument, Option, program } from 'commander';
import { version } from './package.json';

type LocationRecord = {
  location: string;
  label: string;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  state?: string;
  country?: string;
  city?: string;
};

async function loadFromCSV(src: string): Promise<LocationRecord[]> {
  return new Promise((resolve, reject) => {
    const locations: LocationRecord[] = [];

    fs.createReadStream(src)
      .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
      .on('error', reject)
      .on('data', (row) => locations.push(row))
      .on('end', () => resolve(locations));
  });
}

async function loadFromJSON(src: string): Promise<LocationRecord[]> {
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
    await mongoClient
      .db()
      .collection('locations')
      .bulkWrite(
        locations
          .map((l) => omitBy({ ...l, _id: l.location }, (v, k) => !v || k === 'location'))
          .map((l) => ({
            replaceOne: { filter: { _id: l._id }, replacement: l, upsert: true }
          }))
      );

    consola.info('Closing connection ...');
    await mongoClient.close();

    consola.success('Done!');
  })
  .parse(process.argv);
