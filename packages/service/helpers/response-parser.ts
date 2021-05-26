/*
 *  Author: Hudson S. Borges
 */
import { get, mapValues, omit } from 'lodash';
import { isArray, isPlainObject, uniqBy } from 'lodash';

export type Response = {
  data: any;
  actors: Array<TObject>;
  commits: Array<TObject>;
  milestones: Array<TObject>;
};

export default function (source: any): Response {
  const actors: Array<TObject> = [];
  const commits: Array<TObject> = [];
  const milestones: Array<TObject> = [];

  function recursive(object: any): any {
    if (isArray(object)) return object.map(recursive);

    if (isPlainObject(object)) {
      const _object = mapValues(object, recursive);

      switch (_object.type) {
        case 'Actor':
        case 'User':
        case 'Organization':
        case 'Mannequin':
        case 'Bot':
        case 'EnterpriseUserAccount':
          actors.push(_object);
          return _object.id;
        case 'Commit':
          commits.push(omit(_object, 'type'));
          return _object.id;
        case 'Milestone':
          milestones.push(omit(_object, 'type'));
          return _object.id;
        case 'CommitCommentThread':
        case 'PullRequestReview':
        case 'PullRequestReviewThread':
          _object.comments = get(_object, 'comments.nodes', []);
          break;
      }

      return _object;
    }

    return object;
  }

  return {
    data: recursive(source),
    actors: uniqBy(actors, 'id'),
    commits: uniqBy(commits, 'id'),
    milestones: uniqBy(milestones, 'id')
  };
}
