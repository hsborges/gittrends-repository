module.exports = class Fragment {
  static $include(full, field) {
    return full ? field : '';
  }

  constructor() {
    this.code = this.constructor.code;
    this.dependencies = this.constructor.dependencies;
    this.toString = this.constructor.toString;
  }

  static get code() {
    throw new Error('Fragment.code() must be override!');
  }

  static get dependencies() {
    throw new Error('Fragment.dependencies() must be override!');
  }

  static toString() {
    throw new Error('Fragment.toString() must be override!');
  }
};
