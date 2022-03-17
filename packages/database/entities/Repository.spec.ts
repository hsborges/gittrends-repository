import Repository from './Repository';

describe('Test Repository entity.', () => {
  it('should pass', () => {
    const plainRepo = {
      _id: 'MDEwOlJlcG9zaXRvcnkyODQ1NzgyMw==',
      code_of_conduct: 'Other',
      created_at: new Date('2014-12-24T17:49:19.000Z'),
      database_id: 28457823,
      default_branch: 'main',
      delete_branch_on_merge: true,
      description:
        "freeCodeCamp.org's open-source codebase and curriculum. Learn to code for free.",
      disk_usage: 302230,
      forks: 28185,
      funding_links: [
        { platform: 'GITHUB', url: 'https://github.com/freeCodeCamp' },
        { platform: 'PATREON', url: 'https://patreon.com/freecodecamp' },
        { platform: 'CUSTOM', url: 'www.freecodecamp.org/donate' }
      ],
      has_issues_enabled: true,
      has_projects_enabled: false,
      has_wiki_enabled: false,
      homepage_url: 'https://contribute.freecodecamp.org',
      is_archived: false,
      is_blank_issues_enabled: true,
      is_disabled: false,
      is_empty: false,
      is_fork: false,
      is_in_organization: true,
      is_locked: false,
      is_mirror: false,
      is_private: false,
      is_security_policy_enabled: true,
      is_template: false,
      is_user_configuration_repository: false,
      license_info: 'BSD 3-Clause "New" or "Revised" License',
      merge_commit_allowed: false,
      name: 'freeCodeCamp',
      name_with_owner: 'freeCodeCamp/freeCodeCamp',
      open_graph_image_url: 'https://avatars.githubusercontent.com/u/9892522?s=400&v=4',
      owner: 'MDEyOk9yZ2FuaXphdGlvbjk4OTI1MjI=',
      primary_language: 'JavaScript',
      pushed_at: new Date('2022-03-14T00:56:01.000Z'),
      rebase_merge_allowed: true,
      squash_merge_allowed: true,
      stargazers: 342082,
      updated_at: new Date('2022-03-14T01:33:15.000Z'),
      url: 'https://github.com/freeCodeCamp/freeCodeCamp',
      uses_custom_open_graph_image: false,
      languages: [
        { language: 'JavaScript', size: 901199 },
        { language: 'CSS', size: 114892 },
        { language: 'HTML', size: 737 },
        { language: 'Shell', size: 3154 },
        { language: 'Less', size: 36 },
        { language: 'EJS', size: 2153 },
        { language: 'Dockerfile', size: 2759 },
        { language: 'TypeScript', size: 881193 }
      ],
      repository_topics: [
        'learn-to-code',
        'nonprofits',
        'programming',
        'nodejs',
        'react',
        'd3',
        'careers',
        'education',
        'teachers',
        'javascript',
        'certification',
        'curriculum',
        'math',
        'community',
        'freecodecamp',
        'hacktoberfest'
      ]
    };

    const repo = new Repository(plainRepo);
    expect(Object.keys(repo.toJSON())).toEqual(Object.keys(plainRepo));
    expect(repo.toJSON()).toStrictEqual(plainRepo);
  });
});
