import Model from './Model';
import schema from '../schemas.json';
import { ITimelineEvent } from '../interfaces/ITimelineEvent';

class TimelineEvent extends Model<ITimelineEvent> {
  tableName = 'timeline';
  jsonSchema = schema.definitions.ITimelineEvent;
}

export default new TimelineEvent();
