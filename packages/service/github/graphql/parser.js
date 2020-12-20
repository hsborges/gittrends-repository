/*
 *  Author: Hudson S. Borges
 */
const { get, set, snakeCase, size, reduce, omit } = require('lodash');
const { isArray, assignWith, isPlainObject, uniqBy } = require('lodash');

const compact = require('../../helpers/compact.js');

module.exports = function (object) {
  if (isArray(object))
    return compact(
      object
        .map(module.exports)
        .reduce((m, v) => assignWith(m, v, (_o, _s) => (_o || []).concat(_s)), {})
    );

  if (isPlainObject(object)) {
    const _object = reduce(
      object,
      (m, v, k) => {
        const _result = module.exports(v);

        if (k === 'reaction_groups') {
          _result.data = _result.data.reduce(
            (memo, r) => ({
              ...memo,
              ...(r.users_count > 0 ? { [r.content.toLowerCase()]: r.users_count } : {})
            }),
            {}
          );
        }

        if (isPlainObject(_result.data) && size(_result.data) === 1) {
          if (_result.data.id) _result.data = _result.data.id;
          if (_result.data.name) _result.data = _result.data.name;
          if (_result.data.target) _result.data = _result.data.target;
        }

        return {
          ...assignWith(m, _result, (o, s) => (isArray(o) ? o.concat(s || []) : o)),
          data: compact({ ...m.data, [k]: _result.data })
        };
      },
      { data: {} }
    );

    if (_object.data.type) {
      switch (_object.data.type) {
        case 'Actor':
        case 'User':
        case 'Organization':
        case 'Mannequin':
        case 'Bot':
        case 'EnterpriseUserAccount':
          _object.users = (_object.users || []).concat(_object.data);
          return { ..._object, data: _object.data.id };
        case 'Commit':
          _object.commits = (_object.commits || []).concat(omit(_object.data, 'type'));
          return { ..._object, data: _object.data.id };
        case 'CommitCommentThread':
        case 'PullRequestReview':
        case 'PullRequestReviewThread': {
          const comments = get(_object, 'data.comments.nodes', []).map((c) => ({
            ...c,
            [snakeCase(_object.data.type)]: _object.data.id
          }));
          const commentsIds = comments.map((c) => c.id);
          _object.comments = (_object.comments || []).concat(comments);
          set(_object, 'data.comments', commentsIds);
          break;
        }
        default:
          break;
      }
    }

    return {
      ..._object,
      users: uniqBy(_object.users || [], 'id'),
      commits: uniqBy(_object.commits || [], 'id')
    };
  }

  return { data: object };
};
