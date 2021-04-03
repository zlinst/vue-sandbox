const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, 'lib'),
      },
    },
  },
}
