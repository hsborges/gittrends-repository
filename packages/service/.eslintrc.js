module.exports = {
  env: {
    commonjs: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:node/recommended',
    'prettier',
    'prettier/standard'
  ],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
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
