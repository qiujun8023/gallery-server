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
      test: /\.(css|less)$/,
      use: ['style-loader', 'css-loader', 'less-loader']
    }, {
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      use: 'url-loader?limit=81920&name=fonts/[name]-[hash:6].[ext]'
    }, {
      test: /\.(gif|jpg|png|svg)\??.*$/,
      use: 'file-loader?name=images/[name]-[hash:6].[ext]'
    }]
  },
  watch: true
}
