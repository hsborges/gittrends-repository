/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IWatcher extends Record<string, unknown> {
  repository: string;
  user: string;
}
