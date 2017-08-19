const path = require('path')

module.exports = {
  entry: ['babel-polyfill', './assets/index.js'],
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }],
      exclude: [
        path.resolve(__dirname, 'node_modules')
      ]
    }, {
      test: /\.(css|less)$/,
      use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
    }, {
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      use: 'url-loader?limit=81920&name=font/[name]-[hash:6].[ext]'
    }, {
      test: /favicon\.(png|ico|icon)$/,
      use: 'file-loader?name=img/[name].[ext]'
    }, {
      test: /\.(gif|jpg|png)\??.*$/,
      use: 'file-loader?name=img/[name]-[hash:6].[ext]',
      exclude: [
        /favicon\.(png|ico|icon)$/
      ]
    }]
  },
  watch: true
}
