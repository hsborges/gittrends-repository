import TimelineEvent from './TimelineEvent';

describe('Test TimelineEvent entity.', () => {
  it('should accept additional properties', () => {
    const plainEvent = {
      _id: 'MDExOkNsb3NlZEV2ZW50MjEyMTY0MzY0',
      repository: 'MDEwOlJlcG9zaXRvcnkyODQ1NzgyMw==',
      issue: 'MDU6SXNzdWU1Mjg4MDU0Mw==',
      type: 'ClosedEvent',
      id: 'MDExOkNsb3NlZEV2ZW50MjEyMTY0MzY0',
      actor: 'MDEyOk9yZ2FuaXphdGlvbjk4OTI1MjI=',
      created_at: new Date('2014-12-27T05:57:27.000Z')
    };

    const event = new TimelineEvent(plainEvent);
    expect(Object.keys(event.toJSON())).toEqual(Object.keys(plainEvent));
    expect(event.toJSON()).toStrictEqual(plainEvent);
  });
});
