/*
 *  Author: Hudson S. Borges
 */
import knex from '../knex';
import Actor from './Actor';
import Commit from './Commit';
import Dependency from './Dependency';
import GithubToken from './GithubToken';
import Issue from './Issue';
import Metadata from './Metadata';
import Milestone from './Milestone';
import PullRequest from './PullRequest';
import Reaction from './Reaction';
import Release from './Release';
import Repository from './Repository';
import Stargazer from './Stargazer';
import Tag from './Tag';
import TimelineEvent from './TimelineEvent';
import Watcher from './Watcher';

export default knex;

export {
  Actor,
  Commit,
  Dependency,
  GithubToken,
  Issue,
  Metadata,
  Milestone,
  PullRequest,
  Reaction,
  Release,
  Repository,
  Stargazer,
  Tag,
  TimelineEvent,
  Watcher
};
