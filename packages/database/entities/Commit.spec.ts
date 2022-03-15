import Commit from './Commit';

describe('Test Commit entity.', () => {
  it('should parse commits', () => {
    const data = {
      _id: 'MDY6Q29tbWl0MzE3OTI4MjQ6ZDk1N2M4ZjA0MDkwMmFhM2ZkNDRiMzY3MTUwYmRlNTZiNjRjZWM4Mw==',
      oid: 'd957c8f040902aa3fd44b367150bde56b64cec83',
      additions: 54,
      author: {
        date: new Date('2017-11-30T21:29:59.000Z'),
        email: 'chris@bracken.jp',
        name: 'Chris Bracken',
        user: 'MDQ6VXNlcjM1MTAyOQ=='
      },
      authored_by_committer: false,
      authored_date: new Date('2017-11-30T21:29:59.000Z'),
      changed_files: 3,
      committed_date: new Date('2017-11-30T21:29:59.000Z'),
      committed_via_web: true,
      committer: {
        date: new Date('2017-11-30T21:29:59.000Z'),
        email: 'noreply@github.com',
        name: 'GitHub'
      },
      deletions: 7,
      message:
        "Add EdgeInsets, MediaQuery support for view insets (#13272)\n\n* Add MediaQuery support for view insets\r\n\r\nAlso updates EdgeInsets documentation to reflect WindowPadding's use for\r\nboth padding and view insets.\r\n\r\nSee engine commits:\r\n  flutter/engine#4403\r\n  flutter/engine#4406",
      pushed_date: new Date('2017-11-30T21:30:04.000Z'),
      repository: 'MDEwOlJlcG9zaXRvcnkzMTc5MjgyNA==',
      signature: {
        email: 'noreply@github.com',
        is_valid: true,
        signer: 'MDQ6VXNlcjE5ODY0NDQ3',
        state: 'VALID',
        was_signed_by_git_hub: true
      },
      status: {
        contexts: [
          {
            context: 'continuous-integration/appveyor/branch',
            description: 'AppVeyor build succeeded',
            created_at: new Date('2017-11-30T23:55:13.000Z')
          },
          {
            context: 'continuous-integration/travis-ci/push',
            description: 'The Travis CI build passed',
            created_at: new Date('2017-12-01T00:28:45.000Z')
          }
        ],
        id: 'MDY6U3RhdHVzMzE3OTI4MjQ6ZDk1N2M4ZjA0MDkwMmFhM2ZkNDRiMzY3MTUwYmRlNTZiNjRjZWM4Mw==',
        state: 'SUCCESS'
      }
    };

    const commitInstance = new Commit(data).toJSON();
    expect(commitInstance).toStrictEqual(data);
    expect(Object.keys(commitInstance)).toHaveLength(Object.keys(data).length);
  });
});
