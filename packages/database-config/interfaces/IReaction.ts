/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IReaction extends Record<string, unknown> {
  _id: string;
  repository: string;
  issue: string;
  event?: string;
  content: string;
  created_at: Date;
  user?: string;
}
