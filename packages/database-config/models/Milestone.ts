import Model from './Model';
import schema from '../schemas.json';
import IMilestone from '../interfaces/IMilestone';

class Milestone extends Model<IMilestone> {
  collectionName = 'milestones';
  idField = 'id';
  jsonSchema = schema.definitions.IMilestone;
}

export default new Milestone();
