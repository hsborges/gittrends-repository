/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

module.exports.knex = require('./knex');
module.exports.mongo = require('./mongo');

module.exports.Metadata = require('./models/Metadata');
module.exports.Actor = require('./models/Actor');
module.exports.Commit = require('./models/Commit');
module.exports.Dependency = require('./models/Dependency');
module.exports.Issue = require('./models/Issue');
module.exports.PullRequest = require('./models/PullRequest');
module.exports.Reaction = require('./models/Reaction');
module.exports.Release = require('./models/Release');
module.exports.Repository = require('./models/Repository');
module.exports.Stargazer = require('./models/Stargazer');
module.exports.Tag = require('./models/Tag');
module.exports.TimelineEvent = require('./models/TimelineEvent');
module.exports.Watcher = require('./models/Watcher');
