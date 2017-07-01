'use strict'

const path = require('path')

module.exports = {
  host: 'localhost',
  port: '8005',
  baseUrl: 'http://localhost:8005/',

  env: 'development',

  session: {
    secret: 'album secret',
    name: 'SESSION'
  },

  redis: {
    host: 'localhost',
    port: 6379,
    keyPrefix: 'album:'
  },

  clientDir: path.join(__dirname, '../../client/dist')
}
