/*
 *  Author: Hudson S. Borges
 */
const knex = require('knex');
const knexfile = require('./knexfile');

module.exports = knex(knexfile);
