const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-sandbox/' : '/',
  css: {
    extract: false,
  },
  configureWebpack: {
    resolve: {
      alias: {
        // make @lib alised to self when testing in production mode, so import will be
        // the umd build specified in package.main
        '@lib': path.resolve(
          __dirname,
          process.env.VUE_SANDBOX_ENV === 'production' ? '' : 'lib'
        ),
        // we use require.context to load library components for testing, and the UMD build only
        // expose necessary componnets for the runtime, so we need @lib-src for such purpose
        '@lib-src': path.resolve(__dirname, 'lib'),
      },
    },
  },
}
