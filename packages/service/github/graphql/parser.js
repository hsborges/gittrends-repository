/*
 *  Author: Hudson S. Borges
 */
const { get, size, mapValues, omit } = require('lodash');
const { isArray, isPlainObject, uniqBy } = require('lodash');

const normalize = require('../../helpers/normalize.js');
const compact = require('../../helpers/compact.js');

module.exports = function (source) {
  const actors = [];
  const commits = [];

  function recursive(object) {
    if (isArray(object)) return object.map(recursive);

    if (isPlainObject(object)) {
      let _object = mapValues(object, (value, key) => {
        let _result = recursive(value);

        if (key === 'reaction_groups') {
          _result = _result.reduce(
            (memo, r) => ({
              ...memo,
              ...(r.users_count > 0 ? { [r.content.toLowerCase()]: r.users_count } : {})
            }),
            {}
          );
        }

        if (isPlainObject(_result) && size(_result) === 1) {
          if (_result.id) _result = _result.id;
          if (_result.name) _result = _result.name;
          if (_result.target) _result = _result.target;
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
            _object = _object.id;
            break;
          case 'Commit':
            commits.push(omit(_object, 'type'));
            _object = _object.id;
            break;
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

  return compact({
    data: recursive(normalize(source)),
    actors: uniqBy(actors, 'id'),
    commits: uniqBy(commits, 'id')
  });
};
