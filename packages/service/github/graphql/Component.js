module.exports = class Component {
  constructor() {
    this.fragments = [];
  }

  toString() {
    throw new Error(`${this.constructor.name}.toString() must be override!`);
  }
};
