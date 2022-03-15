/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';



import Entity from './Entity';


export default class Issue extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection: 'issues' | 'pull_requests' = 'issues';

  // Entity fields

  _id!: string;
  repository!: string;
  type!: 'Issue' | 'PullRequest';
  active_lock_reason?: string;
  author?: string;
  author_association?: string;
  body?: string;
  closed?: boolean;
  closed_at?: Date;
  created_at?: Date;
  created_via_email?: boolean;
  database_id?: number;
  editor?: string;
  includes_created_edit?: boolean;
  last_edited_at?: Date;
  locked?: boolean;
  milestone?: string;
  number?: number;
  published_at?: Date;
  state?: string;
  title?: string;
  updated_at?: Date;
  assignees?: string[];
  labels?: string[];
  participants?: string[];
  reaction_groups?: Record<string, any>;
  // entity metadata

  public get __schema(): Joi.ObjectSchema<Issue> {
    return Joi.object<Issue>({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      type: Joi.string().valid('Issue', 'PullRequest').required(),
      active_lock_reason: Joi.string(),
      author: Joi.string(),
      author_association: Joi.string(),
      body: Joi.string(),
      closed: Joi.boolean(),
      closed_at: Joi.date(),
      created_at: Joi.date(),
      created_via_email: Joi.boolean(),
      database_id: Joi.number(),
      editor: Joi.string(),
      includes_created_edit: Joi.boolean(),
      last_edited_at: Joi.date(),
      locked: Joi.boolean(),
      milestone: Joi.string(),
      number: Joi.number(),
      published_at: Joi.date(),
      state: Joi.string(),
      title: Joi.string(),
      updated_at: Joi.date(),
      assignees: Joi.array().items(Joi.string()),
      labels: Joi.array().items(Joi.string()),
      participants: Joi.array().items(Joi.string()),
      reaction_groups: Joi.object().pattern(Joi.string(), Joi.number())
    });
  }
}
