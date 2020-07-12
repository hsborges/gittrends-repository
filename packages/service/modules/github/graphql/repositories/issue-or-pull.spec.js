const issueOrPull = require('./issue-or-pull');

describe('GraphQL Issue or Pull Request details', () => {
  test("it should accept only 'issue' and 'pull' types", () => {
    expect(issueOrPull(null, null)).rejects.toThrow();
  });

  test('it should return an valid issue with users and timeline events', async () => {
    const { issue, users, commits, timeline } = await issueOrPull('MDU6SXNzdWUxNDQ2Mzk4', 'issue');
    expect(issue).toBeDefined();
    expect(issue.number).toEqual(2);
    expect(users.length).toBeGreaterThan(0);
    expect(commits.length).toBeGreaterThan(0);
    expect(timeline.length).toBeGreaterThan(0);
  });

  test('it should return an valid pull request with users and timeline events', async () => {
    const { pull, users, commits, timeline } = await issueOrPull(
      'MDExOlB1bGxSZXF1ZXN0MjgwODY2',
      'pull'
    );
    expect(pull).toBeDefined();
    expect(pull.number).toEqual(1);
    expect(users.length).toBeGreaterThan(0);
    expect(commits.length).toBeGreaterThan(0);
    expect(timeline.length).toBeGreaterThan(0);
  });
});
