module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: es6,
    ecmaFeatures: { legacyDecorators: true }
  },
  env: {
    es6: true,
    node: true,
    jest: true
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'warn'
  }
};
