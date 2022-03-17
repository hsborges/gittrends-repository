/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Actor extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'actors';

  _id!: string;
  type!: 'User' | 'Organization' | 'Mannequin' | 'Bot' | 'EnterpriseUserAccount';
  login!: string;
  avatar_url?: string;

  // User type + shared properties
  bio?: string;
  company?: string;
  /* shared */ created_at?: Date;
  /* shared */ database_id?: number;
  /* shared */ email?: string;
  followers?: number;
  following?: number;
  gists?: number;
  is_bounty_hunter?: boolean;
  is_campus_expert?: boolean;
  is_developer_program_member?: boolean;
  is_employee?: boolean;
  is_hireable?: boolean;
  is_site_admin?: boolean;
  /* shared */ location?: string;
  /* shared */ name?: string;
  projects?: number;
  projects_url?: string;
  /* shared */ repositories?: number;
  repositories_contributed_to?: number;
  starred_repositories?: number;
  status?: {
    created_at: Date;
    emoji?: string;
    expires_at?: Date;
    indicates_limited_availability?: boolean;
    message?: string;
    updated_at?: Date;
  };
  /* shared */ twitter_username?: string;
  /* shared */ updated_at?: Date;
  watching?: number;
  /* shared */ website_url?: string;

  // Organization
  description?: string;
  is_verified?: boolean;
  members_with_role?: number;
  teams?: number;

  // EnterpriseUserAccount
  user?: string;

  public static get __schema(): Joi.ObjectSchema<Actor> {
    return Joi.object<Actor>({
      _id: Joi.string().required(),
      type: Joi.string()
        .valid('User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount')
        .required(),
      login: Joi.string().required(),
      avatar_url: Joi.string(),

      bio: Joi.string(),
      company: Joi.string(),
      created_at: Joi.date(),
      database_id: Joi.number(),
      email: Joi.string(),
      followers: Joi.number(),
      following: Joi.number(),
      gists: Joi.number(),
      is_bounty_hunter: Joi.boolean(),
      is_campus_expert: Joi.boolean(),
      is_developer_program_member: Joi.boolean(),
      is_employee: Joi.boolean(),
      is_hireable: Joi.boolean(),
      is_site_admin: Joi.boolean(),
      location: Joi.string(),
      name: Joi.string(),
      projects: Joi.number(),
      projects_url: Joi.string(),
      repositories: Joi.number(),
      repositories_contributed_to: Joi.number(),
      starred_repositories: Joi.number(),
      status: Joi.object({
        created_at: Joi.date().required(),
        emoji: Joi.string(),
        expires_at: Joi.date(),
        indicates_limited_availability: Joi.boolean(),
        message: Joi.string(),
        updated_at: Joi.date()
      }),
      twitter_username: Joi.string(),
      updated_at: Joi.date(),
      watching: Joi.number(),
      website_url: Joi.string(),

      description: Joi.string(),
      is_verified: Joi.boolean(),
      members_with_role: Joi.number(),
      teams: Joi.number(),

      user: Joi.string()
    });
  }
}
