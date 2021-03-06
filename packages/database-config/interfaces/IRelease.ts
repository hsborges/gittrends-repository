/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IRelease extends Record<string, unknown> {
  _id: string;
  repository: string;
  author?: string;
  created_at?: Date;
  description?: string;
  is_draft?: boolean;
  is_prerelease?: boolean;
  name?: string;
  published_at?: Date;
  release_assets_count?: number;
  tag?: string;
  tag_name?: string;
  updated_at?: Date;
}
