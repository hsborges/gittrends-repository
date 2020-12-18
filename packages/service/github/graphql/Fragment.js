module.exports = class Fragment {
  constructor() {
    this.full = false;
  }

  static get code() {
    throw new Error('Fragment.code() must be override!');
  }

  $include(field) {
    return this.full ? field : '';
  }

  get dependencies() {
    throw new Error('Fragment.dependencies must be override!');
  }

  toString() {
    throw new Error(`${this.constructor.name}.toString() must be override!`);
  }
};
