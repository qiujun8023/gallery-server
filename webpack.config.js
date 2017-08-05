const path = require('path')

module.exports = {
  entry: './assets/main.js',
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
      }]
    }, {
      test: /\.(css|less)$/,
      use: ['style-loader', 'css-loader', 'less-loader']
    }, {
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      use: 'url-loader?limit=81920&name=fonts/[name]-[hash:6].[ext]'
    }, {
      test: /\.(gif|jpg|png)\??.*$/,
      use: 'file-loader?name=images/[name]-[hash:6].[ext]'
    }]
  },
  watch: true
}
