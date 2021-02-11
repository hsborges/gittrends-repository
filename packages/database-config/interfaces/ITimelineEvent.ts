/* eslint-disable @typescript-eslint/ban-types */
export default interface ITimelineEvent extends Record<string, unknown> {
  id: string;
  repository: string;
  issue: string;
  type: string;
}
