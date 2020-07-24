/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

module.exports.knex = require('./knex');
module.exports.mongo = require('./mongo');
