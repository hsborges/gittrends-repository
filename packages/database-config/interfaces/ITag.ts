/*
 *  Author: Hudson S. Borges
 */
/** @additionalProperties false */
export default interface ITag extends Record<string, unknown> {
  _id: string;
  repository: string;
  name: string;
  oid?: string;
  message?: string;
  tagger?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  target?: string;
}
