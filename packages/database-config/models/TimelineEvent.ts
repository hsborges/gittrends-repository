import Model from './Model';
import schema from '../schemas.json';
import ITimelineEvent from '../interfaces/ITimelineEvent';

class TimelineEvent extends Model<ITimelineEvent> {
  collectionName = 'timeline';
  idField = 'id';
  jsonSchema = schema.definitions.ITimelineEvent;
}

export default new TimelineEvent();
