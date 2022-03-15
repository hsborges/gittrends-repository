import Actor from './Actor';

describe('Test Actor entity.', () => {
  it('should parse User account type', () => {
    const data = {
      _id: 'MDQ6VXNlcjE1MDMzMA==',
      type: 'User',
      login: 'getify',
      avatar_url:
        'https://avatars.githubusercontent.com/u/150330?u=41aa48771028d34bcf025eefe919bf75fbda77d4&v=4',

      bio: 'I like to explore JS and FP techniques. Helping build a culture of engineering excellence for my employer.',
      company: 'Getify Solutions',
      created_at: new Date('2009-11-08T06:56:21.000Z'),
      database_id: 150330,
      email: 'getify@gmail.com',
      followers_count: 34601,
      following_count: 2,
      gists_count: 388,
      is_bounty_hunter: false,
      is_campus_expert: false,
      is_developer_program_member: false,
      is_employee: false,
      is_hireable: true,
      is_site_admin: false,
      location: 'Austin, TX',
      name: 'Kyle Simpson',
      projects_count: 0,
      projects_url: 'https://github.com/users/getify/projects',
      repositories_count: 59,
      repositories_contributed_to_count: 0,
      starred_repositories_count: 0,
      status: {
        created_at: new Date('2019-01-11T16:11:39.000Z'),
        emoji: ':thumbs_up:',
        expires_at: new Date('2019-01-12T16:11:39.000Z'),
        indicates_limited_availability: false,
        message: 'Just coding',
        updated_at: new Date('2019-01-11T16:11:39.000Z')
      },
      twitter_username: 'getify',
      updated_at: new Date('2022-02-17T00:10:11.000Z'),
      watching_count: 0,
      website_url: 'http://getify.me'
    };

    const actorInstance = new Actor(data).toJSON();
    expect(actorInstance).toStrictEqual(data);
    expect(Object.keys(actorInstance)).toHaveLength(Object.keys(data).length);
  });

  it('should parse Organization accounts', () => {
    const data = {
      _id: 'MDEyOk9yZ2FuaXphdGlvbjYxNTQ3MjI=',
      type: 'Organization',
      login: 'microsoft',
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',

      created_at: new Date('2013-12-10T19:06:48.000Z'),
      database_id: 6154722,
      description: 'Open source projects and samples from Microsoft',
      email: 'opensource@microsoft.com',
      is_verified: true,
      location: 'Redmond, WA',
      name: 'Microsoft',
      repositories_count: 4759,
      teams_count: 0,
      twitter_username: 'OpenAtMicrosoft',
      updated_at: new Date('2021-03-18T18:50:55.000Z'),
      website_url: 'https://opensource.microsoft.com'
    };

    const actorInstance = new Actor(data).toJSON();
    expect(actorInstance).toStrictEqual(data);
    expect(Object.keys(actorInstance)).toHaveLength(Object.keys(data).length);
  });

  it('should parse Bot accounts', () => {
    const data = {
      _id: 'MDM6Qm90Mjc4NTYyOTc=',
      avatar_url: 'https://avatars.githubusercontent.com/in/2141?v=4',
      login: 'dependabot-preview',
      type: 'Bot',
      created_at: new Date('2017-04-21T12:03:36.000Z'),
      database_id: 27856297,
      updated_at: new Date('2019-05-23T08:20:18.000Z')
    };

    const actorInstance = new Actor(data).toJSON();
    expect(actorInstance).toStrictEqual(data);
    expect(Object.keys(actorInstance)).toHaveLength(Object.keys(data).length);
  });
});
