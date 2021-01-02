/* eslint-disable @typescript-eslint/ban-types */
export interface ITimelineEvent {
  id: string;
  repository: string;
  issue: string;
  type: string;
  payload: object;
}
