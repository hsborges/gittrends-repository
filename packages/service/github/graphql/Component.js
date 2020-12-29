/*
 *  Author: Hudson S. Borges
 */
module.exports = class Component {
  $argsToString(args) {
    return Object.keys(args)
      .map((key) => {
        const value = args[key];

        switch (typeof value) {
          case 'number':
            return `${key}: ${value}`;
          case 'string':
            return `${key}: "${value}"`;
          default:
            return '';
        }
      })
      .filter((v) => v)
      .join(', ');
  }

  get fragments() {
    throw new Error('Component.fragments() must be override!');
  }

  toString() {
    throw new Error('Component.toString() must be override!');
  }
};
