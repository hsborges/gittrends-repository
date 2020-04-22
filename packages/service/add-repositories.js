/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const { chain, mergeWith, isArray, omit } = require('lodash');
const { program } = require('commander');
const { version } = require('./package.json');

const db = require('./modules/connection');
const search = require('./modules/github/graphql/repositories/search');

/* Script entry point */
program
  .version(version)
  .option('--limit <number>', 'Maximun number of repositories', Number, 1)
  .option('--language [string]', 'Major programming language')
  .parse(process.argv);

console.log('Searching for the top-%s repositories with more stars on GitHub ...', program.limit);

Promise.map(new Array(3), () => search(program.limit, { language: program.language }))
  .then((results) => {
    const result = results.reduce(
      (acc, res) => mergeWith(acc, res, (a, b) => (isArray(a) ? a.concat(b) : a)),
      {}
    );

    const repositories = chain(result.repositories)
      .uniqBy('id')
      .orderBy(['stargazers_count'], ['desc'])
      .slice(0, program.limit)
      .value();

    const users = chain(result.users)
      .uniqBy('id')
      .intersectionWith(repositories, (u, r) => u.id === r.owner)
      .value();

    return [repositories, users];
  })
  .spread(async (repos, users) => {
    console.log('Adding repositories to database ...');

    const insert = (docs, collection) => {
      if (!docs || !docs.length) return Promise.resolve();
      return collection
        .bulkWrite(
          docs.map((doc) => ({
            insertOne: { document: omit({ ...doc, _id: doc.id }, 'id') }
          })),
          { ordered: false }
        )
        .catch((err) => (err.code === 11000 ? Promise.resolve() : Promise.reject(err)));
    };

    return Promise.resolve(db.connect())
      .then(() => insert(users, db.users))
      .then(() => insert(repos, db.repositories))
      .finally(() => db.disconnect());
  })
  .then(() => console.log('Repositories successfully added!'))
  .catch((err) => console.error(err));
