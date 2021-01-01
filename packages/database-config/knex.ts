/*
 *  Author: Hudson S. Borges
 */
import knex from 'knex';
import Model from './models/Model';
import knexfile from './knexfile';

const knexInstance: knex = knex(knexfile);
Model.knex = knexInstance;

export default knexInstance;
