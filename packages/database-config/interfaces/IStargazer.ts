/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IStargazer extends Record<string, unknown> {
  repository: string;
  user: string;
  starred_at: Date;
}
