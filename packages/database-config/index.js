/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

module.exports.knex = require('./knex');
module.exports.mongo = require('./mongo');

module.exports.Metadata = require('./models/Metadata');
module.exports.Actor = require('./models/Actor');
module.exports.Repository = require('./models/Repository');
module.exports.Stargazer = require('./models/Stargazer');
module.exports.Watcher = require('./models/Watcher');
