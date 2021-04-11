const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    resolve: {
      alias: {
        // make @lib alised to self when testing in production mode, so import will be
        // the umd build specified in package.main
        '@lib': path.resolve(__dirname, isDev ? 'lib' : ''),
        // we use require.context to load library components for testing, and the UMD build only
        // expose necessary componnets for the runtime, so we need @lib-src for such purpose
        '@lib-src': path.resolve(__dirname, 'lib'),
      },
    },
  },
}
