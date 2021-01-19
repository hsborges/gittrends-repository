/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
const withSass = require('@zeit/next-sass');
const lessToJS = require('less-vars-to-js');
const fs = require('fs');
const path = require('path');

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8')
);

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.less'] = () => {};
}

module.exports = withCSS({
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: '[local]___[hash:base64:5]'
  },
  ...withLess(
    withSass({
      lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables,
        importLoaders: 0
      }
    })
  )
});
