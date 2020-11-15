/*
 *  Author: Hudson S. Borges
 */
const { Model } = require('objection');
const knexfile = require('./knexfile');
// eslint-disable-next-line import/order
const knex = require('knex')(knexfile);

Model.knex(knex);

module.exports = knex;
