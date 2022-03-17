/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Commit extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'commits';

  // Entity fields
  _id!: string;

  repository!: string;
  additions?: number;
  author?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  authored_by_committer?: boolean;
  authored_date?: Date;
  changed_files?: number;
  comments_count?: number;
  committed_date?: Date;
  committed_via_web?: boolean;
  committer?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  deletions?: number;
  message?: string;
  oid!: string;
  pushed_date?: Date;
  signature?: {
    email?: string;
    is_valid?: boolean;
    signer?: string;
    state?: string;
    was_signed_by_git_hub?: boolean;
  };
  status?: {
    id: string;
    contexts?: { context: string; description?: string; created_at?: Date }[];
    state?: string;
  };

  public static get __schema(): Joi.ObjectSchema<Commit> {
    const CommitAuthor = Joi.object({
      date: Joi.date().required(),
      email: Joi.string(),
      name: Joi.string(),
      user: Joi.string()
    });

    return Joi.object<Commit>({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      additions: Joi.number(),
      author: CommitAuthor,
      authored_by_committer: Joi.boolean(),
      authored_date: Joi.date(),
      changed_files: Joi.number(),
      comments_count: Joi.number(),
      committed_date: Joi.date(),
      committed_via_web: Joi.boolean(),
      committer: CommitAuthor,
      deletions: Joi.number(),
      message: Joi.string(),
      oid: Joi.string().required(),
      pushed_date: Joi.date(),
      signature: Joi.object({
        email: Joi.string(),
        is_valid: Joi.boolean(),
        signer: Joi.string(),
        state: Joi.string(),
        was_signed_by_git_hub: Joi.boolean()
      }),
      status: Joi.object({
        id: Joi.string().required(),
        contexts: Joi.array().items(
          Joi.object({
            context: Joi.string().required(),
            description: Joi.string(),
            created_at: Joi.date()
          })
        ),
        state: Joi.string()
      })
    });
  }
}
