import Model from './Model';
import schema from '../schemas.json';

class TimelineEvent extends Model {
  tableName = 'timeline';
  jsonSchema = schema.definitions.ITimelineEvent;
}

export default new TimelineEvent();
