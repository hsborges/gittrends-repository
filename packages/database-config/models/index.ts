/*
 *  Author: Hudson S. Borges
 */
import knex from '../knex';

import _Metadata_ from './Metadata';
import _Actor_ from './Actor';
import _Commit_ from './Commit';
import _Dependency_ from './Dependency';
import _Issue_ from './Issue';
import _PullRequest_ from './PullRequest';
import _Reaction_ from './Reaction';
import _Release_ from './Release';
import _Repository_ from './Repository';
import _Stargazer_ from './Stargazer';
import _Tag_ from './Tag';
import _TimelineEvent_ from './TimelineEvent';
import _Watcher_ from './Watcher';

export default knex;
export const Metadata = new _Metadata_();
export const Actor = new _Actor_();
export const Commit = new _Commit_();
export const Repository = new _Repository_();
export const Dependency = new _Dependency_();
export const Issue = new _Issue_();
export const PullRequest = new _PullRequest_();
export const Reaction = new _Reaction_();
export const Release = new _Release_();
export const Stargazer = new _Stargazer_();
export const Tag = new _Tag_();
export const TimelineEvent = new _TimelineEvent_();
export const Watcher = new _Watcher_();
