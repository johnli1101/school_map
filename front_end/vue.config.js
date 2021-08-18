module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /public/],
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
}