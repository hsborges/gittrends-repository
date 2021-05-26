/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface IWatcher extends Record<string, unknown> {
  _id: {
    repository: string;
    user: string;
  };
}
