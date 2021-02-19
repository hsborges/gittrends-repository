/*
 *  Author: Hudson S. Borges
 */
/* eslint-disable @typescript-eslint/ban-types */
/** @additionalProperties true */
export default interface ITimelineEvent extends Record<string, unknown> {
  _id: string;
  repository: string;
  issue: string;
  type: string;
}
