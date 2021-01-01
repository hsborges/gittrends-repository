import Model from './Model';
import schema from '../schemas/timeline-event.json';

export default class TimelineEvent extends Model {
  constructor() {
    super('timeline', 'id', schema);
  }
}
