const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@lib': path.resolve(
          __dirname,
          isDev ? 'lib' : 'dist/vue2-sandbox.umd.js'
        ),
        '@lib-src': path.resolve(__dirname, 'lib'),
      },
    },
  },
}
