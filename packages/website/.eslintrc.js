module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: [
    '../../.eslintrc.js',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended'
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
    }
  },
  plugins: [],
  rules: {
    'jsx-a11y/anchor-is-valid': 'off'
  }
};
