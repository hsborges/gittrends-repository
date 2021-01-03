/*
 *  Author: Hudson S. Borges
 */
import { get, size, mapValues, omit } from 'lodash';
import { isArray, isPlainObject, uniqBy } from 'lodash';

import normalize from '../helpers/normalize';
import compact from '../helpers/compact';

type IObject = Record<string, unknown>;
type Source = IObject | Array<unknown> | unknown;
export type Response = { data: Source; actors: Array<IObject>; commits: Array<IObject> };

export default function (source: Source): Response {
  const actors: Array<IObject> = [];
  const commits: Array<IObject> = [];

  function recursive(object: Source): Source {
    if (isArray(object)) return object.map(recursive);

    if (isPlainObject(object)) {
      const _object = mapValues(object as IObject, (value, key) => {
        let _result = recursive(value);

        if (key === 'reaction_groups') {
          _result = (_result as Array<{ users_count: number; content: string }>).reduce(
            (memo, r) => ({
              ...memo,
              ...(r.users_count > 0 ? { [r.content.toLowerCase()]: r.users_count } : {})
            }),
            {}
          );
        }

        if (isPlainObject(_result) && size(_result as IObject) === 1) {
          const __result: IObject = { ...(_result as IObject) };
          if (__result.id) _result = __result.id;
          if (__result.name) _result = __result.name;
          if (__result.target) _result = __result.target;
        }

        return _result;
      });

      if (_object.type) {
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
          case 'CommitCommentThread':
          case 'PullRequestReview':
          case 'PullRequestReviewThread':
            // TODO -- fit it latter
            _object.comments = get(_object, 'comments.nodes', []);
            break;
          default:
            break;
        }
      }

      return _object;
    }

    return object;
  }

  return {
    data: compact(recursive(normalize(source))),
    actors: uniqBy(actors, 'id'),
    commits: uniqBy(commits, 'id')
  };
}
