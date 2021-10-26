import { TimelineEvent } from '.';

describe('Test TimelineEvent entity.', () => {
  it('should accept additional properties', () => {
    const plainEvent = {
      _id: 'id',
      repository: 'repo_id',
      issue: 'issue_id',
      type: 'test',
      extra: 'property'
    };

    const event = new TimelineEvent(plainEvent);
    expect(event).toHaveProperty('extra', 'property');
    expect(event.toJSON()).toStrictEqual(plainEvent);
  });
});
