import parser from './response-parser';

describe('Parse response received from GitHub API', () => {
  it('should detect GitHub Actors', () => {
    let data: any = { type: 'User', id: 1, value: 1 };
    let result: any = { data: data.id, actors: [data], commits: [], milestones: [] };
    expect(parser(data)).toStrictEqual(result);

    data = { user: { type: 'User', id: 1, value: 1 } };
    result = { data: { user: data.user.id }, actors: [data.user], commits: [], milestones: [] };
    expect(parser(data)).toStrictEqual(result);

    const types = ['Actor', 'User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount'];
    data = types.map((type, index) => ({ type, id: index, value: 1 }));
    result = { data: data.map((d: TObject) => d.id), actors: data, commits: [], milestones: [] };
    expect(parser(data)).toStrictEqual(result);
  });

  it('should spread comments', () => {
    const data = { type: 'CommitCommentThread', comments: { nodes: [{ comment: 'a' }] } };
    const response = {
      data: { type: 'CommitCommentThread', comments: data.comments.nodes },
      actors: [],
      commits: [],
      milestones: []
    };
    expect(parser(data)).toStrictEqual(response);
  });
});
