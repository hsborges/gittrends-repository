/*
 *  Source: https://github.com/jane/gql-compress
 */
import compress from './gql-compress';

describe('compress', (): void => {
  it('should compress a regular query', (): void => {
    const query = compress(`
      query {
        repository(owner:"octocat", name:"Hello-World") {
          issues(last:20, states:CLOSED) {
            edges {
              node {
                title
                url
                labels(first:5) {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const expected =
      // eslint-disable-next-line no-useless-escape
      'query{repository(owner:"octocat",name:"Hello-World"){issues(last:20,states:CLOSED){edges{node{title url labels(first:5){edges{node{name}}}}}}}}';
    expect(compress(query)).toBe(expected);
  });

  it('should handle empty inputs', (): void => {
    expect(compress('')).toBe('');
  });
});
