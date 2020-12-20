const IssueFragment = require('./IssueFragment');

module.exports = class SimplifiedIssueFragment extends IssueFragment {
  static get code() {
    return 'simplifiedIssue';
  }

  static toString() {
    return super.toString(false);
  }
};
