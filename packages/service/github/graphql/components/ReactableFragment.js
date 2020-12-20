const Fragment = require('../Fragment');

module.exports = class ReactableFragment extends Fragment {
  static get code() {
    return 'reactable';
  }

  static get dependencies() {
    return [];
  }

  static toString() {
    return `
      fragment ${this.code} on Reactable {
        reactionGroups {
          content
          createdAt
          users { totalCount }
        }
      }
    `;
  }
};
