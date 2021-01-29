import Model from './Model';
import schema from '../schemas.json';
import ITimelineEvent from '../interfaces/ITimelineEvent';

class TimelineEvent extends Model<ITimelineEvent> {
  tableName = 'timeline';
  idColumn = 'id';
  jsonSchema = schema.definitions.ITimelineEvent;

  protected postValidate(data: TObject): Record<string, string | number | boolean> {
    return super.postValidate({ ...data, payload: JSON.parse(data.payload as string) });
  }

  protected validate(data: Record<string, unknown>): Record<string, string | number | boolean> {
    data.payload = JSON.stringify(data.payload);
    return super.validate(data);
  }
}

export default new TimelineEvent();
