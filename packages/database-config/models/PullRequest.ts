import Issue from './Issue';
import schema from '../schemas/pull-request.json';

export default class PullRequest extends Issue {
  readonly issueType: string = 'PullRequest';

  constructor() {
    super(schema.properties);
  }
}
