module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'func-names': 'off',
    'object-curly-newline': 'off',
    'max-len': 'off',
    'no-console': 'off',
    'no-process-exit': 'off',
    'no-await-in-loop': 'off',
    'no-loop-func': 'off',
    'no-return-assign': 'off'
  }
};
