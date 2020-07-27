/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          lighter: 'rgba(104, 178, 177, 0.7)',
          default: 'rgba(104, 178, 177, 0.85)',
          dark: 'rgba(104, 178, 177, 1)',
          100: 'rgba(104, 178, 177, 0.1)',
          200: 'rgba(104, 178, 177, 0.2)',
          300: 'rgba(104, 178, 177, 0.3)',
          400: 'rgba(104, 178, 177, 0.4)',
          500: 'rgba(104, 178, 177, 0.5)'
        },
        secondary: {
          lighter: 'rgba(80, 80, 80, 0.7)',
          default: 'rgba(80, 80, 80, 0.85)',
          dark: 'rgba(80, 80, 80, 1)',
          100: 'rgba(80, 80, 80, 0.1)',
          200: 'rgba(80, 80, 80, 0.2)',
          300: 'rgba(80, 80, 80, 0.3)',
          400: 'rgba(80, 80, 80, 0.4)',
          500: 'rgba(80, 80, 80, 0.5)'
        }
      }
    }
  },
  variants: {},
  plugins: [],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js'
    ]
  }
};
